"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Clock, Layers, Terminal } from "lucide-react";
import type { PublicQuestionRecord, QuestionType, TopicSummary } from "@/lib/types";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  QUESTION_TYPE_LABELS,
} from "@/lib/types";

interface TopicsDirectoryClientProps {
  topics: TopicSummary[];
  allQuestions: PublicQuestionRecord[];
}

export function TopicsDirectoryClient({
  topics,
  allQuestions,
}: TopicsDirectoryClientProps) {
  const [viewMode, setViewMode] = useState<"topic" | "type">("topic");
  const allTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

  return (
    <div className="space-y-6">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E0D8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17191C]">全主題導覽與雙軸目錄</h1>
          <p className="mt-1 text-sm text-[#525866]">
            依五大知識單元循序學習，或切換為「認知題型」跨主題特訓弱點項目
          </p>
        </div>

        <div className="inline-flex rounded-md border border-[#E2E0D8] bg-[#F0EFEA] p-1">
          <button
            type="button"
            onClick={() => setViewMode("topic")}
            className={`rounded px-3 py-1.5 text-xs font-medium ui-transition ${
              viewMode === "topic"
                ? "bg-white text-[#1E4E8C] shadow-xs"
                : "text-[#525866] hover:text-[#17191C]"
            }`}
          >
            依五大主題檢視
          </button>
          <button
            type="button"
            onClick={() => setViewMode("type")}
            className={`rounded px-3 py-1.5 text-xs font-medium ui-transition ${
              viewMode === "type"
                ? "bg-white text-[#1E4E8C] shadow-xs"
                : "text-[#525866] hover:text-[#17191C]"
            }`}
          >
            依六大認知題型檢視
          </button>
        </div>
      </div>

      {viewMode === "topic" ? (
        <div className="space-y-4">
          {topics.map((t, idx) => {
            const topicQs = allQuestions.filter((q) => q.topic_id === t.id);
            return (
              <section
                key={t.id}
                className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-[#EAF1FA] px-2 py-0.5 font-code font-semibold text-[#1E4E8C]">
                        單元 {idx + 1}
                      </span>
                      <span className="text-[#525866]">{t.exam_weight}</span>
                      <span className="inline-flex items-center gap-1 text-[#6C7382]">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                        建議 {t.study_minutes} 分鐘
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#17191C]">{t.title}</h2>
                    <p className="text-sm text-[#525866] leading-relaxed">{t.summary}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/topics/${t.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3.5 py-2 text-xs font-medium text-white ui-transition hover:bg-[#163C6E]"
                    >
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span>開啟互動教學頁</span>
                    </Link>
                    <Link
                      href={`/practice?topic=${t.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs font-medium text-[#17191C] ui-transition hover:bg-[#F0EFEA]"
                    >
                      <Terminal className="h-3.5 w-3.5" strokeWidth={1.75} />
                      <span>本單元刷題 ({t.question_count})</span>
                    </Link>
                  </div>
                </div>

                {/* Topic progress if student */}
                {t.student_correct !== undefined && (
                  <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-3.5 py-2 flex items-center justify-between gap-4 text-xs">
                    <span className="text-[#525866]">
                      個人掌握進度：{t.student_correct} / {t.question_count} 題答對（已練習{" "}
                      {t.student_attempted} 題）
                    </span>
                    <div className="w-40 h-2 rounded-full bg-[#E2E0D8] overflow-hidden">
                      <div
                        style={{
                          width: `${
                            t.question_count > 0
                              ? Math.round((t.student_correct / t.question_count) * 100)
                              : 0
                          }%`,
                        }}
                        className="h-full bg-[#157F4B]"
                      />
                    </div>
                  </div>
                )}

                {/* Question index pills */}
                <div className="border-t border-[#E2E0D8] pt-3">
                  <div className="mb-2 text-xs font-semibold text-[#525866]">
                    涵蓋題目清單（點擊直接至練習頁做題）：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topicQs.map((q) => (
                      <Link
                        key={q.id}
                        href={`/practice?topic=${t.slug}&qid=${q.id}`}
                        className="inline-flex items-center gap-1.5 rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 text-xs ui-transition hover:border-[#1E4E8C] hover:bg-[#EAF1FA]"
                      >
                        {q.official_ref && (
                          <span className="font-code font-semibold text-[#1E4E8C]">
                            {q.official_ref}
                          </span>
                        )}
                        <span className="text-[#17191C]">{q.title}</span>
                        <span className="text-[11px] text-[#6C7382]">
                          ({QUESTION_TYPE_LABELS[q.question_type]})
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {allTypes.map((qt) => {
            const typeQs = allQuestions.filter((q) => q.question_type === qt);
            return (
              <section
                key={qt}
                className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#1E4E8C]" strokeWidth={1.75} />
                      <h2 className="text-base font-bold text-[#17191C]">
                        {QUESTION_TYPE_LABELS[qt]}
                      </h2>
                      <span className="rounded bg-[#EAF1FA] px-2 py-0.5 font-code text-xs font-semibold text-[#1E4E8C] tabular-nums">
                        {typeQs.length} 題
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#525866]">
                      {QUESTION_TYPE_DESCRIPTIONS[qt]}
                    </p>
                  </div>

                  <Link
                    href={`/practice?type=${qt}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3.5 py-2 text-xs font-medium text-white ui-transition hover:bg-[#163C6E]"
                  >
                    <span>開始此題型特訓</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Link>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 border-t border-[#E2E0D8] pt-3">
                  {typeQs.map((q) => (
                    <Link
                      key={q.id}
                      href={`/practice?type=${qt}&qid=${q.id}`}
                      className="flex flex-col justify-between rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs ui-transition hover:border-[#1E4E8C] hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-code font-semibold text-[#1E4E8C]">
                          {q.official_ref ?? `Q#${q.id}`}
                        </span>
                        <span className="text-[#6C7382]">{DIFFICULTY_LABELS[q.difficulty]}</span>
                      </div>
                      <div className="font-medium text-[#17191C]">{q.title}</div>
                      <div className="mt-1 text-[11px] text-[#525866]">{q.topic_title}</div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
