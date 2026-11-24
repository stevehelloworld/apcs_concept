import { NextResponse } from "next/server";
import { canUserAccessQuestion, getCurrentUser } from "@/lib/auth";
import { getDb, hydrateQuestion } from "@/lib/db";
import type { AttemptSubmitResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (user?.role === "student") {
      return NextResponse.json(
        { error: "學生帳號請使用「送出批改」以記錄學習進度。" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const questionId = Number(id);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return NextResponse.json({ error: "無效的題目編號。" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      selectedOption?: string;
    };
    const rawOpt = String(body.selectedOption ?? "").toUpperCase();
    const chosen = ["A", "B", "C", "D"].includes(rawOpt)
      ? (rawOpt as "A" | "B" | "C" | "D")
      : null;

    const db = await getDb();
    const row = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM questions WHERE id = ?",
      [questionId]
    );
    if (!row) {
      return NextResponse.json({ error: "找不到該題目。" }, { status: 404 });
    }

    const question = hydrateQuestion(row);
    if (!user) {
      if (question.class_id !== null || !question.is_published) {
        return NextResponse.json(
          { error: "您無權預覽此班級專屬或尚未發佈的題目。" },
          { status: 403 }
        );
      }
    } else if (!(await canUserAccessQuestion(user, question))) {
      return NextResponse.json(
        { error: "您無權存取此班級專屬或尚未發佈的題目。" },
        { status: 403 }
      );
    }

    const selectedOption = chosen ?? question.correct_option;
    const isCorrect = chosen ? chosen === question.correct_option : true;
    const chosenObj = chosen
      ? question.options.find((o) => o.key === chosen)
      : question.options.find((o) => o.key === question.correct_option);

    const payload: AttemptSubmitResult = {
      attemptId: 0,
      questionId: question.id,
      selectedOption,
      isCorrect,
      correctOption: question.correct_option,
      selectedMisconception: chosenObj?.misconception ?? "",
      options: question.options,
      explanation: question.explanation,
      traceSteps: question.trace_steps,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("reveal question error", err);
    return NextResponse.json({ error: "系統無法載入解析。" }, { status: 500 });
  }
}
