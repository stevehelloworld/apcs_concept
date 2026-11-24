"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
      setErrorMsg("請先登入即可批改並記錄進度。");
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
      setErrorMsg("網路連線異常，請重試。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rail-frame p-4 sm:p-5 space-y-4">
      {/* Meta Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {question.official_ref && (
            <span className="rounded bg-white px-2 py-0.5 font-code font-bold text-[#0B1230]">
              {question.official_ref}
            </span>
          )}
          <span className="rounded border border-white/25 px-2 py-0.5 font-bold text-white">
            {QUESTION_TYPE_LABELS[question.question_type]}
          </span>
          <span className="font-code text-[#7E91B8]">
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          {question.class_name && (
            <span className="rounded bg-[#22B14C]/18 border border-[#22B14C]/45 px-2 py-0.5 font-bold text-[#4ADE80]">
              {question.class_name}
            </span>
          )}
        </div>

        {question.user_last_attempt && !result && (
          <span
            className={`inline-flex items-center gap-1.5 font-code text-xs font-bold ${
              question.user_last_attempt.is_correct
                ? "text-[#4ADE80]"
                : "text-[#FF7A85]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                question.user_last_attempt.is_correct
                  ? "bg-[#22B14C]"
                  : "bg-[#E21D2D]"
              }`}
            />
            {question.user_last_attempt.is_correct
              ? `已過關 (${question.user_last_attempt.selected_option})`
              : `待訂正 (${question.user_last_attempt.selected_option})`}
          </span>
        )}
      </div>

      <h3 className="text-base font-black text-white">{question.title}</h3>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Prompt + 4 Option Rows */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-6">
          <div className="space-y-3.5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#B8C5E0]">
              {question.prompt}
            </p>

            <div
              className="space-y-2"
              role="radiogroup"
              aria-label={`題目 ${question.title} 選項`}
            >
              {question.options.map((opt) => {
                const isSelected = selected === opt.key;
                const isCorrectOpt = result && result.correctOption === opt.key;
                const isWrongSelected =
                  result && result.selectedOption === opt.key && !result.isCorrect;

                let btnCls =
                  "border-white/20 bg-[#070C22] text-white hover:border-white/55";
                let badgeCls = "border-white/30 bg-[#0B1230] text-white";

                if (isCorrectOpt) {
                  btnCls = "border-[#22B14C] bg-[#22B14C]/18 text-white";
                  badgeCls = "border-[#22B14C] bg-[#168A3B] text-white";
                } else if (isWrongSelected) {
                  btnCls = "border-[#E21D2D] bg-[#E21D2D]/18 text-white";
                  badgeCls = "border-[#E21D2D] bg-[#E21D2D] text-white";
                } else if (isSelected) {
                  btnCls = "border-[#1E5BFF] bg-[#1E5BFF]/20 text-white";
                  badgeCls = "border-[#1E5BFF] bg-[#1E5BFF] text-white";
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
                    className={`flex w-full items-start gap-3 rounded-[5px] border px-3 py-2 text-left text-sm ui-transition ${btnCls}`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border font-code text-xs font-bold ${badgeCls}`}
                    >
                      {opt.key}
                    </span>
                    <span className="font-code text-[13px] font-medium leading-snug break-all pt-0.5">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded border border-[#E21D2D]/50 bg-[#E21D2D]/15 px-3 py-2 text-xs text-[#FF7A85]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span>{errorMsg}</span>
                {!isLoggedIn && (
                  <Link href="/login" className="ml-auto font-bold underline">
                    前往登入
                  </Link>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="rail-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>
                  {submitting ? "批改中" : result ? "重新作答" : "送出批改"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Code */}
        <div className="lg:col-span-6">
          <PythonCodeView
            code={question.code}
            caption={question.official_ref ?? "PYTHON 3"}
          />
        </div>
      </div>

      {/* Diagnostic Result */}
      {result && (
        <div className="space-y-3 border-t border-white/20 pt-4">
          <div
            className={`rounded border p-3.5 ${
              result.isCorrect
                ? "border-[#22B14C]/55 bg-[#22B14C]/12"
                : "border-[#E21D2D]/55 bg-[#E21D2D]/12"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {result.isCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.2} />
              ) : (
                <XCircle className="h-4 w-4 text-[#FF7A85]" strokeWidth={2.2} />
              )}
              <span className={result.isCorrect ? "text-[#4ADE80]" : "text-[#FF7A85]"}>
                {result.isCorrect
                  ? `正確 (${result.correctOption})`
                  : `答錯（選 ${result.selectedOption} / 正解 ${result.correctOption}）`}
              </span>
            </div>
            {result.selectedMisconception && (
              <p className="mt-1.5 text-xs leading-relaxed text-[#B8C5E0]">
                {result.selectedMisconception}
              </p>
            )}
          </div>

          <div className="rail-well p-3.5">
            <div className="mb-1 font-code text-[11px] font-bold text-[#7E91B8]">
              詳解
            </div>
            <p className="whitespace-pre-line text-xs leading-relaxed text-[#B8C5E0]">
              {result.explanation}
            </p>
          </div>

          {result.traceSteps && result.traceSteps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className="rail-btn inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold"
              >
                <PlayCircle className="h-4 w-4 text-[#FFC20E]" strokeWidth={2} />
                <span>{showTrace ? "收合追蹤" : "單步重播"}</span>
                {showTrace ? (
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>

              {showTrace && (
                <div className="mt-3">
                  <CodeTraceStepper
                    code={question.code}
                    steps={result.traceSteps}
                    title={question.title}
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
