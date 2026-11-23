import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; studentId: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id, studentId } = await context.params;
  const classId = Number(id);
  const stuId = Number(studentId);

  const owns = await assertTeacherOwnsClass(auth.user.id, classId);
  if (!owns.ok) return owns.response;

  const db = await getDb();
  await db.run("DELETE FROM class_members WHERE class_id = ? AND student_id = ?", [
    classId,
    stuId,
  ]);

  return NextResponse.json({ ok: true });
}
