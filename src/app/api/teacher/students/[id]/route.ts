import { NextResponse } from "next/server";
import {
  assertTeacherManagesStudent,
  assertTeacherOwnsAllClasses,
  hashPassword,
  requireRole,
} from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  buildTeacherStudentProgress,
  listTeacherManagedStudents,
} from "@/lib/teacher-queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const studentId = Number(id);
  const check = await assertTeacherManagesStudent(auth.user.id, studentId);
  if (!check.ok) return check.response;

  const progress = await buildTeacherStudentProgress(auth.user.id, studentId);
  if (!progress) {
    return NextResponse.json({ error: "找不到學生學習進度。" }, { status: 404 });
  }

  return NextResponse.json({ progress });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const studentId = Number(id);
  const check = await assertTeacherManagesStudent(auth.user.id, studentId);
  if (!check.ok) return check.response;

  try {
    const body = (await req.json()) as {
      username?: string;
      displayName?: string;
      newPassword?: string;
      classIds?: number[];
    };

    const db = await getDb();
    let nextUsername = check.student.username;
    let nextDisplayName = check.student.display_name;

    if (body.username !== undefined) {
      const candidate = body.username.trim();
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(candidate)) {
        return NextResponse.json(
          { error: "帳號須為 3–32 碼英數字或底線（_）。" },
          { status: 400 }
        );
      }
      if (candidate !== check.student.username) {
        const dup = await db.queryOne<{ id: number }>(
          "SELECT id FROM users WHERE username = ? AND id != ?",
          [candidate, studentId]
        );
        if (dup) {
          return NextResponse.json(
            { error: `帳號「${candidate}」已被其他使用者使用。` },
            { status: 409 }
          );
        }
      }
      nextUsername = candidate;
    }

    if (body.displayName !== undefined) {
      const candidate = body.displayName.trim();
      if (candidate.length < 1 || candidate.length > 40) {
        return NextResponse.json(
          { error: "請填寫 1–40 字的學生顯示姓名。" },
          { status: 400 }
        );
      }
      nextDisplayName = candidate;
    }

    if (body.newPassword !== undefined && body.newPassword !== "") {
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: "新密碼長度至少需要 6 個字元。" },
          { status: 400 }
        );
      }
      const nextHash = hashPassword(body.newPassword);
      await db.run(
        "UPDATE users SET username = ?, display_name = ?, password_hash = ? WHERE id = ?",
        [nextUsername, nextDisplayName, nextHash, studentId]
      );
      await db.run("DELETE FROM sessions WHERE user_id = ?", [studentId]);
    } else {
      await db.run("UPDATE users SET username = ?, display_name = ? WHERE id = ?", [
        nextUsername,
        nextDisplayName,
        studentId,
      ]);
    }

    if (body.classIds !== undefined) {
      const nextClassIds = Array.isArray(body.classIds)
        ? body.classIds.map(Number)
        : [];
      const ownsAll = await assertTeacherOwnsAllClasses(auth.user.id, nextClassIds);
      if (!ownsAll.ok) return ownsAll.response;

      const teacherClasses = await db.queryAll<{ id: number }>(
        "SELECT id FROM classes WHERE teacher_id = ?",
        [auth.user.id]
      );
      const teacherClassIds = teacherClasses.map((c) => Number(c.id));
      if (teacherClassIds.length > 0) {
        const ph = teacherClassIds.map(() => "?").join(",");
        await db.run(
          `DELETE FROM class_members WHERE student_id = ? AND class_id IN (${ph})`,
          [studentId, ...teacherClassIds]
        );
      }
      const uniqueNextIds = Array.from(new Set(nextClassIds));
      await db.execBatch(
        uniqueNextIds.map((cid) => ({
          sql: "INSERT OR IGNORE INTO class_members (class_id, student_id) VALUES (?, ?)",
          args: [cid, studentId],
        }))
      );
    }

    const progress = await buildTeacherStudentProgress(auth.user.id, studentId);
    const listRes = await listTeacherManagedStudents(auth.user.id, null);
    const updatedSummary = listRes.ok
      ? listRes.students.find((s) => s.id === studentId) ?? null
      : null;

    return NextResponse.json({ student: updatedSummary, progress });
  } catch (err) {
    console.error("update teacher student error", err);
    return NextResponse.json({ error: "更新學生帳號失敗。" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const studentId = Number(id);
  const check = await assertTeacherManagesStudent(auth.user.id, studentId);
  if (!check.ok) return check.response;

  const db = await getDb();

  if (check.otherTeacherClassCount === 0) {
    await db.run("DELETE FROM users WHERE id = ? AND role = 'student'", [studentId]);
    return NextResponse.json({ ok: true, mode: "deleted_account" });
  }

  const ownedIds = check.ownedClasses.map((c) => c.class_id);
  const ph = ownedIds.map(() => "?").join(",");
  await db.run(
    `DELETE FROM class_members WHERE student_id = ? AND class_id IN (${ph})`,
    [studentId, ...ownedIds]
  );

  return NextResponse.json({ ok: true, mode: "removed_from_owned_classes" });
}
