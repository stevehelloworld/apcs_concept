"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  PlayCircle,
  Send,
  XCircle,
} from "lucide-react";
import type { AttemptSubmitResult, PublicQuestionRecord } from "@/lib/types";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";
import { CodeTraceStepper } from "./CodeTraceStepper";
import { PythonCodeView } from "./PythonCodeView";

interface PracticeQuestionCardProps {
  question: PublicQuestionRecord;
  assignmentId?: number | null;
  isLoggedIn: boolean;
  onAttempted?: (questionId: number, result: AttemptSubmitResult) => void;
}

export function PracticeQuestionCard({
  question,
  assignmentId = null,
  isLoggedIn,
  onAttempted,
}: PracticeQuestionCardProps) {
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(
    question.user_last_attempt?.selected_option ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptSubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(false);
  const [startTime, setStartTime] = useState<number>(() => Date.now());

  useEffect(() => {
    setSelected(question.user_last_attempt?.selected_option ?? null);
    setResult(null);
    setErrorMsg(null);
    setShowTrace(false);
    setStartTime(Date.now());
  }, [question.id, question.user_last_attempt?.selected_option]);

  async function handleSubmit() {
    if (!selected) return;
    if (!isLoggedIn) {
      setErrorMsg("請先登入學生帳號，即可立即批改、取得迷思診斷並保存作答紀錄。");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: selected,
          assignmentId,
          durationSec,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "批改失敗，請重試。");
        return;
      }
      setResult(data as AttemptSubmitResult);
      onAttempted?.(question.id, data as AttemptSubmitResult);
    } catch {
      setErrorMsg("網路連線異常，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      {/* Header meta row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {question.official_ref && (
            <span className="rounded bg-[#17191C] px-2 py-0.5 font-code text-xs font-medium text-white">
              {question.official_ref}
            </span>
          )}
          <span className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2 py-0.5 text-xs font-medium text-[#17191C]">
            {QUESTION_TYPE_LABELS[question.question_type]}
          </span>
          <span className="rounded border border-[#E2E0D8] bg-white px-2 py-0.5 text-xs text-[#525866]">
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          {question.class_name && (
            <span className="rounded bg-[#E6F4F1] px-2 py-0.5 text-xs font-medium text-[#0F6B5E]">
              班級專屬：{question.class_name}
            </span>
          )}
        </div>

        {question.user_last_attempt && !result && (
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
              question.user_last_attempt.is_correct
                ? "bg-[#EAF6EF] text-[#157F4B]"
                : "bg-[#FCEEEE] text-[#C23535]"
            }`}
          >
            {question.user_last_attempt.is_correct ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>上次答對（選 {question.user_last_attempt.selected_option}）</span>
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>待訂正（上次選 {question.user_last_attempt.selected_option}）</span>
              </>
            )}
          </span>
        )}
      </div>

      <h3 className="mb-3 text-base font-semibold text-[#17191C]">{question.title}</h3>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Prompt & Options */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-6">
          <div className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#17191C]">
              {question.prompt}
            </p>

            <div className="space-y-2" role="radiogroup" aria-label={`題目 ${question.title} 選項`}>
              {question.options.map((opt) => {
                const isSelected = selected === opt.key;
                const isCorrectOpt = result && result.correctOption === opt.key;
                const isWrongSelected =
                  result && result.selectedOption === opt.key && !result.isCorrect;

                let btnStyle =
                  "border-[#E2E0D8] bg-white text-[#17191C] hover:border-[#1E4E8C] hover:bg-[#EAF1FA]/40";
                if (isCorrectOpt) {
                  btnStyle = "border-[#157F4B] bg-[#EAF6EF] text-[#157F4B]";
                } else if (isWrongSelected) {
                  btnStyle = "border-[#C23535] bg-[#FCEEEE] text-[#C23535]";
                } else if (isSelected) {
                  btnStyle = "border-[#1E4E8C] bg-[#EAF1FA] text-[#1E4E8C]";
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSelected(opt.key);
                      setErrorMsg(null);
                    }}
                    disabled={submitting}
                    className={`flex w-full items-start gap-3 rounded-md border px-3.5 py-2.5 text-left text-sm ui-transition ${btnStyle}`}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-current font-code text-xs font-semibold">
                      {opt.key}
                    </span>
                    <span className="font-code text-[13px] leading-snug break-all">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-md border border-[#C23535]/30 bg-[#FCEEEE] px-3 py-2 text-xs text-[#C23535]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <div className="flex-1">
                  <span>{errorMsg}</span>
                  {!isLoggedIn && (
                    <Link
                      href="/login"
                      className="ml-2 font-semibold underline hover:opacity-80"
                    >
                      前往登入
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-[#6C7382]">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>提交後立即顯示迷思診斷與詳解</span>
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-4 py-2 text-sm font-medium text-white ui-transition hover:bg-[#163C6E] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{submitting ? "批改中..." : result ? "重新作答提交" : "提交答案"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Python Code */}
        <div className="lg:col-span-6">
          <PythonCodeView
            code={question.code}
            caption={question.official_ref ? `APCS ${question.official_ref}` : "Python 程式碼"}
          />
        </div>
      </div>

      {/* Diagnostic Feedback Panel */}
      {result && (
        <div className="mt-5 space-y-4 border-t border-[#E2E0D8] pt-4">
          <div
            className={`rounded-md border p-4 ${
              result.isCorrect
                ? "border-[#157F4B]/30 bg-[#EAF6EF]"
                : "border-[#C23535]/30 bg-[#FCEEEE]"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-[#157F4B]" strokeWidth={1.75} />
              ) : (
                <XCircle className="h-5 w-5 text-[#C23535]" strokeWidth={1.75} />
              )}
              <span
                className={`text-sm font-semibold ${
                  result.isCorrect ? "text-[#157F4B]" : "text-[#C23535]"
                }`}
              >
                {result.isCorrect
                  ? `答對了！正確答案為 (${result.correctOption})`
                  : `答錯了（你選 (${result.selectedOption})，正確答案為 (${result.correctOption})）`}
              </span>
            </div>
            {result.selectedMisconception && (
              <p className="text-sm leading-relaxed text-[#17191C]">
                <span className="font-semibold">
                  {result.isCorrect ? "觀念確認：" : "選項迷思診斷："}
                </span>
                {result.selectedMisconception}
              </p>
            )}
          </div>

          <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
            <div className="mb-1.5 text-xs font-semibold text-[#525866]">考場手解法詳解</div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#17191C]">
              {result.explanation}
            </p>
          </div>

          {result.traceSteps && result.traceSteps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#1E4E8C]/30 bg-[#EAF1FA] px-3.5 py-2 text-sm font-medium text-[#1E4E8C] ui-transition hover:bg-[#dce8f8]"
              >
                <PlayCircle className="h-4 w-4" strokeWidth={1.75} />
                <span>{showTrace ? "收合單步執行追蹤器" : "用單步執行追蹤器重播本題"}</span>
                {showTrace ? (
                  <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>

              {showTrace && (
                <div className="mt-3">
                  <CodeTraceStepper
                    code={question.code}
                    steps={result.traceSteps}
                    title={`${question.title} — 追蹤重播`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
