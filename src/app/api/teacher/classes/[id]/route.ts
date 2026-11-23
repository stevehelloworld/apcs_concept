import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const classId = Number(id);
  const owns = await assertTeacherOwnsClass(auth.user.id, classId);
  if (!owns.ok) return owns.response;

  const db = await getDb();
  const classDetail = await db.queryOne<Record<string, unknown>>(
    "SELECT * FROM classes WHERE id = ?",
    [classId]
  );

  const members = await db.queryAll<{
    student_id: number;
    username: string;
    display_name: string;
    joined_at: string;
  }>(
    `SELECT u.id AS student_id, u.username, u.display_name, cm.joined_at
     FROM class_members cm
     JOIN users u ON u.id = cm.student_id
     WHERE cm.class_id = ?
     ORDER BY cm.joined_at ASC`,
    [classId]
  );

  const membersWithStats = [];
  for (const m of members) {
    const stat = await db.queryOne<{ attempts: number; correct: number; solved: number }>(
      `SELECT
         COUNT(*) AS attempts,
         SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct,
         COUNT(DISTINCT CASE WHEN is_correct = 1 THEN question_id END) AS solved
       FROM attempts
       WHERE user_id = ?`,
      [m.student_id]
    );
    const attempts = Number(stat?.attempts ?? 0);
    const correct = Number(stat?.correct ?? 0);
    membersWithStats.push({
      student_id: Number(m.student_id),
      username: m.username,
      display_name: m.display_name,
      joined_at: m.joined_at,
      attempts,
      solved_distinct: Number(stat?.solved ?? 0),
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : null,
    });
  }

  return NextResponse.json({
    classItem: classDetail,
    members: membersWithStats,
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const classId = Number(id);
  const owns = await assertTeacherOwnsClass(auth.user.id, classId);
  if (!owns.ok) return owns.response;

  try {
    const body = (await req.json()) as { name?: string; description?: string };
    const name = (body.name ?? owns.classRow.name).trim();
    const description = (body.description ?? "").trim();

    if (name.length < 1 || name.length > 60) {
      return NextResponse.json({ error: "班級名稱須介於 1–60 字之間。" }, { status: 400 });
    }

    const db = await getDb();
    await db.run("UPDATE classes SET name = ?, description = ? WHERE id = ?", [
      name,
      description,
      classId,
    ]);
    const updated = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM classes WHERE id = ?",
      [classId]
    );
    return NextResponse.json({ classItem: updated });
  } catch (err) {
    console.error("update class error", err);
    return NextResponse.json({ error: "更新班級失敗。" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const classId = Number(id);
  const owns = await assertTeacherOwnsClass(auth.user.id, classId);
  if (!owns.ok) return owns.response;

  const db = await getDb();
  await db.run("DELETE FROM classes WHERE id = ?", [classId]);
  return NextResponse.json({ ok: true });
}
