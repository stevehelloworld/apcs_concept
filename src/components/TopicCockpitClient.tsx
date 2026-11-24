"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Terminal,
  X,
} from "lucide-react";
import type { ConceptLesson } from "@/lib/concept-lessons";
import type { TopicChannelTheme } from "@/lib/topic-theme";
import type {
  PublicQuestionRecord,
  TopicRecord,
  TopicSummary,
  UserRole,
} from "@/lib/types";
import { ConceptDeckClient } from "./ConceptDeckClient";
import { PitfallCompareClient } from "./PitfallCompareClient";
import { PracticeQuestionCard } from "./PracticeQuestionCard";
import { TopicVisualizerHost } from "./visualizers/TopicVisualizerHost";

export type CockpitStage = "recon" | "concepts" | "pitfalls" | "practice";

const VALID_STAGES: CockpitStage[] = ["recon", "concepts", "pitfalls", "practice"];

const STAGE_META: Array<{
  key: CockpitStage;
  num: string;
  label: string;
  beacon: string;
}> = [
  {
    key: "recon",
    num: "1",
    label: "互動勘查",
    beacon: "STEP 1/4 · 互動勘查 — 調整參數或按執行模擬，先讓全班親眼看見問題現象",
  },
  {
    key: "concepts",
    num: "2",
    label: "觀念追蹤",
    beacon: "STEP 2/4 · 觀念追蹤 — 先猜結果，按 → 單步執行，按 R 揭曉心法與口訣",
  },
  {
    key: "pitfalls",
    num: "3",
    label: "地雷對照",
    beacon: "STEP 3/4 · 地雷對照 — 先請學生找出左圖錯誤行，再揭曉修正寫法與原因",
  },
  {
    key: "practice",
    num: "4",
    label: "隨堂實戰",
    beacon: "STEP 4/4 · 隨堂實戰 — 投影選題討論，點「課堂揭曉解析」或按 R 進入追蹤",
  },
];

interface TopicCockpitClientProps {
  topic: TopicRecord;
  allTopics: TopicSummary[];
  questions: PublicQuestionRecord[];
  theme: TopicChannelTheme;
  conceptLessons: ConceptLesson[];
  syllabusTags: string[];
  initialStage?: string;
  isLoggedIn: boolean;
  userRole: UserRole | null;
}

