import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb, toPlain } from "@/lib/db";

export const dynamic = "force-dynamic";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export async function GET() {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const db = await getDb();
  const classes = await db.queryAll<Record<string, unknown>>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) AS member_count,
       (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS assignment_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.id ASC`,
    [auth.user.id]
  );

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { name?: string; description?: string };
    const name = (body.name ?? "").trim();
    const description = (body.description ?? "").trim();

    if (name.length < 1 || name.length > 60) {
      return NextResponse.json({ error: "請輸入 1–60 字的班級名稱。" }, { status: 400 });
    }

    const db = await getDb();
    let joinCode = generateJoinCode();
    for (let attempt = 0; attempt < 10; attempt++) {
      const exists = await db.queryOne<{ id: number }>(
        "SELECT id FROM classes WHERE join_code = ?",
        [joinCode]
      );
      if (!exists) break;
      joinCode = generateJoinCode();
    }

    const res = await db.run(
      "INSERT INTO classes (name, description, join_code, teacher_id) VALUES (?, ?, ?, ?)",
      [name, description, joinCode, auth.user.id]
    );

    const created = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM classes WHERE id = ?",
      [Number(res.lastInsertRowid)]
    );

    return NextResponse.json({ classItem: toPlain(created) }, { status: 201 });
  } catch (err) {
    console.error("create class error", err);
    return NextResponse.json({ error: "建立班級失敗。" }, { status: 500 });
  }
}
