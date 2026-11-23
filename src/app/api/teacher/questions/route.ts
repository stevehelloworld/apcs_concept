import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb, hydrateQuestion } from "@/lib/db";
import type { Difficulty, OptionItem, QuestionType, TraceStep } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const db = await getDb();
  const rows = await db.queryAll<Record<string, unknown>>(
    `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name, c.teacher_id AS class_teacher_id
     FROM questions q
     JOIN topics t ON t.id = q.topic_id
     LEFT JOIN classes c ON c.id = q.class_id
     WHERE q.class_id IS NULL OR q.created_by = ? OR c.teacher_id = ?
     ORDER BY t.sort_order ASC, q.id ASC`,
    [auth.user.id, auth.user.id]
  );

  const questions = rows.map((r) => hydrateQuestion(r));
  return NextResponse.json({ questions });
}

export async function POST(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      topic_id?: number;
      official_ref?: string | null;
      title?: string;
      prompt?: string;
      code?: string;
      question_type?: QuestionType;
      difficulty?: Difficulty;
      options?: OptionItem[];
      correct_option?: "A" | "B" | "C" | "D";
      explanation?: string;
      trace_steps?: TraceStep[];
      class_id?: number | null;
      is_published?: boolean;
    };

    const topicId = Number(body.topic_id);
    const title = (body.title ?? "").trim();
    const prompt = (body.prompt ?? "").trim();
    const code = body.code ?? "";
    const questionType = body.question_type ?? "trace";
    const difficulty = body.difficulty ?? "medium";
    const options = Array.isArray(body.options) ? body.options : [];
    const correctOption = body.correct_option ?? "A";
    const explanation = (body.explanation ?? "").trim();
    const traceSteps = Array.isArray(body.trace_steps) ? body.trace_steps : [];
    const classId = body.class_id ? Number(body.class_id) : null;
    const isPublished = body.is_published === false ? 0 : 1;
    const officialRef = body.official_ref ? body.official_ref.trim() : null;

    if (!topicId || !title || !prompt || !code || options.length !== 4 || !explanation) {
      return NextResponse.json(
        { error: "請完整填寫主題、標題、題幹、程式碼、4 個選項與詳解。" },
        { status: 400 }
      );
    }

    if (classId !== null) {
      const owns = await assertTeacherOwnsClass(auth.user.id, classId);
      if (!owns.ok) return owns.response;
    }

    const db = await getDb();
    const res = await db.run(
      `INSERT INTO questions (
         topic_id, official_ref, title, prompt, code, question_type, difficulty,
         options_json, correct_option, explanation, trace_steps_json,
         created_by, class_id, is_published
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        topicId,
        officialRef,
        title,
        prompt,
        code,
        questionType,
        difficulty,
        JSON.stringify(options),
        correctOption,
        explanation,
        JSON.stringify(traceSteps),
        auth.user.id,
        classId,
        isPublished,
      ]
    );

    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       LEFT JOIN classes c ON c.id = q.class_id
       WHERE q.id = ?`,
      [Number(res.lastInsertRowid)]
    );

    return NextResponse.json({ question: hydrateQuestion(row!) }, { status: 201 });
  } catch (err) {
    console.error("create question error", err);
    return NextResponse.json({ error: "新增題目失敗。" }, { status: 500 });
  }
}
