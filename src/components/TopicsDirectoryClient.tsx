"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock, Cpu, Layers, Terminal } from "lucide-react";
import { getTopicTheme, QUESTION_TYPE_PAD_CODES } from "@/lib/topic-theme";
import type { PublicQuestionRecord, QuestionType, TopicSummary } from "@/lib/types";
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
  QUESTION_TYPE_LABELS,
} from "@/lib/types";

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
      {/* Top Instrument Header + Switcher */}
      <section className="synth-panel-hard p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-[#11151C] sm:text-3xl">
              五大模組實驗室與 30 題關卡矩陣
            </h1>
            <p className="text-sm text-[#4B5565]">
              挑選一個主題進入互動動畫實驗室，或直接點擊右側關卡方格開始解題追蹤
              {isLoggedIn && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#E6FAF3] px-2.5 py-0.5 font-code text-xs font-bold text-[#007A57] tabular-nums">
                  <span className="h-2 w-2 rounded-full bg-[#00C48C]" />
                  已過關 {solvedTotal} / {allQuestions.length} 題
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className="synth-recess inline-flex p-1 gap-1"
              role="tablist"
              aria-label="檢視模式切換"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "topic"}
                onClick={() => setViewMode("topic")}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold ui-transition ${
                  viewMode === "topic"
                    ? "bg-[#161A22] text-white shadow-xs"
                    : "text-[#4B5565] hover:text-[#11151C]"
                }`}
              >
                依五大模組<span className="hidden sm:inline font-code ml-1 opacity-75">MOD</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "type"}
                onClick={() => setViewMode("type")}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold ui-transition ${
                  viewMode === "type"
                    ? "bg-[#161A22] text-white shadow-xs"
                    : "text-[#4B5565] hover:text-[#11151C]"
                }`}
              >
                依考法題型<span className="hidden sm:inline font-code ml-1 opacity-75">PAD</span>
              </button>
            </div>

            <Link
              href="/practice"
              className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>綜合刷題台</span>
            </Link>
          </div>
        </div>

        {/* Horizontal 5-Channel Patch Bar (Replaces cramped left sidebar) */}
        {viewMode === "topic" && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#D4DAE4] pt-3.5">
            <span className="font-code text-[11px] font-bold text-[#647082]">
              快速跳轉：
            </span>
            {topics.map((t, i) => {
              const theme = getTopicTheme(t.slug, i);
              return (
                <a
                  key={t.id}
                  href={`#mod-${t.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 text-xs font-bold text-[#11151C] ui-transition hover:border-[#161A22] hover:bg-[#F3F5F8]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: theme.hex }}
                  />
                  <span className="font-display text-[11px]" style={{ color: theme.text }}>
                    {theme.code}
                  </span>
                  <span>{theme.shortLabel}</span>
                  <span className="font-code text-[11px] text-[#647082] tabular-nums">
                    ({t.question_count})
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {viewMode === "topic" ? (
        <div className="space-y-5">
          {topics.map((t, idx) => {
            const theme = getTopicTheme(t.slug, idx);
            const topicQs = allQuestions.filter((q) => q.topic_id === t.id);
            const pct =
              t.student_correct !== undefined && t.question_count > 0
                ? Math.round((t.student_correct / t.question_count) * 100)
                : null;

            return (
              <section
                key={t.id}
                id={`mod-${t.slug}`}
                className="synth-panel-hard overflow-hidden"
              >
                {/* Bold Channel Strip */}
                <div className="h-2 w-full" style={{ backgroundColor: theme.hex }} />

                <div className="flex flex-col lg:flex-row">
                  {/* Left Colored Module Spec Bay */}
                  <div
                    className="lg:w-[340px] shrink-0 p-5 sm:p-6 flex flex-col justify-between gap-5 border-b lg:border-b-0 lg:border-r border-[#C4CBD6]"
                    style={{ backgroundColor: theme.softBg }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#161A22] px-2.5 py-0.5 font-display text-xs font-bold text-white">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: theme.hex }}
                          />
                          {theme.code}
                        </span>
                        <span className="inline-flex items-center gap-1 font-code text-xs font-bold text-[#4B5565]">
                          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                          {t.study_minutes} min
                        </span>
                      </div>

                      <h2 className="text-xl font-black text-[#11151C] leading-snug">
                        {t.title}
                      </h2>

                      <div className="inline-block rounded-md border border-[#C4CBD6] bg-white px-2.5 py-1 text-xs font-bold text-[#11151C]">
                        {t.exam_weight}
                      </div>

                      <p className="text-sm leading-relaxed text-[#4B5565]">
                        {t.summary}
                      </p>

                      {pct !== null && t.student_correct !== undefined && (
                        <div className="rounded-xl border border-[#C4CBD6] bg-white p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#11151C]">模組過關進度</span>
                            <span className="font-code text-[#007A57] tabular-nums">
                              {t.student_correct} / {t.question_count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#DDE2EA]">
                            <div
                              style={{
                                width: `${pct}%`,
                                backgroundColor: theme.hex,
                              }}
                              className="h-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <Link
                        href={`/topics/${t.slug}`}
                        style={{ backgroundColor: theme.buttonBg }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#161A22] px-3 py-2.5 text-xs font-bold text-white shadow-xs ui-transition hover:opacity-90"
                      >
                        <Cpu className="h-3.5 w-3.5" strokeWidth={2.2} />
                        <span>互動實驗室</span>
                      </Link>
                      <Link
                        href={`/practice?topic=${t.slug}`}
                        className="synth-pad inline-flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold"
                      >
                        <span>全刷 ({t.question_count})</span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Sequencer Pad Matrix */}
                  <div className="flex-1 bg-[#F8F9FB] p-4 sm:p-6 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-code text-xs font-bold text-[#4B5565]">
                        關卡矩陣（點選方塊進入單步解題）
                      </span>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-[#4B5565]">
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-[#00C48C]" />
                          已破關
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-[#FF4757]" />
                          待訂正
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full border border-[#647082] bg-white" />
                          未挑戰
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {topicQs.map((q) => {
                        const att = q.user_last_attempt;
                        const ledCls = att
                          ? att.is_correct
                            ? "bg-[#00C48C]"
                            : "bg-[#FF4757]"
                          : "border border-[#647082] bg-white";

                        return (
                          <Link
                            key={q.id}
                            href={`/practice?topic=${t.slug}&qid=${q.id}`}
                            className="synth-pad group flex flex-col justify-between gap-2.5 p-3.5 text-left"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-[11px] font-bold text-white">
                                {q.official_ref ?? `Q#${q.id}`}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-[#4B5565]">
                                  {DIFFICULTY_LABELS[q.difficulty]}
                                </span>
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${ledCls}`}
                                  title={
                                    att
                                      ? att.is_correct
                                        ? "已破關"
                                        : "待訂正"
                                      : "尚未挑戰"
                                  }
                                />
                              </div>
                            </div>

                            <div className="text-[13px] font-bold leading-snug text-[#11151C] group-hover:text-[#D93B09] line-clamp-2">
                              {q.title}
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-medium text-[#4B5565]">
                              <span>{QUESTION_TYPE_LABELS[q.question_type]}</span>
                              <ArrowRight
                                className="h-3.5 w-3.5 text-[#647082] group-hover:translate-x-0.5 group-hover:text-[#D93B09] ui-transition"
                                strokeWidth={2}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          {allTypes.map((qt) => {
            const typeQs = allQuestions.filter((q) => q.question_type === qt);
            return (
              <section key={qt} className="synth-panel-hard overflow-hidden">
                <div className="h-1.5 w-full bg-[#161A22]" />
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#161A22] px-2.5 py-0.5 font-display text-xs font-bold text-white">
                          {QUESTION_TYPE_PAD_CODES[qt]}
                        </span>
                        <Layers className="h-4 w-4 text-[#D93B09]" strokeWidth={2} />
                        <h2 className="text-lg font-black text-[#11151C]">
                          {QUESTION_TYPE_LABELS[qt]}
                        </h2>
                        <span className="rounded-full bg-[#FFF1EC] px-2.5 py-0.5 font-code text-xs font-bold text-[#B83006] tabular-nums">
                          {typeQs.length} 題
                        </span>
                      </div>
                      <p className="text-sm text-[#4B5565]">
                        {QUESTION_TYPE_DESCRIPTIONS[qt]}
                      </p>
                    </div>

                    <Link
                      href={`/practice?type=${qt}`}
                      className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                    >
                      <span>特訓這 {typeQs.length} 題</span>
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </Link>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 border-t border-[#D4DAE4] pt-4">
                    {typeQs.map((q) => {
                      const topicTheme = getTopicTheme(q.topic_slug);
                      const att = q.user_last_attempt;
                      const ledCls = att
                        ? att.is_correct
                          ? "bg-[#00C48C]"
                          : "bg-[#FF4757]"
                        : "border border-[#647082] bg-white";

                      return (
                        <Link
                          key={q.id}
                          href={`/practice?type=${qt}&qid=${q.id}`}
                          className="synth-pad group flex flex-col justify-between gap-2 p-3.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded bg-[#161A22] px-2 py-0.5 font-code font-bold text-white">
                              {q.official_ref ?? `Q#${q.id}`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#4B5565]">
                                {DIFFICULTY_LABELS[q.difficulty]}
                              </span>
                              <span className={`h-2.5 w-2.5 rounded-full ${ledCls}`} />
                            </div>
                          </div>
                          <div className="text-[13px] font-bold text-[#11151C] group-hover:text-[#D93B09]">
                            {q.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#4B5565]">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: topicTheme.hex }}
                            />
                            <span className="truncate">{q.topic_title}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