export function TopicCockpitClient({
  topic,
  allTopics,
  questions,
  theme,
  conceptLessons,
  syllabusTags,
  initialStage = "recon",
  isLoggedIn,
  userRole,
}: TopicCockpitClientProps) {
  const safeInitial: CockpitStage = VALID_STAGES.includes(initialStage as CockpitStage)
    ? (initialStage as CockpitStage)
    : "recon";

  const [stage, setStage] = useState<CockpitStage>(safeInitial);
  const [showBriefing, setShowBriefing] = useState(false);
  const [practiceSource, setPracticeSource] = useState<"all" | "official" | "mock">(
    "all"
  );
  const [practiceIdx, setPracticeIdx] = useState(0);

  useEffect(() => {
    if (VALID_STAGES.includes(initialStage as CockpitStage)) {
      setStage(initialStage as CockpitStage);
    }
  }, [initialStage]);

  useEffect(() => {
    if (!showBriefing) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowBriefing(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showBriefing]);

  const currentIdx = allTopics.findIndex((t) => t.slug === topic.slug);
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx < allTopics.length - 1
      ? allTopics[currentIdx + 1]
      : null;

  const officialCount = questions.filter((q) =>
    q.official_ref?.startsWith("0915-")
  ).length;
  const mockCount = questions.filter((q) =>
    q.official_ref?.startsWith("SIM-")
  ).length;

  const filteredQuestions = useMemo(() => {
    if (practiceSource === "official") {
      return questions.filter((q) => !q.official_ref?.startsWith("SIM-"));
    }
    if (practiceSource === "mock") {
      return questions.filter((q) => q.official_ref?.startsWith("SIM-"));
    }
    return questions;
  }, [questions, practiceSource]);

  const safePracticeIdx =
    filteredQuestions.length > 0
      ? Math.min(practiceIdx, filteredQuestions.length - 1)
      : 0;
  const activePracticeQ = filteredQuestions[safePracticeIdx] ?? null;

  const stageIndex = STAGE_META.findIndex((s) => s.key === stage);
  const activeMeta = STAGE_META[stageIndex] ?? STAGE_META[0];
  const nextStageMeta =
    stageIndex >= 0 && stageIndex < STAGE_META.length - 1
      ? STAGE_META[stageIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-[1520px] px-3 sm:px-5 py-3.5 space-y-3">
      {/* Compact Single-Row Mission Header */}
      <header className="rail-frame overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: theme.hex }} />
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 sm:px-4">
          {/* Left: Line Badge + Concise Topic Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              data-on-light-accent={
                theme.buttonText === "#0B1230" ? "true" : undefined
              }
              data-on-accent={theme.buttonText === "#FFFFFF" ? "true" : undefined}
              className="rounded px-2 py-0.5 font-display text-xs font-extrabold shrink-0"
              style={{ backgroundColor: theme.hex, color: theme.buttonText }}
            >
              {theme.code}
            </span>
            <h1 className="truncate text-base sm:text-xl font-black text-white">
              {topic.title}
            </h1>
          </div>

          {/* Center: 4-Stage Projection Stepper */}
          <nav
            aria-label="課程教學階段切換"
            className="rail-well inline-flex flex-wrap items-center gap-1 p-1"
          >
            {STAGE_META.map((item) => {
              const active = stage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStage(item.key)}
                  aria-current={active ? "step" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs sm:text-sm font-bold ui-transition ${
                    active ? "" : "text-[#B8C5E0] hover:text-white"
                  }`}
                  style={
                    active
                      ? { backgroundColor: theme.buttonBg, color: theme.buttonText }
                      : undefined
                  }
                >
                  <span className="font-code text-xs opacity-80">{item.num}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Briefing ? + Next Stage */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowBriefing(true)}
              aria-label="課程簡報與快速鍵說明"
              className="rail-btn inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#14B8C4]" strokeWidth={2.2} />
              <span className="hidden sm:inline">簡報</span>
            </button>

            {nextStageMeta ? (
              <button
                type="button"
                onClick={() => setStage(nextStageMeta.key)}
                className="rail-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
              >
                <span>{nextStageMeta.label}</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            ) : (
              <Link
                href={`/practice?topic=${topic.slug}`}
                className="rail-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              >
                <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>全部題庫</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Single-Line StepBeacon Focus Banner */}
      <div className="rail-well px-3.5 py-2 font-code text-xs font-bold text-[#B8C5E0]">
        {activeMeta.beacon}
      </div>

      {/* ONLY One Active Stage Mounted on Screen */}
      {stage === "recon" && <TopicVisualizerHost type={topic.visualizer_type} />}

      {stage === "concepts" && (
        <ConceptDeckClient
          theme={theme}
          lessons={conceptLessons}
          cmsConcepts={topic.core_concepts}
        />
      )}

      {stage === "pitfalls" && (
        <PitfallCompareClient pitfalls={topic.pitfalls} />
      )}

      {stage === "practice" && (
        <div className="space-y-3">
          {/* Compact Question Switcher Toolbar */}
          <div className="rail-frame flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "all", label: `全部 (${questions.length})` },
                { key: "official", label: `官方 (${officialCount})` },
                { key: "mock", label: `模擬 (${mockCount})` },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setPracticeSource(opt.key as "all" | "official" | "mock");
                    setPracticeIdx(0);
                  }}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    practiceSource === opt.key
                      ? opt.key === "mock"
                        ? "bg-[#1E5BFF] text-white"
                        : "bg-white text-[#0B1230]"
                      : "border border-white/20 text-[#B8C5E0] hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePracticeIdx <= 0}
                onClick={() => setPracticeIdx((p) => Math.max(0, p - 1))}
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>上一題</span>
              </button>

              <select
                aria-label="選擇本章題目"
                value={safePracticeIdx}
                onChange={(e) => setPracticeIdx(Number(e.target.value))}
                className="rail-input px-2.5 py-1 font-code text-xs font-bold max-w-[230px]"
              >
                {filteredQuestions.map((q, idx) => (
                  <option key={q.id} value={idx}>
                    {idx + 1}/{filteredQuestions.length} ·{" "}
                    {q.official_ref ?? `Q${q.id}`} {q.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={safePracticeIdx >= filteredQuestions.length - 1}
                onClick={() =>
                  setPracticeIdx((p) =>
                    Math.min(Math.max(0, filteredQuestions.length - 1), p + 1)
                  )
                }
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
              >
                <span>下一題</span>
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {activePracticeQ ? (
            <PracticeQuestionCard
              question={activePracticeQ}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              projectorMode
            />
          ) : (
            <div className="rail-frame p-8 text-center text-sm text-[#B8C5E0]">
              此篩選分類目前無題目。
            </div>
          )}
        </div>
      )}

      {/* Guided Briefing / Syllabus Modal (z-[80]) */}
      {showBriefing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          onClick={() => setShowBriefing(false)}
          role="dialog"
          aria-modal="true"
          aria-label="課程簡報與檢核資訊"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rail-frame w-full max-w-lg bg-[#0B1230] p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-2 py-0.5 font-display text-xs font-extrabold"
                  style={{ backgroundColor: theme.hex, color: theme.buttonText }}
                >
                  {theme.code}
                </span>
                <h2 className="text-base font-black text-white">{topic.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefing(false)}
                aria-label="關閉簡報"
                className="rail-btn p-1"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {topic.summary && (
              <p className="text-sm leading-relaxed text-[#B8C5E0]">
                {topic.summary}
              </p>
            )}

            <div className="space-y-1.5">
              <div className="font-code text-xs font-bold text-[#7E91B8]">
                對應官方檢測範圍（官方 {officialCount} 題 · 原創模擬 {mockCount} 題）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {syllabusTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-white/20 bg-[#070C22] px-2.5 py-0.5 font-code text-xs font-bold text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rail-well p-3 space-y-1 font-code text-xs text-[#B8C5E0]">
              <div className="font-bold text-white">投影快捷鍵</div>
              <div>← / → ：單步前進或後退（觀念追蹤）</div>
              <div>R ：揭曉或收合口訣／修正寫法／題目詳解</div>
              <div>Shift + G ：隨時開啟課堂速跳與題號搜尋</div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3">
              {prevTopic ? (
                <Link
                  href={`/topics/${prevTopic.slug}`}
                  onClick={() => setShowBriefing(false)}
                  className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{prevTopic.title}</span>
                </Link>
              ) : (
                <span />
              )}

              {nextTopic && (
                <Link
                  href={`/topics/${nextTopic.slug}`}
                  onClick={() => setShowBriefing(false)}
                  className="rail-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <span>{nextTopic.title}</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
