import { NextResponse } from "next/server";
import { canUserAccessQuestion, requireAuth } from "@/lib/auth";
import { getDb, hydrateQuestion } from "@/lib/db";
import type { AttemptSubmitResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as {
      questionId?: number;
      selectedOption?: string;
      assignmentId?: number | null;
      durationSec?: number;
    };

    const questionId = Number(body.questionId);
    const selectedOption = String(body.selectedOption ?? "").toUpperCase();
    const durationSec = Math.max(0, Math.min(3600, Math.round(Number(body.durationSec ?? 0))));
    const assignmentId = body.assignmentId ? Number(body.assignmentId) : null;

    if (!questionId || !["A", "B", "C", "D"].includes(selectedOption)) {
      return NextResponse.json(
        { error: "請提供有效的題目 ID 與選項（A/B/C/D）。" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const row = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM questions WHERE id = ?",
      [questionId]
    );
    if (!row) {
      return NextResponse.json({ error: "找不到該題目。" }, { status: 404 });
    }

    const question = hydrateQuestion(row);
    if (!(await canUserAccessQuestion(auth.user, question))) {
      return NextResponse.json(
        { error: "您無權存取此班級專屬或尚未發佈的題目。" },
        { status: 403 }
      );
    }

    let validAssignmentId: number | null = null;
    if (assignmentId) {
      const aRow = await db.queryOne<{ id: number; class_id: number }>(
        "SELECT id, class_id FROM assignments WHERE id = ?",
        [assignmentId]
      );
      if (aRow) {
        if (auth.user.role === "student") {
          const member = await db.queryOne<{ id: number }>(
            "SELECT id FROM class_members WHERE class_id = ? AND student_id = ?",
            [aRow.class_id, auth.user.id]
          );
          if (member) validAssignmentId = Number(aRow.id);
        } else {
          validAssignmentId = Number(aRow.id);
        }
      }
    }

    const chosen = selectedOption as "A" | "B" | "C" | "D";
    const isCorrect = chosen === question.correct_option;

    const insertRes = await db.run(
      `INSERT INTO attempts (user_id, question_id, assignment_id, selected_option, is_correct, duration_sec)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        auth.user.id,
        question.id,
        validAssignmentId,
        chosen,
        isCorrect ? 1 : 0,
        durationSec,
      ]
    );

    const chosenOptionObj = question.options.find((o) => o.key === chosen);

    const payload: AttemptSubmitResult = {
      attemptId: Number(insertRes.lastInsertRowid),
      questionId: question.id,
      selectedOption: chosen,
      isCorrect,
      correctOption: question.correct_option,
      selectedMisconception: chosenOptionObj?.misconception ?? "",
      options: question.options,
      explanation: question.explanation,
      traceSteps: question.trace_steps,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("submit attempt error", err);
    return NextResponse.json({ error: "批改提交失敗，請稍後再試。" }, { status: 500 });
  }
}
