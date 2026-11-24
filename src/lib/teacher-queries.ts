import { getDb, hydrateQuestion, hydrateTopic, parseJsonSafe } from "./db";
import {
  QUESTION_TYPE_LABELS,
  type ClassRecord,
  type ManagedStudentSummary,
  type QuestionType,
  type TeacherAnalyticsPayload,
  type TeacherStudentProgressPayload,
} from "./types";

export async function buildTeacherAnalytics(
  teacherId: number,
  requestedClassId?: number | null
): Promise<
  | { ok: true; data: TeacherAnalyticsPayload }
  | { ok: false; status: number; error: string }
> {
  const db = await getDb();

  const classes = await db.queryAll<{
    id: number;
    name: string;
    description: string;
    join_code: string;
    teacher_id: number;
    created_at: string;
    member_count: number;
    assignment_count: number;
  }>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) AS member_count,
       (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS assignment_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.id ASC`,
    [teacherId]
  );

  if (requestedClassId !== undefined && requestedClassId !== null) {
    const owned = classes.find((c) => Number(c.id) === Number(requestedClassId));
    if (!owned) {
      return { ok: false, status: 403, error: "無權存取非本人管理的班級分析資料。" };
    }
  }

  const targetClassIds = requestedClassId
    ? [Number(requestedClassId)]
    : classes.map((c) => Number(c.id));

  const topicRows = (
    await db.queryAll<Record<string, unknown>>("SELECT * FROM topics ORDER BY sort_order ASC")
  ).map(hydrateTopic);

  const allTypes: QuestionType[] = [
    "trace",
    "fill",
    "debug",
    "counterexample",
    "static",
    "complexity",
  ];

  const emptyMatrix = () =>
    topicRows.map((t) => {
      const cells = {} as Record<
        QuestionType,
        { attempts: number; correct: number; accuracy: number | null }
      >;
      for (const qt of allTypes) {
        cells[qt] = { attempts: 0, correct: 0, accuracy: null };
      }
      return {
        topicId: t.id,
        topicSlug: t.slug,
        topicTitle: t.title,
        cells,
      };
    });

  if (targetClassIds.length === 0) {
    return {
      ok: true,
      data: {
        classes,
        selectedClassId: requestedClassId ?? null,
        kpis: { studentCount: 0, totalAttempts: 0, accuracy: null, activeAssignments: 0 },
        matrix: emptyMatrix(),
        weakestQuestions: [],
        studentOverview: [],
        recentAttempts: [],
      },
    };
  }

  const classPlaceholders = targetClassIds.map(() => "?").join(",");

  const memberRows = await db.queryAll<{
    student_id: number;
    display_name: string;
    username: string;
    class_id: number;
    class_name: string;
  }>(
    `SELECT cm.student_id, u.display_name, u.username, cm.class_id, c.name AS class_name
     FROM class_members cm
     JOIN users u ON u.id = cm.student_id
     JOIN classes c ON c.id = cm.class_id
     WHERE cm.class_id IN (${classPlaceholders}) AND u.role = 'student'
     ORDER BY c.id ASC, u.id ASC`,
    targetClassIds
  );

  const uniqueStudentIds = Array.from(new Set(memberRows.map((m) => Number(m.student_id))));

  const activeAssignmentsRow = await db.queryOne<{ cnt: number }>(
    `SELECT COUNT(*) AS cnt FROM assignments WHERE class_id IN (${classPlaceholders}) AND is_published = 1`,
    targetClassIds
  );

  if (uniqueStudentIds.length === 0) {
    return {
      ok: true,
      data: {
        classes,
        selectedClassId: requestedClassId ?? null,
        kpis: {
          studentCount: 0,
          totalAttempts: 0,
          accuracy: null,
          activeAssignments: Number(activeAssignmentsRow?.cnt ?? 0),
        },
        matrix: emptyMatrix(),
        weakestQuestions: [],
        studentOverview: [],
        recentAttempts: [],
      },
    };
  }

  const stuPlaceholders = uniqueStudentIds.map(() => "?").join(",");
  const attemptRows = await db.queryAll<{
    id: number;
    user_id: number;
    question_id: number;
    selected_option: "A" | "B" | "C" | "D";
    is_correct: number;
    created_at: string;
  }>(
    `SELECT id, user_id, question_id, selected_option, is_correct, created_at
     FROM attempts
     WHERE user_id IN (${stuPlaceholders})
     ORDER BY id DESC`,
    uniqueStudentIds
  );

  const questionRows = (
    await db.queryAll<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title
       FROM questions q
       JOIN topics t ON t.id = q.topic_id`
    )
  ).map(hydrateQuestion);

  const qMap = new Map(questionRows.map((q) => [q.id, q]));

  const totalAttempts = attemptRows.length;
  const totalCorrect = attemptRows.filter((a) => Boolean(a.is_correct)).length;

  const matrix = emptyMatrix();
  const matrixByTopicId = new Map(matrix.map((m) => [m.topicId, m]));

  const qStats = new Map<
    number,
    { attempts: number; wrong: number; wrongCounts: Record<string, number> }
  >();

  for (const att of attemptRows) {
    const q = qMap.get(Number(att.question_id));
    if (!q) continue;

    const mRow = matrixByTopicId.get(q.topic_id);
    if (mRow) {
      const cell = mRow.cells[q.question_type];
      cell.attempts += 1;
      if (att.is_correct) cell.correct += 1;
      cell.accuracy = Math.round((cell.correct / cell.attempts) * 100);
    }

    const st = qStats.get(q.id) ?? { attempts: 0, wrong: 0, wrongCounts: {} };
    st.attempts += 1;
    if (!att.is_correct) {
      st.wrong += 1;
      st.wrongCounts[att.selected_option] = (st.wrongCounts[att.selected_option] ?? 0) + 1;
    }
    qStats.set(q.id, st);
  }

  const weakestQuestions: TeacherAnalyticsPayload["weakestQuestions"] = [];
  for (const [qId, st] of qStats.entries()) {
    if (st.attempts === 0 || st.wrong === 0) continue;
    const q = qMap.get(qId);
    if (!q) continue;

    let topWrongOption: "A" | "B" | "C" | "D" | null = null;
    let maxWrongOptCount = -1;
    for (const [opt, cnt] of Object.entries(st.wrongCounts)) {
      if (cnt > maxWrongOptCount) {
        maxWrongOptCount = cnt;
        topWrongOption = opt as "A" | "B" | "C" | "D";
      }
    }
    const topMisconception =
      q.options.find((o) => o.key === topWrongOption)?.misconception ?? null;

    weakestQuestions.push({
      questionId: q.id,
      officialRef: q.official_ref,
      title: q.title,
      topicTitle: q.topic_title ?? "",
      questionType: q.question_type,
      attempts: st.attempts,
      wrongCount: st.wrong,
      errorRate: Math.round((st.wrong / st.attempts) * 100),
      topWrongOption,
      topMisconception,
    });
  }

  weakestQuestions.sort((a, b) => b.errorRate - a.errorRate || b.wrongCount - a.wrongCount);

  const studentOverview: TeacherAnalyticsPayload["studentOverview"] = memberRows.map((m) => {
    const sAttempts = attemptRows.filter((a) => Number(a.user_id) === Number(m.student_id));
    const sCorrect = sAttempts.filter((a) => Boolean(a.is_correct)).length;
    const solvedDistinct = new Set(
      sAttempts.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
    ).size;
    return {
      studentId: Number(m.student_id),
      displayName: m.display_name,
      username: m.username,
      className: m.class_name,
      attempts: sAttempts.length,
      solvedDistinct,
      accuracy: sAttempts.length > 0 ? Math.round((sCorrect / sAttempts.length) * 100) : null,
      lastActiveAt: sAttempts[0]?.created_at ?? null,
    };
  });

  const memberByStudentId = new Map<number, { displayName: string; className: string }>();
  for (const m of memberRows) {
    if (!memberByStudentId.has(Number(m.student_id))) {
      memberByStudentId.set(Number(m.student_id), {
        displayName: m.display_name,
        className: m.class_name,
      });
    }
  }

  const recentAttempts: TeacherAnalyticsPayload["recentAttempts"] = attemptRows
    .slice(0, 12)
    .map((att) => {
      const stu = memberByStudentId.get(Number(att.user_id));
      const q = qMap.get(Number(att.question_id));
      return {
        id: Number(att.id),
        studentName: stu?.displayName ?? "學生",
        className: stu?.className ?? "",
        questionTitle: q?.title ?? `題目 #${att.question_id}`,
        officialRef: q?.official_ref ?? null,
        selectedOption: att.selected_option,
        isCorrect: Boolean(att.is_correct),
        createdAt: att.created_at,
      };
    });

  return {
    ok: true,
    data: {
      classes,
      selectedClassId: requestedClassId ?? null,
      kpis: {
        studentCount: uniqueStudentIds.length,
        totalAttempts,
        accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null,
        activeAssignments: Number(activeAssignmentsRow?.cnt ?? 0),
      },
      matrix,
      weakestQuestions: weakestQuestions.slice(0, 6),
      studentOverview,
      recentAttempts,
    },
  };
}

