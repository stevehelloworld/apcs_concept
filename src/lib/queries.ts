import { getDb, hydrateQuestion, hydrateTopic, parseJsonSafe } from "./db";
import type {
  AuthUser,
  PublicQuestionRecord,
  QuestionType,
  StudentDashboardPayload,
  TopicRecord,
  TopicSummary,
} from "./types";
import { QUESTION_TYPE_LABELS } from "./types";

export async function listPublishedTopics(user?: AuthUser | null): Promise<TopicSummary[]> {
  const db = await getDb();
  const topicRows = await db.queryAll<Record<string, unknown>>(
    "SELECT * FROM topics WHERE is_published = 1 ORDER BY sort_order ASC, id ASC"
  );

  let studentClassIds: number[] = [];
  if (user?.role === "student") {
    const clsRows = await db.queryAll<{ class_id: number }>(
      "SELECT class_id FROM class_members WHERE student_id = ?",
      [user.id]
    );
    studentClassIds = clsRows.map((r) => Number(r.class_id));
  }

  const summaries: TopicSummary[] = [];
  for (const raw of topicRows) {
    const topic = hydrateTopic(raw);
    const allTopicQs = await db.queryAll<{
      id: number;
      official_ref: string | null;
      question_type: QuestionType;
      class_id: number | null;
    }>(
      "SELECT id, official_ref, question_type, class_id FROM questions WHERE topic_id = ? AND is_published = 1",
      [topic.id]
    );

    const qRows = allTopicQs.filter((q) => {
      if (q.class_id === null) return true;
      if (user?.role === "teacher") return true;
      return studentClassIds.includes(Number(q.class_id));
    });

    const refs = qRows
      .map((q) => q.official_ref)
      .filter((r): r is string => Boolean(r));
    const types = Array.from(new Set(qRows.map((q) => q.question_type)));

    let studentAttempted: number | undefined;
    let studentCorrect: number | undefined;

    if (user?.role === "student" && qRows.length > 0) {
      const qIds = qRows.map((q) => Number(q.id));
      const placeholders = qIds.map(() => "?").join(",");
      const statRow = await db.queryOne<{ attempted: number; solved: number }>(
        `SELECT
          COUNT(DISTINCT question_id) AS attempted,
          COUNT(DISTINCT CASE WHEN is_correct = 1 THEN question_id END) AS solved
         FROM attempts
         WHERE user_id = ? AND question_id IN (${placeholders})`,
        [user.id, ...qIds]
      );
      studentAttempted = Number(statRow?.attempted ?? 0);
      studentCorrect = Number(statRow?.solved ?? 0);
    }

    summaries.push({
      ...topic,
      question_count: qRows.length,
      official_refs: refs,
      question_types: types,
      student_attempted: studentAttempted,
      student_correct: studentCorrect,
    });
  }

  return summaries;
}

export async function getTopicBySlugForUser(
  slug: string,
  user: AuthUser | null
): Promise<{ topic: TopicRecord; questions: PublicQuestionRecord[] } | null> {
  const db = await getDb();
  const row = await db.queryOne<Record<string, unknown>>(
    "SELECT * FROM topics WHERE slug = ?",
    [slug]
  );
  if (!row) return null;

  const topic = hydrateTopic(row);
  if (!topic.is_published && user?.role !== "teacher") {
    return null;
  }

  const questions = await queryVisibleQuestions(user, { topicSlug: slug });
  return { topic, questions };
}

