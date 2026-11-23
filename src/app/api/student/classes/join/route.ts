import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb, toPlain } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireRole("student");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { joinCode?: string };
    const joinCode = (body.joinCode ?? "").trim().toUpperCase();

    if (!joinCode) {
      return NextResponse.json({ error: "請輸入 6 碼班級代碼。" }, { status: 400 });
    }

    const db = await getDb();
    const clsRow = await db.queryOne<{
      id: number;
      name: string;
      description: string;
      join_code: string;
      teacher_name: string;
    }>(
      `SELECT c.id, c.name, c.description, c.join_code, u.display_name AS teacher_name
       FROM classes c
       JOIN users u ON u.id = c.teacher_id
       WHERE UPPER(c.join_code) = ?`,
      [joinCode]
    );

    if (!clsRow) {
      return NextResponse.json(
        { error: `找不到代碼為「${joinCode}」的班級，請向老師確認。` },
        { status: 404 }
      );
    }

    const cls = toPlain<{
      id: number;
      name: string;
      description: string;
      join_code: string;
      teacher_name: string;
    }>(clsRow);

    const existing = await db.queryOne<{ id: number }>(
      "SELECT id FROM class_members WHERE class_id = ? AND student_id = ?",
      [cls.id, auth.user.id]
    );

    if (existing) {
      return NextResponse.json(
        { error: `你已經在「${cls.name}」班級名單中了。` },
        { status: 409 }
      );
    }

    await db.run(
      "INSERT INTO class_members (class_id, student_id) VALUES (?, ?)",
      [cls.id, auth.user.id]
    );

    return NextResponse.json({ joinedClass: cls }, { status: 201 });
  } catch (err) {
    console.error("join class error", err);
    return NextResponse.json({ error: "加入班級失敗，請稍後再試。" }, { status: 500 });
  }
}