export async function listTeacherAssignments(teacherId: number) {
  const db = await getDb();
  const assignRows = await db.queryAll<{
    id: number;
    class_id: number;
    class_name: string;
    title: string;
    description: string;
    question_ids_json: string;
    due_date: string | null;
    is_published: number;
    created_by: number;
    created_at: string;
  }>(
    `SELECT a.*, c.name AS class_name
     FROM assignments a
     JOIN classes c ON c.id = a.class_id
     WHERE c.teacher_id = ?
     ORDER BY a.id DESC`,
    [teacherId]
  );

  const results = [];
  for (const a of assignRows) {
    const qIds = parseJsonSafe<number[]>(a.question_ids_json, []);
    const students = await db.queryAll<{
      student_id: number;
      display_name: string;
      username: string;
    }>(
      `SELECT cm.student_id, u.display_name, u.username
       FROM class_members cm
       JOIN users u ON u.id = cm.student_id
       WHERE cm.class_id = ?
       ORDER BY u.id ASC`,
      [a.class_id]
    );

    const progress = [];
    for (const s of students) {
      if (qIds.length === 0) {
        progress.push({
          studentId: Number(s.student_id),
          displayName: s.display_name,
          username: s.username,
          completedCount: 0,
          correctCount: 0,
        });
        continue;
      }
      const placeholders = qIds.map(() => "?").join(",");
      const row = await db.queryOne<{ completed: number; correct: number }>(
        `SELECT
          COUNT(DISTINCT question_id) AS completed,
          COUNT(DISTINCT CASE WHEN is_correct = 1 THEN question_id END) AS correct
         FROM attempts
         WHERE user_id = ? AND question_id IN (${placeholders})`,
        [s.student_id, ...qIds]
      );
      progress.push({
        studentId: Number(s.student_id),
        displayName: s.display_name,
        username: s.username,
        completedCount: Number(row?.completed ?? 0),
        correctCount: Number(row?.correct ?? 0),
      });
    }

    results.push({
      id: Number(a.id),
      class_id: Number(a.class_id),
      class_name: a.class_name,
      title: a.title,
      description: a.description,
      question_ids: qIds,
      due_date: a.due_date,
      is_published: Boolean(a.is_published),
      created_by: Number(a.created_by),
      created_at: a.created_at,
      student_progress: progress,
    });
  }

  return results;
}

