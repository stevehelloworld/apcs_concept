"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Cpu, Terminal } from "lucide-react";
import { getTopicTheme, QUESTION_TYPE_PAD_CODES } from "@/lib/topic-theme";
import type { PublicQuestionRecord, QuestionType, TopicSummary } from "@/lib/types";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";

interface TopicsDirectoryClientProps {
  topics: TopicSummary[];
  allQuestions: PublicQuestionRecord[];
  isLoggedIn: boolean;
}

export function TopicsDirectoryClient({
  topics,
  allQuestions,
  isLoggedIn,
}: TopicsDirectoryClientProps) {
  const [viewMode, setViewMode] = useState<"topic" | "type">("topic");
  const allTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
  const solvedTotal = allQuestions.filter((q) => q.user_last_attempt?.is_correct).length;

  return (
    <div className="space-y-6">
      {/* Compact Header & Switcher */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">
            路線總覽
          </h1>
          {isLoggedIn && (
            <span className="inline-flex items-center gap-1.5 rounded border border-[#22B14C]/45 bg-[#22B14C]/15 px-2.5 py-0.5 font-code text-xs font-bold text-[#4ADE80] tabular-nums">
              <span className="h-2 w-2 rounded-full bg-[#22B14C]" />
              {solvedTotal}/{allQuestions.length} 過關
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="rail-well inline-flex p-0.5 gap-0.5"
            role="tablist"
            aria-label="檢視模式切換"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "topic"}
              onClick={() => setViewMode("topic")}
              className={`whitespace-nowrap rounded px-3 py-1 font-code text-xs font-bold ui-transition ${
                viewMode === "topic"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              路線 L1–L5
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "type"}
              onClick={() => setViewMode("type")}
              className={`whitespace-nowrap rounded px-3 py-1 font-code text-xs font-bold ui-transition ${
                viewMode === "type"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              題型 T1–T6
            </button>
          </div>

          <Link
            href="/practice"
            className="rail-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>綜合刷題</span>
          </Link>
        </div>
      </header>

      {viewMode === "topic" ? (
        <div className="space-y-4">
          {topics.map((t, idx) => {
            const theme = getTopicTheme(t.slug, idx);
            const topicQs = allQuestions.filter((q) => q.topic_id === t.id);
            const solvedCount = topicQs.filter(
              (q) => q.user_last_attempt?.is_correct
            ).length;

            return (
              <section
                key={t.id}
                id={`mod-${t.slug}`}
                className="rail-frame p-4 sm:p-5 space-y-4"
              >
                {/* Line Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <span
                      className="rounded px-2 py-0.5 font-display text-xs font-extrabold shrink-0"
                      style={{
                        backgroundColor: theme.hex,
                        color: theme.buttonText,
                      }}
                    >
                      {theme.code}
                    </span>
                    <h2 className="text-lg font-black text-white truncate">
                      {t.title}
                    </h2>
                    <span className="font-code text-xs text-[#7E91B8] tabular-nums shrink-0">
                      {isLoggedIn
                        ? `${solvedCount}/${topicQs.length} 過關`
                        : `${topicQs.length} 站`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/topics/${t.slug}`}
                      style={{
                        backgroundColor: theme.buttonBg,
                        color: theme.buttonText,
                      }}
                      className="inline-flex items-center gap-1.5 rounded-[5px] border border-white/25 px-3 py-1.5 text-xs font-bold ui-transition hover:opacity-90"
                    >
                      <Cpu className="h-3.5 w-3.5" strokeWidth={2} />
                      <span>互動實驗室</span>
                    </Link>
                    <Link
                      href={`/practice?topic=${t.slug}`}
                      className="rail-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
                    >
                      <span>刷題</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>

                {/* Enamel Track + Station Pills */}
                <div className="space-y-3 pt-1">
                  <div
                    className="h-[3px] w-full rounded-full"
                    style={{ backgroundColor: theme.hex }}
                  />

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {topicQs.map((q) => {
                      const att = q.user_last_attempt;
                      const dotColor = att
                        ? att.is_correct
                          ? "#22B14C"
                          : "#E21D2D"
                        : "#FFFFFF";

                      return (
                        <Link
                          key={q.id}
                          href={`/practice?topic=${t.slug}&qid=${q.id}`}
                          className="rail-well group flex items-center justify-between gap-2.5 px-3 py-2.5 hover:border-white/50 ui-transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="h-3 w-3 rounded-full shrink-0 border-2"
                              style={{
                                backgroundColor: dotColor,
                                borderColor: att ? "#FFFFFF" : theme.hex,
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-code text-[11px] text-[#7E91B8]">
                                <span className="font-bold text-white">
                                  {q.official_ref ?? `Q${q.id}`}
                                </span>
                                <span>·</span>
                                <span>{QUESTION_TYPE_LABELS[q.question_type]}</span>
                                <span>·</span>
                                <span>{DIFFICULTY_LABELS[q.difficulty]}</span>
                              </div>
                              <div className="truncate text-xs font-bold text-[#B8C5E0] group-hover:text-white">
                                {q.title}
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0 text-[#7E91B8] group-hover:text-white group-hover:translate-x-0.5 ui-transition"
                            strokeWidth={2}
                          />
                        </Link>
                      );
                    })}
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
              <section key={qt} className="rail-frame p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-white px-2 py-0.5 font-display text-xs font-extrabold text-[#0B1230]">
                      {QUESTION_TYPE_PAD_CODES[qt]}
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {QUESTION_TYPE_LABELS[qt]}
                    </h2>
                    <span className="font-code text-xs text-[#7E91B8] tabular-nums">
                      {typeQs.length} 站
                    </span>
                  </div>

                  <Link
                    href={`/practice?type=${qt}`}
                    className="rail-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
                  >
                    <span>特訓</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </Link>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {typeQs.map((q) => {
                    const topicTheme = getTopicTheme(q.topic_slug);
                    const att = q.user_last_attempt;
                    const dotColor = att
                      ? att.is_correct
                        ? "#22B14C"
                        : "#E21D2D"
                      : "#FFFFFF";

                    return (
                      <Link
                        key={q.id}
                        href={`/practice?type=${qt}&qid=${q.id}`}
                        className="rail-well group flex items-center justify-between gap-2.5 px-3 py-2.5 hover:border-white/50 ui-transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0 border-2"
                            style={{
                              backgroundColor: dotColor,
                              borderColor: att ? "#FFFFFF" : topicTheme.hex,
                            }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-code text-[11px] text-[#7E91B8]">
                              <span className="font-bold text-white">
                                {q.official_ref ?? `Q${q.id}`}
                              </span>
                              <span>·</span>
                              <span style={{ color: topicTheme.text }}>
                                {topicTheme.code}
                              </span>
                              <span>·</span>
                              <span>{DIFFICULTY_LABELS[q.difficulty]}</span>
                            </div>
                            <div className="truncate text-xs font-bold text-[#B8C5E0] group-hover:text-white">
                              {q.title}
                            </div>
                          </div>
                        </div>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-[#7E91B8] group-hover:text-white"
                          strokeWidth={2}
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
