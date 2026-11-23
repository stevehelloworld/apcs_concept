import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { getDb, toPlain } from "@/lib/db";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username ?? "").trim();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "請輸入帳號與密碼。" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const row = await db.queryOne<{
      id: number;
      username: string;
      display_name: string;
      password_hash: string;
      role: UserRole;
    }>(
      "SELECT id, username, display_name, password_hash, role FROM users WHERE username = ?",
      [username]
    );

    if (!row) {
      return NextResponse.json(
        { error: "帳號或密碼不正確。" },
        { status: 401 }
      );
    }

    const user = toPlain<{
      id: number;
      username: string;
      display_name: string;
      password_hash: string;
      role: UserRole;
    }>(row);

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "帳號或密碼不正確。" },
        { status: 401 }
      );
    }

    await createSession(Number(user.id));

    return NextResponse.json({
      user: {
        id: Number(user.id),
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json({ error: "登入過程發生錯誤。" }, { status: 500 });
  }
}