export async function listTeacherManagedStudents(
  teacherId: number,
  requestedClassId?: number | null
): Promise<
  | { ok: true; classes: ClassRecord[]; students: ManagedStudentSummary[] }
  | { ok: false; status: number; error: string }
> {
  const db = await getDb();
  const classes = await db.queryAll<ClassRecord>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) AS member_count,
       (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS assignment_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.id ASC`,
    [teacherId]
  );

  if (requestedClassId !== undefined && requestedClassId !== null) {
    const owned = classes.find((c) => Number(c.id) === Number(requestedClassId));
    if (!owned) {
      return { ok: false, status: 403, error: "無權存取非本人管理的班級名冊。" };
    }
  }

  const targetClassIds = requestedClassId
    ? [Number(requestedClassId)]
    : classes.map((c) => Number(c.id));

  if (targetClassIds.length === 0) {
    return { ok: true, classes, students: [] };
  }

  const classPlaceholders = targetClassIds.map(() => "?").join(",");
  const memberRows = await db.queryAll<{
    student_id: number;
    username: string;
    display_name: string;
    user_created_at: string;
    class_id: number;
    class_name: string;
    join_code: string;
  }>(
    `SELECT u.id AS student_id, u.username, u.display_name, u.created_at AS user_created_at,
            c.id AS class_id, c.name AS class_name, c.join_code
     FROM class_members cm
     JOIN users u ON u.id = cm.student_id
     JOIN classes c ON c.id = cm.class_id
     WHERE cm.class_id IN (${classPlaceholders}) AND u.role = 'student'
     ORDER BY u.id DESC, c.id ASC`,
    targetClassIds
  );

  if (memberRows.length === 0) {
    return { ok: true, classes, students: [] };
  }

  const ownedClassIds = classes.map((c) => Number(c.id));
  const allQuestionRows = (
    await db.queryAll<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       WHERE q.is_published = 1 AND t.is_published = 1`
    )
  ).map(hydrateQuestion);

  const teacherAccessibleQs = allQuestionRows.filter(
    (q) => q.class_id === null || ownedClassIds.includes(Number(q.class_id))
  );
  const accessibleQById = new Map(teacherAccessibleQs.map((q) => [q.id, q]));

  // Map student -> full set of owned classes from all classes owned by teacher
  const studentMap = new Map<
    number,
    {
      id: number;
      username: string;
      display_name: string;
      created_at: string;
      classes: Array<{ id: number; name: string; join_code: string }>;
    }
  >();

  for (const r of memberRows) {
    const sid = Number(r.student_id);
    let entry = studentMap.get(sid);
    if (!entry) {
      entry = {
        id: sid,
        username: r.username,
        display_name: r.display_name,
        created_at: r.user_created_at,
        classes: [],
      };
      studentMap.set(sid, entry);
    }
    if (!entry.classes.some((c) => c.id === Number(r.class_id))) {
      entry.classes.push({
        id: Number(r.class_id),
        name: r.class_name,
        join_code: r.join_code,
      });
    }
  }

  const studentIds = Array.from(studentMap.keys());
  // Also ensure we fetch all owned class memberships if filtered by one class
  if (requestedClassId && classes.length > 1) {
    const allOwnedPh = ownedClassIds.map(() => "?").join(",");
    const stuPh = studentIds.map(() => "?").join(",");
    const fullOwnedMemberships = await db.queryAll<{
      student_id: number;
      class_id: number;
      class_name: string;
      join_code: string;
    }>(
      `SELECT cm.student_id, c.id AS class_id, c.name AS class_name, c.join_code
       FROM class_members cm
       JOIN classes c ON c.id = cm.class_id
       WHERE cm.class_id IN (${allOwnedPh}) AND cm.student_id IN (${stuPh})
       ORDER BY c.id ASC`,
      [...ownedClassIds, ...studentIds]
    );
    for (const fm of fullOwnedMemberships) {
      const entry = studentMap.get(Number(fm.student_id));
      if (entry && !entry.classes.some((c) => c.id === Number(fm.class_id))) {
        entry.classes.push({
          id: Number(fm.class_id),
          name: fm.class_name,
          join_code: fm.join_code,
        });
      }
    }
  }

  const stuPlaceholders = studentIds.map(() => "?").join(",");
  const attemptRows = await db.queryAll<{
    id: number;
    user_id: number;
    question_id: number;
    is_correct: number;
    created_at: string;
  }>(
    `SELECT id, user_id, question_id, is_correct, created_at
     FROM attempts
     WHERE user_id IN (${stuPlaceholders})
     ORDER BY id DESC`,
    studentIds
  );

  const students: ManagedStudentSummary[] = Array.from(studentMap.values()).map((stu) => {
    const stuClassIds = stu.classes.map((c) => c.id);
    const stuVisibleQs = teacherAccessibleQs.filter(
      (q) => q.class_id === null || stuClassIds.includes(Number(q.class_id))
    );
    const stuAttempts = attemptRows.filter(
      (a) =>
        Number(a.user_id) === stu.id && accessibleQById.has(Number(a.question_id))
    );
    const correctCount = stuAttempts.filter((a) => Boolean(a.is_correct)).length;
    const wrongCount = stuAttempts.length - correctCount;
    const solvedDistinct = new Set(
      stuAttempts.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
    ).size;

    return {
      id: stu.id,
      username: stu.username,
      display_name: stu.display_name,
      created_at: stu.created_at,
      classes: stu.classes,
      total_attempts: stuAttempts.length,
      solved_distinct: solvedDistinct,
      total_questions: stuVisibleQs.length,
      accuracy:
        stuAttempts.length > 0
          ? Math.round((correctCount / stuAttempts.length) * 100)
          : null,
      wrong_count: wrongCount,
      last_attempt_at: stuAttempts[0]?.created_at ?? null,
    };
  });

  return { ok: true, classes, students };
}

