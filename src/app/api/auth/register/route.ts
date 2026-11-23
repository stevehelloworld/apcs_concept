import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { getDb, toPlain } from "@/lib/db";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      username?: string;
      displayName?: string;
      password?: string;
      role?: UserRole;
      joinCode?: string;
    };

    const username = (body.username ?? "").trim();
    const displayName = (body.displayName ?? "").trim();
    const password = body.password ?? "";
    const role: UserRole = body.role === "teacher" ? "teacher" : "student";
    const joinCode = (body.joinCode ?? "").trim().toUpperCase();

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return NextResponse.json(
        { error: "帳號須為 3–32 碼英數字或底線（_）。" },
        { status: 400 }
      );
    }
    if (displayName.length < 1 || displayName.length > 40) {
      return NextResponse.json(
        { error: "請填寫 1–40 字的顯示姓名。" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密碼長度至少需要 6 個字元。" },
        { status: 400 }
      );
    }

    const db = await getDb();

    let targetClass: { id: number; name: string } | null = null;
    if (role === "student" && joinCode) {
      const clsRow = await db.queryOne<{ id: number; name: string }>(
        "SELECT id, name FROM classes WHERE UPPER(join_code) = ?",
        [joinCode]
      );
      if (!clsRow) {
        return NextResponse.json(
          { error: `找不到班級代碼「${joinCode}」，請向任課老師確認後重試。` },
          { status: 400 }
        );
      }
      targetClass = toPlain<{ id: number; name: string }>(clsRow);
    }

    const existing = await db.queryOne<{ id: number }>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existing) {
      return NextResponse.json(
        { error: "此帳號名稱已被註冊，請改用其他帳號。" },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const res = await db.run(
      "INSERT INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, displayName, passwordHash, role]
    );
    const userId = Number(res.lastInsertRowid);

    if (targetClass) {
      await db.run(
        "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)",
        [targetClass.id, userId]
      );
    }

    await createSession(userId);

    return NextResponse.json(
      {
        user: {
          id: userId,
          username,
          display_name: displayName,
          role,
        },
        joinedClass: targetClass,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "註冊過程發生錯誤，請稍後再試。" }, { status: 500 });
  }
}