export async function queryVisibleQuestions(
  user: AuthUser | null,
  filters: {
    topicSlug?: string;
    questionType?: string;
    difficulty?: string;
    source?: string; // "all" | "official" | "mock"
    assignmentId?: number;
    status?: string; // "all" | "unsolved" | "wrong" | "solved"
    limit?: number;
  }
): Promise<PublicQuestionRecord[]> {
  const db = await getDb();

  let studentClassIds: number[] = [];
  if (user?.role === "student") {
    const clsRows = await db.queryAll<{ class_id: number }>(
      "SELECT class_id FROM class_members WHERE student_id = ?",
      [user.id]
    );
    studentClassIds = clsRows.map((r) => Number(r.class_id));
  }

  let assignmentQuestionOrder: number[] | null = null;
  if (filters.assignmentId) {
    const assignment = await db.queryOne<{
      id: number;
      class_id: number;
      question_ids_json: string;
      is_published: number;
      created_by: number;
    }>("SELECT * FROM assignments WHERE id = ?", [filters.assignmentId]);
    if (!assignment) return [];

    if (user?.role === "student") {
      if (!assignment.is_published || !studentClassIds.includes(Number(assignment.class_id))) {
        return [];
      }
    } else if (user?.role === "teacher") {
      const cls = await db.queryOne<{ teacher_id: number }>(
        "SELECT teacher_id FROM classes WHERE id = ?",
        [assignment.class_id]
      );
      if (!cls || Number(cls.teacher_id) !== user.id) return [];
    } else {
      return [];
    }
    assignmentQuestionOrder = parseJsonSafe<number[]>(assignment.question_ids_json, []);
    if (assignmentQuestionOrder.length === 0) return [];
  }

  const clauses: string[] = ["q.is_published = 1", "t.is_published = 1"];
  const params: (string | number)[] = [];

  if (filters.topicSlug && filters.topicSlug !== "all") {
    clauses.push("t.slug = ?");
    params.push(filters.topicSlug);
  }
  if (filters.questionType && filters.questionType !== "all") {
    clauses.push("q.question_type = ?");
    params.push(filters.questionType);
  }
  if (filters.difficulty && filters.difficulty !== "all") {
    clauses.push("q.difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.source === "official") {
    clauses.push("q.official_ref LIKE '0915-%'");
  } else if (filters.source === "mock") {
    clauses.push("q.official_ref LIKE 'SIM-%'");
  }
  if (assignmentQuestionOrder) {
    clauses.push(`q.id IN (${assignmentQuestionOrder.map(() => "?").join(",")})`);
    params.push(...assignmentQuestionOrder);
  }

  const sql = `
    SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name, c.teacher_id AS class_teacher_id
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    LEFT JOIN classes c ON c.id = q.class_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY t.sort_order ASC, q.id ASC
  `;

  const rawRows = await db.queryAll<Record<string, unknown>>(sql, params);

  const visibleRows = rawRows.filter((r) => {
    const classId = r.class_id !== null && r.class_id !== undefined ? Number(r.class_id) : null;
    if (classId === null) return true;
    if (!user) return false;
    if (user.role === "teacher") {
      return Number(r.class_teacher_id) === user.id;
    }
    return studentClassIds.includes(classId);
  });

  const lastAttemptMap = new Map<
    number,
    { selected_option: "A" | "B" | "C" | "D"; is_correct: boolean; created_at: string }
  >();
  if (user) {
    const attempts = await db.queryAll<{
      question_id: number;
      selected_option: "A" | "B" | "C" | "D";
      is_correct: number;
      created_at: string;
    }>(
      `SELECT question_id, selected_option, is_correct, created_at
       FROM attempts
       WHERE user_id = ?
       ORDER BY id ASC`,
      [user.id]
    );
    for (const a of attempts) {
      lastAttemptMap.set(Number(a.question_id), {
        selected_option: a.selected_option,
        is_correct: Boolean(a.is_correct),
        created_at: a.created_at,
      });
    }
  }

  let hydrated = visibleRows.map((r): PublicQuestionRecord => {
    const q = hydrateQuestion(r);
    return {
      id: q.id,
      topic_id: q.topic_id,
      topic_slug: q.topic_slug,
      topic_title: q.topic_title,
      official_ref: q.official_ref,
      title: q.title,
      prompt: q.prompt,
      code: q.code,
      question_type: q.question_type,
      difficulty: q.difficulty,
      options: q.options.map((o) => ({ key: o.key, text: o.text })),
      class_id: q.class_id,
      class_name: q.class_name,
      has_trace: q.trace_steps.length > 0,
      user_last_attempt: lastAttemptMap.get(q.id) ?? null,
    };
  });

  if (assignmentQuestionOrder) {
    const orderIdx = new Map(assignmentQuestionOrder.map((id, idx) => [id, idx]));
    hydrated.sort((a, b) => (orderIdx.get(a.id) ?? 999) - (orderIdx.get(b.id) ?? 999));
  }

  if (filters.status && filters.status !== "all" && user) {
    hydrated = hydrated.filter((q) => {
      if (filters.status === "unsolved") return !q.user_last_attempt;
      if (filters.status === "wrong") return q.user_last_attempt && !q.user_last_attempt.is_correct;
      if (filters.status === "solved") return q.user_last_attempt?.is_correct;
      return true;
    });
  }

  if (filters.limit && filters.limit > 0) {
    hydrated = hydrated.slice(0, filters.limit);
  }

  return hydrated;
}

export async function buildStudentDashboard(
  user: AuthUser
): Promise<StudentDashboardPayload> {
  const db = await getDb();
  const visibleQuestions = await queryVisibleQuestions(user, {});
  const visibleIds = visibleQuestions.map((q) => q.id);

  const attemptRows = await db.queryAll<{
    id: number;
    question_id: number;
    selected_option: "A" | "B" | "C" | "D";
    is_correct: number;
    duration_sec: number;
    created_at: string;
  }>(
    "SELECT id, question_id, selected_option, is_correct, duration_sec, created_at FROM attempts WHERE user_id = ? ORDER BY id DESC",
    [user.id]
  );

  const totalAttempts = attemptRows.length;
  const correctAttempts = attemptRows.filter((a) => Boolean(a.is_correct)).length;
  const solvedDistinctSet = new Set(
    attemptRows.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
  );
  const avgDurationSec =
    totalAttempts > 0
      ? Math.round(
          attemptRows.reduce((acc, a) => acc + Number(a.duration_sec || 0), 0) / totalAttempts
        )
      : 0;

  const topicRows = (
    await db.queryAll<Record<string, unknown>>(
      "SELECT * FROM topics WHERE is_published = 1 ORDER BY sort_order ASC"
    )
  ).map(hydrateTopic);

  const qById = new Map(visibleQuestions.map((q) => [q.id, q]));

  const topicMastery = topicRows.map((t) => {
    const tQuestions = visibleQuestions.filter((q) => q.topic_id === t.id);
    const tQIds = new Set(tQuestions.map((q) => q.id));
    const tAttempts = attemptRows.filter((a) => tQIds.has(Number(a.question_id)));
    const tCorrect = tAttempts.filter((a) => Boolean(a.is_correct)).length;
    const distinctAttempted = new Set(tAttempts.map((a) => Number(a.question_id))).size;
    const distinctSolved = new Set(
      tAttempts.filter((a) => Boolean(a.is_correct)).map((a) => Number(a.question_id))
    ).size;

    return {
      topicId: t.id,
      slug: t.slug,
      title: t.title,
      totalQuestions: tQuestions.length,
      solvedCorrect: distinctSolved,
      attemptedDistinct: distinctAttempted,
      accuracy: tAttempts.length > 0 ? Math.round((tCorrect / tAttempts.length) * 100) : null,
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
    const qtAttempts = attemptRows.filter(
      (a) => qById.get(Number(a.question_id))?.question_type === qt
    );
    const qtCorrect = qtAttempts.filter((a) => Boolean(a.is_correct)).length;
    return {
      type: qt,
      label: QUESTION_TYPE_LABELS[qt],
      attempts: qtAttempts.length,
      correct: qtCorrect,
      accuracy: qtAttempts.length > 0 ? Math.round((qtCorrect / qtAttempts.length) * 100) : null,
    };
  });

  const classes = await db.queryAll<{
    id: number;
    name: string;
    description: string;
    join_code: string;
    teacher_name: string;
    joined_at: string;
  }>(
    `SELECT c.id, c.name, c.description, c.join_code, u.display_name AS teacher_name, cm.joined_at
     FROM class_members cm
     JOIN classes c ON c.id = cm.class_id
     JOIN users u ON u.id = c.teacher_id
     WHERE cm.student_id = ?
     ORDER BY cm.joined_at DESC`,
    [user.id]
  );

  const classIds = classes.map((c) => Number(c.id));
  let assignments: StudentDashboardPayload["assignments"] = [];
  if (classIds.length > 0) {
    const assignRows = await db.queryAll<{
      id: number;
      class_id: number;
      class_name: string;
      title: string;
      description: string;
      due_date: string | null;
      question_ids_json: string;
    }>(
      `SELECT a.id, a.class_id, c.name AS class_name, a.title, a.description, a.due_date, a.question_ids_json
       FROM assignments a
       JOIN classes c ON c.id = a.class_id
       WHERE a.is_published = 1 AND a.class_id IN (${classIds.map(() => "?").join(",")})
       ORDER BY a.id DESC`,
      classIds
    );

    assignments = assignRows.map((a) => {
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
        description: a.description,
        due_date: a.due_date,
        question_count: qIds.length,
        completed_count: completedSet.size,
        correct_count: correctSet.size,
      };
    });
  }

  const seenWrongQ = new Set<number>();
  const recentWrong: StudentDashboardPayload["recentWrong"] = [];
  for (const att of attemptRows) {
    if (att.is_correct) continue;
    const qid = Number(att.question_id);
    if (seenWrongQ.has(qid)) continue;
    const newerCorrect = attemptRows.find(
      (x) => Number(x.question_id) === qid && x.id > att.id && Boolean(x.is_correct)
    );
    if (newerCorrect) continue;

    seenWrongQ.add(qid);
    const fullRow = await db.queryOne<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title
       FROM questions q JOIN topics t ON t.id = q.topic_id
       WHERE q.id = ?`,
      [qid]
    );
    if (!fullRow) continue;
    const q = hydrateQuestion(fullRow);
    const chosenOpt = q.options.find((o) => o.key === att.selected_option);
    recentWrong.push({
      attemptId: Number(att.id),
      questionId: q.id,
      title: q.title,
      officialRef: q.official_ref,
      topicSlug: q.topic_slug ?? "",
      topicTitle: q.topic_title ?? "",
      questionType: q.question_type,
      selectedOption: att.selected_option,
      correctOption: q.correct_option,
      misconception: chosenOpt?.misconception ?? "",
      createdAt: att.created_at,
    });
    if (recentWrong.length >= 8) break;
  }

  return {
    user,
    stats: {
      totalAttempts,
      uniqueSolved: Array.from(solvedDistinctSet).filter((id) => visibleIds.includes(id)).length,
      totalVisibleQuestions: visibleIds.length,
      accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
      avgDurationSec,
    },
    topicMastery,
    typeMastery,
    classes,
    assignments,
    recentWrong,
  };
}