export async function buildTeacherStudentProgress(
  teacherId: number,
  studentId: number
): Promise<TeacherStudentProgressPayload | null> {
  const db = await getDb();
  const userRow = await db.queryOne<{
    id: number;
    username: string;
    display_name: string;
    role: string;
    created_at: string;
  }>("SELECT id, username, display_name, role, created_at FROM users WHERE id = ?", [
    studentId,
  ]);
  if (!userRow || userRow.role !== "student") return null;

  const allClassRows = await db.queryAll<{
    class_id: number;
    teacher_id: number;
    name: string;
    join_code: string;
  }>(
    `SELECT cm.class_id, c.teacher_id, c.name, c.join_code
     FROM class_members cm
     JOIN classes c ON c.id = cm.class_id
     WHERE cm.student_id = ?
     ORDER BY c.id ASC`,
    [studentId]
  );

  const ownedClasses = allClassRows
    .filter((c) => Number(c.teacher_id) === teacherId)
    .map((c) => ({
      id: Number(c.class_id),
      name: c.name,
      join_code: c.join_code,
    }));

  if (ownedClasses.length === 0) return null;

  const otherTeacherClassCount = allClassRows.filter(
    (c) => Number(c.teacher_id) !== teacherId
  ).length;
  const ownedClassIds = ownedClasses.map((c) => c.id);

  const topicRows = (
    await db.queryAll<Record<string, unknown>>(
      "SELECT * FROM topics WHERE is_published = 1 ORDER BY sort_order ASC"
    )
  ).map(hydrateTopic);

  const allQuestions = (
    await db.queryAll<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       WHERE q.is_published = 1 AND t.is_published = 1
       ORDER BY t.sort_order ASC, q.id ASC`
    )
  ).map(hydrateQuestion);

  const visibleQuestions = allQuestions.filter(
    (q) => q.class_id === null || ownedClassIds.includes(Number(q.class_id))
  );
  const qById = new Map(visibleQuestions.map((q) => [q.id, q]));

  const rawAttempts = await db.queryAll<{
    id: number;
    question_id: number;
    selected_option: "A" | "B" | "C" | "D";
    is_correct: number;
    duration_sec: number;
    created_at: string;
  }>(
    "SELECT id, question_id, selected_option, is_correct, duration_sec, created_at FROM attempts WHERE user_id = ? ORDER BY id DESC",
    [studentId]
  );

  const attemptRows = rawAttempts.filter((a) => qById.has(Number(a.question_id)));
  const totalAttempts = attemptRows.length;
  const correctAttempts = attemptRows.filter((a) => Boolean(a.is_correct)).length;
  const solvedSet = new Set(
    attemptRows.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
  );
  const avgDurationSec =
    totalAttempts > 0
      ? Math.round(
          attemptRows.reduce((acc, a) => acc + Number(a.duration_sec || 0), 0) /
            totalAttempts
        )
      : 0;

  const topicMastery = topicRows.map((t) => {
    const tQs = visibleQuestions.filter((q) => q.topic_id === t.id);
    const tQIds = new Set(tQs.map((q) => q.id));
    const tAtts = attemptRows.filter((a) => tQIds.has(Number(a.question_id)));
    const tCorrect = tAtts.filter((a) => Boolean(a.is_correct)).length;
    const distinctAttempted = new Set(tAtts.map((a) => Number(a.question_id))).size;
    const distinctSolved = new Set(
      tAtts.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
    ).size;

    return {
      topicId: t.id,
      slug: t.slug,
      title: t.title,
      totalQuestions: tQs.length,
      solvedCorrect: distinctSolved,
      attemptedDistinct: distinctAttempted,
      accuracy: tAtts.length > 0 ? Math.round((tCorrect / tAtts.length) * 100) : null,
    };
  });

  const allTypes: QuestionType[] = [
    "trace",
    "fill",
    "debug",
    "counterexample",
    "static",
    "complexity",
  ];
  const typeMastery = allTypes.map((qt) => {
    const qtAtts = attemptRows.filter(
      (a) => qById.get(Number(a.question_id))?.question_type === qt
    );
    const qtCorrect = qtAtts.filter((a) => Boolean(a.is_correct)).length;
    return {
      type: qt,
      label: QUESTION_TYPE_LABELS[qt],
      attempts: qtAtts.length,
      correct: qtCorrect,
      accuracy: qtAtts.length > 0 ? Math.round((qtCorrect / qtAtts.length) * 100) : null,
    };
  });

  const classPh = ownedClassIds.map(() => "?").join(",");
  const assignRows = await db.queryAll<{
    id: number;
    class_id: number;
    class_name: string;
    title: string;
    due_date: string | null;
    question_ids_json: string;
  }>(
    `SELECT a.id, a.class_id, c.name AS class_name, a.title, a.due_date, a.question_ids_json
     FROM assignments a
     JOIN classes c ON c.id = a.class_id
     WHERE a.class_id IN (${classPh})
     ORDER BY a.id DESC`,
    ownedClassIds
  );

  const assignments = assignRows.map((a) => {
    const qIds = parseJsonSafe<number[]>(a.question_ids_json, []);
    const qSet = new Set(qIds);
    const relevant = attemptRows.filter((att) => qSet.has(Number(att.question_id)));
    const completedSet = new Set(relevant.map((att) => Number(att.question_id)));
    const correctSet = new Set(
      relevant.filter((att) => Boolean(att.is_correct)).map((att) => Number(att.question_id))
    );
    return {
      id: Number(a.id),
      class_id: Number(a.class_id),
      class_name: a.class_name,
      title: a.title,
      due_date: a.due_date,
      question_count: qIds.length,
      completed_count: completedSet.size,
      correct_count: correctSet.size,
    };
  });

  const recentAttempts = attemptRows.slice(0, 40).map((att) => {
    const q = qById.get(Number(att.question_id))!;
    return {
      id: Number(att.id),
      question_id: q.id,
      official_ref: q.official_ref,
      title: q.title,
      topic_title: q.topic_title ?? "",
      question_type: q.question_type,
      selected_option: att.selected_option,
      correct_option: q.correct_option,
      is_correct: Boolean(att.is_correct),
      duration_sec: Number(att.duration_sec ?? 0),
      created_at: att.created_at,
    };
  });

  const attemptCountByQ = new Map<number, number>();
  for (const att of attemptRows) {
    const qid = Number(att.question_id);
    attemptCountByQ.set(qid, (attemptCountByQ.get(qid) ?? 0) + 1);
  }

  const availableQuestions = visibleQuestions.map((q) => ({
    id: q.id,
    official_ref: q.official_ref,
    title: q.title,
    topic_id: q.topic_id,
    topic_title: q.topic_title ?? "",
    is_solved: solvedSet.has(q.id),
    attempt_count: attemptCountByQ.get(q.id) ?? 0,
  }));

  return {
    student: {
      id: Number(userRow.id),
      username: String(userRow.username),
      display_name: String(userRow.display_name),
      created_at: String(userRow.created_at),
      classes: ownedClasses,
      other_teacher_class_count: otherTeacherClassCount,
    },
    stats: {
      totalAttempts,
      uniqueSolved: solvedSet.size,
      totalQuestions: visibleQuestions.length,
      accuracy:
        totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : null,
      avgDurationSec,
    },
    topicMastery,
    typeMastery,
    assignments,
    recentAttempts,
    availableQuestions,
  };
}
