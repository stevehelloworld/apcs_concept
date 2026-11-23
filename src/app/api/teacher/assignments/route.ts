import { NextResponse } from "next/server";
import { assertTeacherOwnsClass, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listTeacherAssignments } from "@/lib/teacher-queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const assignments = await listTeacherAssignments(auth.user.id);
  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      class_id?: number;
      title?: string;
      description?: string;
      question_ids?: number[];
      due_date?: string | null;
      is_published?: boolean;
    };

    const classId = Number(body.class_id);
    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    const questionIds = Array.isArray(body.question_ids)
      ? body.question_ids.map((n) => Number(n)).filter((n) => n > 0)
      : [];
    const dueDate = body.due_date ? body.due_date.trim() : null;
    const isPublished = body.is_published === false ? 0 : 1;

    if (!classId || !title || questionIds.length === 0) {
      return NextResponse.json(
        { error: "請選擇班級、填寫作業名稱並至少挑選 1 道題目。" },
        { status: 400 }
      );
    }

    const owns = await assertTeacherOwnsClass(auth.user.id, classId);
    if (!owns.ok) return owns.response;

    const db = await getDb();
    const res = await db.run(
      `INSERT INTO assignments (class_id, title, description, question_ids_json, due_date, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        classId,
        title,
        description,
        JSON.stringify(questionIds),
        dueDate,
        isPublished,
        auth.user.id,
      ]
    );

    const created = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM assignments WHERE id = ?",
      [Number(res.lastInsertRowid)]
    );
    return NextResponse.json({ assignment: created }, { status: 201 });
  } catch (err) {
    console.error("create assignment error", err);
    return NextResponse.json({ error: "指派作業失敗。" }, { status: 500 });
  }
}
