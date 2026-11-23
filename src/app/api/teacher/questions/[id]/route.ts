import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb, hydrateQuestion } from "@/lib/db";
import type { Difficulty, OptionItem, QuestionType, TraceStep } from "@/lib/types";

export const dynamic = "force-dynamic";

async function assertTeacherCanManageQuestion(
  teacherId: number,
  questionRow: Record<string, unknown>
) {
  const existing = hydrateQuestion(questionRow);
  if (existing.created_by !== null && existing.created_by !== teacherId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "無權修改其他教師自建的題目。" }, { status: 403 }),
    };
  }
  if (existing.class_id !== null) {
    const owns = await assertTeacherOwnsClass(teacherId, existing.class_id);
    if (!owns.ok) return owns;
  }
  return { ok: true as const, existing };
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const questionId = Number(id);
  const db = await getDb();

  const row = await db.queryOne<Record<string, unknown>>(
    "SELECT * FROM questions WHERE id = ?",
    [questionId]
  );
  if (!row) {
    return NextResponse.json({ error: "找不到該題目。" }, { status: 404 });
  }

  const perm = await assertTeacherCanManageQuestion(auth.user.id, row);
  if (!perm.ok) return perm.response;
  const existing = perm.existing;

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

    const nextClassId =
      body.class_id !== undefined ? (body.class_id ? Number(body.class_id) : null) : existing.class_id;

    if (nextClassId !== null) {
      const owns = await assertTeacherOwnsClass(auth.user.id, nextClassId);
      if (!owns.ok) return owns.response;
    }

    await db.run(
      `UPDATE questions SET
         topic_id = ?,
         official_ref = ?,
         title = ?,
         prompt = ?,
         code = ?,
         question_type = ?,
         difficulty = ?,
         options_json = ?,
         correct_option = ?,
         explanation = ?,
         trace_steps_json = ?,
         class_id = ?,
         is_published = ?,
         updated_at = datetime('now')
       WHERE id = ?`,
      [
        body.topic_id ?? existing.topic_id,
        body.official_ref !== undefined ? body.official_ref : existing.official_ref,
        body.title !== undefined ? body.title.trim() : existing.title,
        body.prompt !== undefined ? body.prompt.trim() : existing.prompt,
        body.code !== undefined ? body.code : existing.code,
        body.question_type ?? existing.question_type,
        body.difficulty ?? existing.difficulty,
        JSON.stringify(body.options ?? existing.options),
        body.correct_option ?? existing.correct_option,
        body.explanation !== undefined ? body.explanation.trim() : existing.explanation,
        JSON.stringify(body.trace_steps ?? existing.trace_steps),
        nextClassId,
        body.is_published !== undefined ? (body.is_published ? 1 : 0) : existing.is_published ? 1 : 0,
        questionId,
      ]
    );

    const updated = await db.queryOne<Record<string, unknown>>(
      `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name
       FROM questions q
       JOIN topics t ON t.id = q.topic_id
       LEFT JOIN classes c ON c.id = q.class_id
       WHERE q.id = ?`,
      [questionId]
    );

    return NextResponse.json({ question: hydrateQuestion(updated!) });
  } catch (err) {
    console.error("update question error", err);
    return NextResponse.json({ error: "更新題目失敗。" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const questionId = Number(id);
  const db = await getDb();

  const row = await db.queryOne<Record<string, unknown>>(
    "SELECT * FROM questions WHERE id = ?",
    [questionId]
  );
  if (!row) {
    return NextResponse.json({ error: "找不到該題目。" }, { status: 404 });
  }

  const perm = await assertTeacherCanManageQuestion(auth.user.id, row);
  if (!perm.ok) return perm.response;

  if (perm.existing.created_by === null) {
    return NextResponse.json(
      { error: "官方基準範例題不可直接刪除，您可以選擇下架或複製為自訂題。" },
      { status: 400 }
    );
  }

  await db.run("DELETE FROM questions WHERE id = ?", [questionId]);
  return NextResponse.json({ ok: true });
}
