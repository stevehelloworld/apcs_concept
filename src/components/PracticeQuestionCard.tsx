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
      setErrorMsg("請先登入學生帳號，即可即時批改、檢視錯題診斷並保存通關燈號。");
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
    <article className="synth-panel-hard p-5 sm:p-6">
      {/* Header Meta Strip */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#C4CBD6] pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {question.official_ref && (
            <span className="rounded-md bg-[#161A22] px-2.5 py-0.5 font-code text-xs font-bold text-white">
              {question.official_ref}
            </span>
          )}
          <span className="rounded-md border border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-0.5 text-xs font-bold text-[#11151C]">
            {QUESTION_TYPE_LABELS[question.question_type]}
          </span>
          <span className="rounded-md border border-[#C4CBD6] bg-white px-2.5 py-0.5 text-xs font-medium text-[#4B5565]">
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          {question.class_name && (
            <span className="rounded-md bg-[#E6F7F2] px-2.5 py-0.5 text-xs font-bold text-[#007A5B]">
              班級專屬：{question.class_name}
            </span>
          )}
        </div>

        {question.user_last_attempt && !result && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${
              question.user_last_attempt.is_correct
                ? "border-[#9EE7D0] bg-[#E6FAF3] text-[#007A57]"
                : "border-[#F9B4B4] bg-[#FDECEC] text-[#C62828]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                question.user_last_attempt.is_correct
                  ? "bg-[#00C48C]"
                  : "bg-[#FF4757]"
              }`}
            />
            <span>
              {question.user_last_attempt.is_correct
                ? `已破關（選 ${question.user_last_attempt.selected_option}）`
                : `待訂正（上次選 ${question.user_last_attempt.selected_option}）`}
            </span>
          </span>
        )}
      </div>

      <h3 className="mb-4 text-lg font-bold text-[#11151C]">{question.title}</h3>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Prompt & Keycap Options */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-6">
          <div className="space-y-4">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#11151C]">
              {question.prompt}
            </p>

            <div
              className="space-y-2.5"
              role="radiogroup"
              aria-label={`題目 ${question.title} 選項`}
            >
              {question.options.map((opt) => {
                const isSelected = selected === opt.key;
                const isCorrectOpt = result && result.correctOption === opt.key;
                const isWrongSelected =
                  result && result.selectedOption === opt.key && !result.isCorrect;

                let btnCls =
                  "border-[#C4CBD6] bg-[#F8F9FB] text-[#11151C] hover:border-[#161A22] hover:bg-white";
                let badgeCls =
                  "border-[#161A22] bg-white text-[#11151C]";

                if (isCorrectOpt) {
                  btnCls = "border-[#007A57] bg-[#E6FAF3] text-[#005C41]";
                  badgeCls = "border-[#007A57] bg-[#007A57] text-white";
                } else if (isWrongSelected) {
                  btnCls = "border-[#C62828] bg-[#FDECEC] text-[#A61B1B]";
                  badgeCls = "border-[#C62828] bg-[#C62828] text-white";
                } else if (isSelected) {
                  btnCls = "border-[#161A22] bg-[#FFF1EC] text-[#11151C] ring-2 ring-[#FF4F17]/30";
                  badgeCls = "border-[#161A22] bg-[#D93B09] text-white";
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
                    className={`flex w-full items-start gap-3 rounded-xl border-[1.5px] px-3.5 py-2.5 text-left text-sm ui-transition ${btnCls}`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] font-code text-xs font-bold ${badgeCls}`}
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

          <div className="space-y-3 pt-1">
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border-[1.5px] border-[#F9B4B4] bg-[#FDECEC] px-3.5 py-2.5 text-xs font-medium text-[#C62828]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                <div className="flex-1">
                  <span>{errorMsg}</span>
                  {!isLoggedIn && (
                    <Link
                      href="/login"
                      className="ml-2 font-bold underline hover:opacity-80"
                    >
                      前往登入
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4B5565]">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                <span>提交後立即顯示迷思診斷與解答</span>
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="synth-pad-orange inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>
                  {submitting
                    ? "批改中..."
                    : result
                    ? "再挑戰一次"
                    : "送出看診斷"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: OLED Python Code */}
        <div className="lg:col-span-6">
          <PythonCodeView
            code={question.code}
            caption={
              question.official_ref
                ? `APCS ${question.official_ref} // CODE`
                : "PYTHON 3 // CODE"
            }
          />
        </div>
      </div>

      {/* Diagnostic Feedback Panel */}
      {result && (
        <div className="mt-6 space-y-4 border-t-2 border-[#C4CBD6] pt-5">
          <div
            className={`rounded-xl border-2 p-4 ${
              result.isCorrect
                ? "border-[#007A57] bg-[#E6FAF3]"
                : "border-[#C62828] bg-[#FDECEC]"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2">
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-[#007A57]" strokeWidth={2.2} />
              ) : (
                <XCircle className="h-5 w-5 text-[#C62828]" strokeWidth={2.2} />
              )}
              <span
                className={`text-sm font-bold ${
                  result.isCorrect ? "text-[#007A57]" : "text-[#C62828]"
                }`}
              >
                {result.isCorrect
                  ? `破關成功！正確答案就是 (${result.correctOption})`
                  : `答錯了（你選 (${result.selectedOption})，正確答案是 (${result.correctOption})）`}
              </span>
            </div>
            {result.selectedMisconception && (
              <p className="text-sm leading-relaxed text-[#11151C]">
                <span className="font-bold">
                  {result.isCorrect ? "觀念確認：" : "抓到迷思陷阱："}
                </span>
                {result.selectedMisconception}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-[#F3F5F8] p-4 border border-[#C4CBD6]">
            <div className="mb-1.5 font-display text-xs font-bold text-[#4B5565]">
              SOLVE // 考場手解法詳解
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[#11151C]">
              {result.explanation}
            </p>
          </div>

          {result.traceSteps && result.traceSteps.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className="synth-pad-dark inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
              >
                <PlayCircle className="h-4 w-4 text-[#FF4F17]" strokeWidth={2} />
                <span>
                  {showTrace
                    ? "收合單步執行追蹤器"
                    : "用單步執行追蹤器重播本題"}
                </span>
                {showTrace ? (
                  <ChevronUp className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                )}
              </button>

              {showTrace && (
                <div className="mt-4">
                  <CodeTraceStepper
                    code={question.code}
                    steps={result.traceSteps}
                    title={`${question.title} — 單步追蹤重播`}
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
