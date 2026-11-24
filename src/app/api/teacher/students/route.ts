import { NextResponse } from "next/server";
import {
  assertTeacherOwnsAllClasses,
  assertTeacherOwnsClass,
  hashPassword,
  requireRole,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  buildTeacherStudentProgress,
  listTeacherManagedStudents,
} from "@/lib/teacher-queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const rawClassId = searchParams.get("classId");
  const filterClassId = rawClassId ? Number(rawClassId) : null;

  if (filterClassId !== null) {
    const owns = await assertTeacherOwnsClass(auth.user.id, filterClassId);
    if (!owns.ok) return owns.response;
  }

  const res = await listTeacherManagedStudents(auth.user.id, filterClassId);
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }

  return NextResponse.json({ classes: res.classes, students: res.students });
}

export async function POST(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      username?: string;
      displayName?: string;
      password?: string;
      classIds?: number[];
      classId?: number;
    };

    const username = (body.username ?? "").trim();
    const displayName = (body.displayName ?? "").trim();
    const password = body.password ?? "";
    const rawClassIds = Array.isArray(body.classIds)
      ? body.classIds.map(Number)
      : body.classId
      ? [Number(body.classId)]
      : [];

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return NextResponse.json(
        { error: "帳號須為 3–32 碼英數字或底線（_）。" },
        { status: 400 }
      );
    }
    if (displayName.length < 1 || displayName.length > 40) {
      return NextResponse.json(
        { error: "請填寫 1–40 字的學生顯示姓名。" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "初始密碼長度至少需要 6 個字元。" },
        { status: 400 }
      );
    }

    const ownsClasses = await assertTeacherOwnsAllClasses(auth.user.id, rawClassIds);
    if (!ownsClasses.ok) return ownsClasses.response;

    const db = await getDb();
    const existing = await db.queryOne<{ id: number }>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existing) {
      return NextResponse.json(
        { error: `帳號「${username}」已存在，請改用其他帳號。` },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const insertRes = await db.run(
      "INSERT INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, 'student')",
      [username, displayName, passwordHash]
    );
    const studentId = Number(insertRes.lastInsertRowid);

    const uniqueClassIds = Array.from(new Set(rawClassIds));
    await db.execBatch(
      uniqueClassIds.map((cid) => ({
        sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)",
        args: [cid, studentId],
      }))
    );

    const progress = await buildTeacherStudentProgress(auth.user.id, studentId);
    const listRes = await listTeacherManagedStudents(auth.user.id, null);
    const createdSummary = listRes.ok
      ? listRes.students.find((s) => s.id === studentId) ?? null
      : null;

    return NextResponse.json(
      { student: createdSummary, progress },
      { status: 201 }
    );
  } catch (err) {
    console.error("create teacher student error", err);
    return NextResponse.json({ error: "建立學生帳號失敗。" }, { status: 500 });
  }
}
