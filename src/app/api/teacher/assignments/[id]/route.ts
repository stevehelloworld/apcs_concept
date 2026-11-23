import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const assignId = Number(id);
  const db = await getDb();

  const existing = await db.queryOne<{
    id: number;
    class_id: number;
    title: string;
    description: string;
    question_ids_json: string;
    due_date: string | null;
    is_published: number;
  }>("SELECT * FROM assignments WHERE id = ?", [assignId]);
  if (!existing) {
    return NextResponse.json({ error: "找不到該作業。" }, { status: 404 });
  }

  const owns = await assertTeacherOwnsClass(auth.user.id, Number(existing.class_id));
  if (!owns.ok) return owns.response;

  try {
    const body = (await req.json()) as {
      title?: string;
      description?: string;
      question_ids?: number[];
      due_date?: string | null;
      is_published?: boolean;
    };

    await db.run(
      `UPDATE assignments SET
         title = ?,
         description = ?,
         question_ids_json = ?,
         due_date = ?,
         is_published = ?
       WHERE id = ?`,
      [
        body.title !== undefined ? body.title.trim() : existing.title,
        body.description !== undefined ? body.description.trim() : existing.description,
        body.question_ids ? JSON.stringify(body.question_ids) : existing.question_ids_json,
        body.due_date !== undefined ? body.due_date : existing.due_date,
        body.is_published !== undefined ? (body.is_published ? 1 : 0) : existing.is_published,
        assignId,
      ]
    );

    const updated = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM assignments WHERE id = ?",
      [assignId]
    );
    return NextResponse.json({ assignment: updated });
  } catch (err) {
    console.error("update assignment error", err);
    return NextResponse.json({ error: "更新作業失敗。" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const assignId = Number(id);
  const db = await getDb();

  const row = await db.queryOne<{ class_id: number }>(
    "SELECT class_id FROM assignments WHERE id = ?",
    [assignId]
  );
  if (!row) {
    return NextResponse.json({ error: "找不到該作業。" }, { status: 404 });
  }

  const owns = await assertTeacherOwnsClass(auth.user.id, Number(row.class_id));
  if (!owns.ok) return owns.response;

  await db.run("DELETE FROM assignments WHERE id = ?", [assignId]);
  return NextResponse.json({ ok: true });
}
