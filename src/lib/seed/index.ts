import { randomBytes, scryptSync } from "node:crypto";
import type { DbClient } from "../db";
import { SEED_TOPICS } from "./topics";
import { SEED_QUESTIONS_CONTROL_FLOW } from "./q-control-flow";
import { SEED_QUESTIONS_LOOPS_RANGE } from "./q-loops-range";
import { SEED_QUESTIONS_LISTS_GRID } from "./q-lists-grid";
import { SEED_QUESTIONS_FUNCTIONS_RECURSION } from "./q-functions-recursion";
import { SEED_QUESTIONS_ALGORITHMS_COMPLEXITY } from "./q-algorithms-complexity";

function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export async function seedDatabaseIfEmpty(db: DbClient): Promise<void> {
  const topicCount = await db.queryOne<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM topics"
  );
  if (topicCount && Number(topicCount.cnt) > 0) {
    return;
  }

  // 1. Insert 5 Topics (idempotent batch)
  await db.execBatch(
    SEED_TOPICS.map((topic) => ({
      sql: `INSERT OR IGNORE INTO topics (
        slug, title, subtitle, summary, exam_weight, study_minutes,
        sort_order, visualizer_type, core_concepts_json, pitfalls_json, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        topic.slug,
        topic.title,
        topic.subtitle,
        topic.summary,
        topic.exam_weight,
        topic.study_minutes,
        topic.sort_order,
        topic.visualizer_type,
        JSON.stringify(topic.core_concepts),
        JSON.stringify(topic.pitfalls),
        topic.is_published ? 1 : 0,
      ],
    }))
  );

  const topicRows = await db.queryAll<{ id: number; slug: string }>(
    "SELECT id, slug FROM topics"
  );
  const topicSlugToId = new Map(topicRows.map((t) => [t.slug, Number(t.id)]));

  // 2. Insert 30 Official APCS 0915 Python Questions (if table empty)
  const qCount = await db.queryOne<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM questions"
  );
  if (!qCount || Number(qCount.cnt) === 0) {
    const allQuestions = [
      ...SEED_QUESTIONS_CONTROL_FLOW,
      ...SEED_QUESTIONS_LOOPS_RANGE,
      ...SEED_QUESTIONS_LISTS_GRID,
      ...SEED_QUESTIONS_FUNCTIONS_RECURSION,
      ...SEED_QUESTIONS_ALGORITHMS_COMPLEXITY,
    ];

    await db.execBatch(
      allQuestions.map((q) => {
        const topicId = topicSlugToId.get(q.topic_slug);
        if (!topicId) {
          throw new Error(`Missing topic_id for slug ${q.topic_slug}`);
        }
        return {
          sql: `INSERT INTO questions (
            topic_id, official_ref, title, prompt, code, question_type,
            difficulty, options_json, correct_option, explanation, trace_steps_json,
            created_by, class_id, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 1)`,
          args: [
            topicId,
            q.official_ref,
            q.title,
            q.prompt,
            q.code,
            q.question_type,
            q.difficulty,
            JSON.stringify(q.options),
            q.correct_option,
            q.explanation,
            JSON.stringify(q.trace_steps),
          ],
        };
      })
    );
  }

  const questionRows = await db.queryAll<{ id: number; official_ref: string | null }>(
    "SELECT id, official_ref FROM questions WHERE official_ref IS NOT NULL"
  );
  const refToQuestionId = new Map<string, number>();
  for (const r of questionRows) {
    if (r.official_ref) refToQuestionId.set(r.official_ref, Number(r.id));
  }

  // 3. Insert Demo Teachers and Students (idempotent)
  const teacherHash = createPasswordHash("teacher123");
  const studentHash = createPasswordHash("student123");

  await db.execBatch([
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["teacher_lin", "林老師（高二資訊甲班）", teacherHash, "teacher"],
    },
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["teacher_chen", "陳老師（APCS 衝刺班）", teacherHash, "teacher"],
    },
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["stu_wang", "王小明", studentHash, "student"],
    },
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["stu_lee", "李佳穎", studentHash, "student"],
    },
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["stu_chang", "張宇軒", studentHash, "student"],
    },
    {
      sql: "INSERT OR IGNORE INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      args: ["stu_wu", "吳承翰", studentHash, "student"],
    },
  ]);

  const userRows = await db.queryAll<{ id: number; username: string }>(
    "SELECT id, username FROM users"
  );
  const userByName = new Map(userRows.map((u) => [u.username, Number(u.id)]));

  const linId = userByName.get("teacher_lin")!;
  const chenId = userByName.get("teacher_chen")!;
  const wangId = userByName.get("stu_wang")!;
  const leeId = userByName.get("stu_lee")!;
  const changId = userByName.get("stu_chang")!;
  const wuId = userByName.get("stu_wu")!;

  // 4. Insert Demo Classes (idempotent)
  await db.execBatch([
    {
      sql: "INSERT OR IGNORE INTO classes (name, description, join_code, teacher_id) VALUES (?, ?, ?, ?)",
      args: [
        "高二資訊甲班",
        "115 學年度高二 Python 程式識讀與追蹤能力培訓班",
        "APCS2A",
        linId,
      ],
    },
    {
      sql: "INSERT OR IGNORE INTO classes (name, description, join_code, teacher_id) VALUES (?, ?, ?, ?)",
      args: [
        "APCS 衝刺班",
        "針對遞迴、搜尋邊界與演算法題型強化之密集班",
        "APCS99",
        chenId,
      ],
    },
  ]);

  const classRows = await db.queryAll<{ id: number; join_code: string }>(
    "SELECT id, join_code FROM classes"
  );
  const classByCode = new Map(classRows.map((c) => [c.join_code, Number(c.id)]));
  const class2aId = classByCode.get("APCS2A")!;
  const class99Id = classByCode.get("APCS99")!;

  // 5. Enroll Students into Classes (idempotent)
  await db.execBatch([
    { sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)", args: [class2aId, wangId] },
    { sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)", args: [class2aId, leeId] },
    { sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)", args: [class2aId, changId] },
    { sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)", args: [class99Id, wuId] },
  ]);

  // 6. Insert Class Assignments (if empty)
  const assignCount = await db.queryOne<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM assignments"
  );
  const qIds = (refs: string[]) =>
    JSON.stringify(refs.map((r) => refToQuestionId.get(r)).filter(Boolean));

  if (!assignCount || Number(assignCount.cnt) === 0) {
    await db.execBatch([
      {
        sql: `INSERT INTO assignments (class_id, title, description, question_ids_json, due_date, is_published, created_by)
              VALUES (?, ?, ?, ?, ?, 1, ?)`,
        args: [
          class2aId,
          "第一週：條件遮蔽與迴圈追蹤特訓",
          "先完成主題 1、2 視覺化實驗後作答本任務，重點檢驗 Q17 區間遮蔽與 Q19 負步長邊界。",
          qIds(["0915-Q10", "0915-Q17", "0915-Q29", "0915-Q2", "0915-Q19", "0915-Q26"]),
          "2026-12-05",
          linId,
        ],
      },
      {
        sql: `INSERT INTO assignments (class_id, title, description, question_ids_json, due_date, is_published, created_by)
              VALUES (?, ?, ?, ?, ?, 1, ?)`,
        args: [
          class99Id,
          "遞迴呼叫堆疊與演算法邊界週考",
          "針對高失分題型（遞迴展開與二分搜尋邊界反例）進行實戰練習。",
          qIds(["0915-Q8", "0915-Q11", "0915-Q16", "0915-Q4", "0915-Q22", "0915-Q28"]),
          "2026-12-07",
          chenId,
        ],
      },
    ]);
  }

  const assignRows = await db.queryAll<{ id: number; class_id: number }>(
    "SELECT id, class_id FROM assignments ORDER BY id ASC"
  );
  const assign1Id = assignRows.find((a) => Number(a.class_id) === class2aId)?.id ?? null;
  const assign2Id = assignRows.find((a) => Number(a.class_id) === class99Id)?.id ?? null;

  // 7. Insert Realistic Seed Attempts (if empty)
  const attemptCount = await db.queryOne<{ cnt: number }>(
    "SELECT COUNT(*) AS cnt FROM attempts"
  );
  if (!attemptCount || Number(attemptCount.cnt) === 0) {
    const attemptStatements: Array<{ sql: string; args: (string | number | null)[] }> = [];
    const addAttempt = (
      userId: number,
      ref: string,
      assignmentId: number | null,
      selected: "A" | "B" | "C" | "D",
      correct: "A" | "B" | "C" | "D",
      sec: number,
      createdAt: string
    ) => {
      const qId = refToQuestionId.get(ref);
      if (!qId) return;
      attemptStatements.push({
        sql: `INSERT INTO attempts (
          user_id, question_id, assignment_id, selected_option, is_correct, duration_sec, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [userId, qId, assignmentId, selected, selected === correct ? 1 : 0, sec, createdAt],
      });
    };

    // APCS2A (teacher_lin) initial analytics data
    addAttempt(wangId, "0915-Q10", assign1Id, "D", "D", 32, "2026-11-20 10:12:00");
    addAttempt(wangId, "0915-Q17", assign1Id, "D", "B", 48, "2026-11-20 10:14:00");
    addAttempt(wangId, "0915-Q29", assign1Id, "B", "B", 41, "2026-11-20 10:16:00");
    addAttempt(wangId, "0915-Q2", assign1Id, "A", "A", 29, "2026-11-20 10:18:00");
    addAttempt(wangId, "0915-Q19", assign1Id, "D", "C", 54, "2026-11-20 10:21:00");
    addAttempt(wangId, "0915-Q15", null, "A", "C", 61, "2026-11-21 15:02:00");
    addAttempt(wangId, "0915-Q1", null, "B", "C", 45, "2026-11-21 15:05:00");

    addAttempt(leeId, "0915-Q10", assign1Id, "D", "D", 25, "2026-11-20 11:02:00");
    addAttempt(leeId, "0915-Q17", assign1Id, "B", "B", 38, "2026-11-20 11:04:00");
    addAttempt(leeId, "0915-Q29", assign1Id, "B", "B", 33, "2026-11-20 11:07:00");
    addAttempt(leeId, "0915-Q2", assign1Id, "A", "A", 22, "2026-11-20 11:09:00");
    addAttempt(leeId, "0915-Q19", assign1Id, "C", "C", 40, "2026-11-20 11:11:00");
    addAttempt(leeId, "0915-Q26", assign1Id, "D", "D", 28, "2026-11-20 11:13:00");
    addAttempt(leeId, "0915-Q30", null, "D", "D", 31, "2026-11-21 19:10:00");

    addAttempt(changId, "0915-Q10", assign1Id, "C", "D", 37, "2026-11-21 09:30:00");
    addAttempt(changId, "0915-Q17", assign1Id, "D", "B", 44, "2026-11-21 09:33:00");
    addAttempt(changId, "0915-Q29", assign1Id, "A", "B", 52, "2026-11-21 09:36:00");
    addAttempt(changId, "0915-Q26", assign1Id, "C", "D", 39, "2026-11-21 09:40:00");

    // APCS99 (teacher_chen) isolated analytics data
    addAttempt(wuId, "0915-Q8", assign2Id, "C", "C", 42, "2026-11-21 20:05:00");
    addAttempt(wuId, "0915-Q11", assign2Id, "B", "B", 24, "2026-11-21 20:07:00");
    addAttempt(wuId, "0915-Q16", assign2Id, "C", "D", 75, "2026-11-21 20:10:00");
    addAttempt(wuId, "0915-Q4", assign2Id, "D", "B", 82, "2026-11-21 20:14:00");
    addAttempt(wuId, "0915-Q22", assign2Id, "D", "D", 48, "2026-11-21 20:16:00");
    addAttempt(wuId, "0915-Q28", assign2Id, "D", "C", 64, "2026-11-21 20:20:00");

    await db.execBatch(attemptStatements);
  }
}
