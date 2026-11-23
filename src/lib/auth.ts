import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb, toPlain } from "./db";
import type { AuthUser, QuestionRecord, UserRole } from "./types";

export const SESSION_COOKIE_NAME = "apcs_session";
const SESSION_DURATION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, hexKey] = parts;
  if (!salt || !hexKey) return false;
  try {
    const keyBuf = Buffer.from(hexKey, "hex");
    const derivedBuf = scryptSync(password, salt, 64);
    if (keyBuf.length !== derivedBuf.length) return false;
    return timingSafeEqual(keyBuf, derivedBuf);
  } catch {
    return false;
  }
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const db = await getDb();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresDate = new Date(Date.now() + SESSION_DURATION_DAYS * 86400 * 1000);
  const expiresAtIso = expiresDate.toISOString();

  await db.run(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAtIso]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresDate,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const db = await getDb();
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [hashToken(rawToken)]);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const db = await getDb();
  const tokenHash = hashToken(rawToken);
  const row = await db.queryOne<AuthUser & { expires_at: string }>(
    `SELECT u.id, u.username, u.display_name, u.role, u.created_at, s.expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    [tokenHash]
  );

  if (!row) return null;

  const plain = toPlain<AuthUser & { expires_at: string }>(row);
  if (new Date(plain.expires_at).getTime() <= Date.now()) {
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
    return null;
  }

  return {
    id: Number(plain.id),
    username: String(plain.username),
    display_name: String(plain.display_name),
    role: plain.role as UserRole,
    created_at: String(plain.created_at),
  };
}

export async function requireAuth(): Promise<
  { ok: true; user: AuthUser } | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "請先登入帳號後再執行此操作。" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

export async function requireRole(
  role: UserRole
): Promise<{ ok: true; user: AuthUser } | { ok: false; response: NextResponse }> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (auth.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: role === "teacher" ? "此功能僅限教師帳號存取。" : "此功能僅限學生帳號存取。" },
        { status: 403 }
      ),
    };
  }
  return auth;
}

export async function assertTeacherOwnsClass(
  teacherId: number,
  classId: number
): Promise<
  | { ok: true; classRow: { id: number; name: string; teacher_id: number; join_code: string } }
  | { ok: false; response: NextResponse }
> {
  const db = await getDb();
  const row = await db.queryOne<{ id: number; name: string; teacher_id: number; join_code: string }>(
    "SELECT id, name, teacher_id, join_code FROM classes WHERE id = ?",
    [classId]
  );

  if (!row) {
    return {
      ok: false,
      response: NextResponse.json({ error: "找不到指定的班級。" }, { status: 404 }),
    };
  }

  const plain = toPlain<{ id: number; name: string; teacher_id: number; join_code: string }>(row);
  if (Number(plain.teacher_id) !== teacherId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "無權存取非本人管理的班級資料。" }, { status: 403 }),
    };
  }
  return { ok: true, classRow: plain };
}

export async function getStudentClassIds(studentId: number): Promise<number[]> {
  const db = await getDb();
  const rows = await db.queryAll<{ class_id: number }>(
    "SELECT class_id FROM class_members WHERE student_id = ?",
    [studentId]
  );
  return rows.map((r) => Number(r.class_id));
}

export async function canUserAccessQuestion(
  user: AuthUser | null,
  question: Pick<QuestionRecord, "is_published" | "class_id" | "created_by">
): Promise<boolean> {
  if (user?.role === "teacher") {
    if (question.class_id === null) return true;
    if (question.created_by === user.id) return true;
    const owns = await assertTeacherOwnsClass(user.id, question.class_id);
    return owns.ok;
  }

  if (!question.is_published) return false;
  if (question.class_id === null) return true;
  if (!user) return false;
  const classIds = await getStudentClassIds(user.id);
  return classIds.includes(question.class_id);
}
