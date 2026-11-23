import { getDb, hydrateQuestion, hydrateTopic, parseJsonSafe } from "./db";
import type { QuestionType, TeacherAnalyticsPayload } from "./types";

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
