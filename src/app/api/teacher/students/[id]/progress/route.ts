import { NextResponse } from "next/server";
import { assertTeacherManagesStudent, requireRole } from "@/lib/auth";
import { getDb, toPlain } from "@/lib/db";
import { buildTeacherStudentProgress } from "@/lib/teacher-queries";

export const dynamic = "force-dynamic";

type ProgressActionBody =
  | { action: "delete_attempt"; attemptId?: number }
  | { action: "reset_topic"; topicId?: number }
  | { action: "reset_wrong" }
  | { action: "reset_all" }
  | { action: "mark_question"; questionId?: number; status?: "passed" | "clear" };

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const studentId = Number(id);
  const check = await assertTeacherManagesStudent(auth.user.id, studentId);
  if (!check.ok) return check.response;

  const ownedClassIds = check.ownedClasses.map((c) => c.class_id);
  const db = await getDb();

  async function getAccessibleQuestionIds(topicId?: number): Promise<number[]> {
    const classPh = ownedClassIds.map(() => "?").join(",");
    const rows = topicId
      ? await db.queryAll<{ id: number }>(
          `SELECT id FROM questions
           WHERE topic_id = ? AND (class_id IS NULL OR class_id IN (${classPh}))`,
          [topicId, ...ownedClassIds]
        )
      : await db.queryAll<{ id: number }>(
          `SELECT id FROM questions
           WHERE class_id IS NULL OR class_id IN (${classPh})`,
          ownedClassIds
        );
    return rows.map((r) => Number(r.id));
  }

  try {
    const body = (await req.json()) as ProgressActionBody;

    if (body.action === "delete_attempt") {
      const attemptId = Number(body.attemptId);
      if (!Number.isInteger(attemptId) || attemptId <= 0) {
        return NextResponse.json({ error: "無效的作答紀錄編號。" }, { status: 400 });
      }
      const attRow = await db.queryOne<{ id: number; question_id: number }>(
        "SELECT id, question_id FROM attempts WHERE id = ? AND user_id = ?",
        [attemptId, studentId]
      );
      if (!attRow) {
        return NextResponse.json({ error: "找不到指定的作答紀錄。" }, { status: 404 });
      }
      const accessibleIds = await getAccessibleQuestionIds();
      if (!accessibleIds.includes(Number(attRow.question_id))) {
        return NextResponse.json(
          { error: "無權刪除非本人管理範圍題目的作答紀錄。" },
          { status: 403 }
        );
      }
      await db.run("DELETE FROM attempts WHERE id = ? AND user_id = ?", [
        attemptId,
        studentId,
      ]);
    } else if (body.action === "reset_topic") {
      const topicId = Number(body.topicId);
      if (!Number.isInteger(topicId) || topicId <= 0) {
        return NextResponse.json({ error: "無效的主題編號。" }, { status: 400 });
      }
      const qIds = await getAccessibleQuestionIds(topicId);
      if (qIds.length > 0) {
        const ph = qIds.map(() => "?").join(",");
        await db.run(
          `DELETE FROM attempts WHERE user_id = ? AND question_id IN (${ph})`,
          [studentId, ...qIds]
        );
      }
    } else if (body.action === "reset_wrong") {
      if (check.otherTeacherClassCount === 0) {
        await db.run("DELETE FROM attempts WHERE user_id = ? AND is_correct = 0", [
          studentId,
        ]);
      } else {
        const qIds = await getAccessibleQuestionIds();
        if (qIds.length > 0) {
          const ph = qIds.map(() => "?").join(",");
          await db.run(
            `DELETE FROM attempts WHERE user_id = ? AND is_correct = 0 AND question_id IN (${ph})`,
            [studentId, ...qIds]
          );
        }
      }
    } else if (body.action === "reset_all") {
      if (check.otherTeacherClassCount === 0) {
        await db.run("DELETE FROM attempts WHERE user_id = ?", [studentId]);
      } else {
        const qIds = await getAccessibleQuestionIds();
        if (qIds.length > 0) {
          const ph = qIds.map(() => "?").join(",");
          await db.run(
            `DELETE FROM attempts WHERE user_id = ? AND question_id IN (${ph})`,
            [studentId, ...qIds]
          );
        }
      }
    } else if (body.action === "mark_question") {
      const questionId = Number(body.questionId);
      const status = body.status;
      if (
        !Number.isInteger(questionId) ||
        questionId <= 0 ||
        (status !== "passed" && status !== "clear")
      ) {
        return NextResponse.json({ error: "無效的題目進度操作參數。" }, { status: 400 });
      }
      const qRow = await db.queryOne<{
        id: number;
        class_id: number | null;
        correct_option: "A" | "B" | "C" | "D";
      }>("SELECT id, class_id, correct_option FROM questions WHERE id = ?", [
        questionId,
      ]);
      if (!qRow) {
        return NextResponse.json({ error: "找不到指定的題目。" }, { status: 404 });
      }
      const q = toPlain<{
        id: number;
        class_id: number | null;
        correct_option: "A" | "B" | "C" | "D";
      }>(qRow);

      if (q.class_id !== null && !ownedClassIds.includes(Number(q.class_id))) {
        return NextResponse.json(
          { error: "無權操作非本人班級題目的學生進度。" },
          { status: 403 }
        );
      }

      if (status === "clear") {
        await db.run(
          "DELETE FROM attempts WHERE user_id = ? AND question_id = ?",
          [studentId, questionId]
        );
      } else {
        await db.run(
          `INSERT INTO attempts (user_id, question_id, assignment_id, selected_option, is_correct, duration_sec)
           VALUES (?, ?, NULL, ?, 1, 0)`,
          [studentId, questionId, q.correct_option]
        );
      }
    } else {
      return NextResponse.json({ error: "不支援的進度操作類型。" }, { status: 400 });
    }

    const progress = await buildTeacherStudentProgress(auth.user.id, studentId);
    return NextResponse.json({ progress });
  } catch (err) {
    console.error("teacher student progress error", err);
    return NextResponse.json({ error: "更新學生進度失敗。" }, { status: 500 });
  }
}
