"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { getTopicTheme } from "@/lib/topic-theme";
import type {
  AttemptSubmitResult,
  Difficulty,
  PublicQuestionRecord,
  QuestionType,
  TopicSummary,
  UserRole,
} from "@/lib/types";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";
import { PracticeQuestionCard } from "./PracticeQuestionCard";

interface PracticeWorkbenchClientProps {
  topics: TopicSummary[];
  initialQuestions: PublicQuestionRecord[];
  initialTopic: string;
  initialType: string;
  initialDifficulty: string;
  initialStatus: string;
  initialSource: string;
  initialAssignmentId: number | null;
  initialQuestionId: number | null;
  isLoggedIn: boolean;
  userRole: UserRole | null;
}

export function PracticeWorkbenchClient({
  topics,
  initialQuestions,
  initialTopic,
  initialType,
  initialDifficulty,
  initialStatus,
  initialSource,
  initialAssignmentId,
  initialQuestionId,
  isLoggedIn,
  userRole,
}: PracticeWorkbenchClientProps) {
  const [questions, setQuestions] = useState<PublicQuestionRecord[]>(initialQuestions);
  const [topicFilter, setTopicFilter] = useState(initialTopic);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [diffFilter, setDiffFilter] = useState(initialDifficulty);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sourceFilter, setSourceFilter] = useState(initialSource);
  const [assignmentId, setAssignmentId] = useState<number | null>(initialAssignmentId);
  const [mockMode, setMockMode] = useState<false | "all" | "mock">(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (
      initialQuestionId &&
      initialQuestions.some((q) => q.id === initialQuestionId)
    ) {
      return initialQuestionId;
    }
    return initialQuestions[0]?.id ?? null;
  });

  const [loading, setLoading] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    Record<number, AttemptSubmitResult>
  >({});

  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  async function applyFilters(
    nextTopic: string,
    nextType: string,
    nextDiff: string,
    nextStatus: string,
    nextSource: string,
    nextAssign: number | null,
    limit?: number
  ) {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (nextTopic !== "all") qs.set("topic", nextTopic);
      if (nextType !== "all") qs.set("type", nextType);
      if (nextDiff !== "all") qs.set("difficulty", nextDiff);
      if (nextStatus !== "all") qs.set("status", nextStatus);
      if (nextSource !== "all") qs.set("source", nextSource);
      if (nextAssign) qs.set("assignmentId", String(nextAssign));
      if (limit) qs.set("limit", String(limit));

      const res = await fetch(`/api/questions?${qs.toString()}`);
      const data = await res.json();
      const list = (data.questions ?? []) as PublicQuestionRecord[];
      setQuestions(list);
      setSelectedId(list[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (questions.length > 0 && !questions.some((q) => q.id === selectedId)) {
      setSelectedId(questions[0].id);
    }
  }, [questions, selectedId]);

  async function handleStartMockExam(onlySim = false) {
    setMockMode(onlySim ? "mock" : "all");
    setTopicFilter("all");
    setTypeFilter("all");
    setDiffFilter("all");
    setStatusFilter("all");
    setSourceFilter(onlySim ? "mock" : "all");
    setAssignmentId(null);
    setSessionResults({});
    setDrawerOpen(false);
    setLoading(true);
    try {
      const url = onlySim ? "/api/questions?source=mock" : "/api/questions";
      const res = await fetch(url);
      const data = await res.json();
      const pool = (data.questions ?? initialQuestions) as PublicQuestionRecord[];
      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setSelectedId(shuffled[0]?.id ?? null);
    } catch {
      const fallbackPool = onlySim
        ? initialQuestions.filter((q) => q.official_ref?.startsWith("SIM-"))
        : initialQuestions;
      const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setSelectedId(shuffled[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }

  function handleAttempted(qId: number, res: AttemptSubmitResult) {
    setSessionResults((prev) => ({ ...prev, [qId]: res }));
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              user_last_attempt: {
                selected_option: res.selectedOption,
                is_correct: res.isCorrect,
                created_at: new Date().toISOString(),
              },
            }
          : q
      )
    );
  }

  const activeIdx = Math.max(
    0,
    questions.findIndex((q) => q.id === selectedId)
  );
  const activeQuestion = questions[activeIdx] ?? questions[0] ?? null;
  const mockAnsweredCount = Object.keys(sessionResults).length;
  const mockCorrectCount = Object.values(sessionResults).filter(
    (r) => r.isCorrect
  ).length;

  return (
    <div className="space-y-4">
      {/* Slim Classroom Toolbar */}
      <header className="rail-frame flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-wide text-white">
            {assignmentId
              ? `作業 #${assignmentId}`
              : mockMode === "mock"
              ? "10 題原創模擬考"
              : mockMode === "all"
              ? "10 題綜合模擬考"
              : "實戰投影刷題"}
          </h1>

          {questions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeIdx <= 0}
                onClick={() =>
                  setSelectedId(questions[Math.max(0, activeIdx - 1)]?.id ?? null)
                }
                aria-label="上一題"
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="hidden sm:inline">上一題</span>
              </button>

              <span className="rounded border border-white/20 bg-[#070C22] px-2.5 py-1 font-code text-xs font-bold text-white tabular-nums">
                {activeIdx + 1} / {questions.length}
              </span>

              <button
                type="button"
                disabled={activeIdx >= questions.length - 1}
                onClick={() =>
                  setSelectedId(
                    questions[Math.min(questions.length - 1, activeIdx + 1)]?.id ??
                      null
                  )
                }
                aria-label="下一題"
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
              >
                <span className="hidden sm:inline">下一題</span>
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!mockMode && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#14B8C4]" strokeWidth={2.2} />
              <span>選題與篩選 ({questions.length})</span>
            </button>
          )}

          {!mockMode ? (
            <>
              <button
                type="button"
                onClick={() => handleStartMockExam(true)}
                className="rail-btn-cobalt inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>10 題原創模擬</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartMockExam(false)}
                className="rail-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>10 題綜合模擬</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMockMode(false);
                setSourceFilter("all");
                applyFilters("all", "all", "all", "all", "all", null);
              }}
              className="rail-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              <span>結束模擬</span>
            </button>
          )}
        </div>
      </header>

      {/* Mock Mode Telemetry */}
      {mockMode && (
        <div className="rail-frame p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white tabular-nums">
            <ClipboardCheck className="h-4 w-4 text-[#FFC20E]" strokeWidth={2} />
            <span>
              已作答 {mockAnsweredCount}/{questions.length} · 答對{" "}
              <span className="text-[#4ADE80]">{mockCorrectCount}</span> (
              {mockAnsweredCount > 0
                ? Math.round((mockCorrectCount / mockAnsweredCount) * 100)
                : 0}
              %)
            </span>
          </div>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="font-code text-xs font-bold text-[#7AA4FF] hover:underline"
            >
              個人進度 →
            </Link>
          )}
        </div>
      )}

      {/* Full-Width Single Active Question Stage */}
      {loading ? (
        <div className="rail-frame p-8 text-center text-sm font-bold text-[#B8C5E0]">
          載入中...
        </div>
      ) : activeQuestion ? (
        <PracticeQuestionCard
          question={activeQuestion}
          assignmentId={assignmentId}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          projectorMode
          onAttempted={handleAttempted}
        />
      ) : (
        <div className="rail-frame p-8 text-center space-y-3">
          <p className="text-sm font-bold text-[#B8C5E0]">無符合條件的題目</p>
          <button
            type="button"
            onClick={() => {
              setTopicFilter("all");
              setTypeFilter("all");
              setDiffFilter("all");
              setStatusFilter("all");
              setSourceFilter("all");
              setAssignmentId(null);
              applyFilters("all", "all", "all", "all", "all", null);
            }}
            className="rail-btn px-4 py-1.5 text-xs font-bold"
          >
            重設全部條件
          </button>
        </div>
      )}

      {/* Slide-Over Question Filter & Selector Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-black/55 backdrop-blur-[2px]"
          onClick={() => setDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="題庫篩選與快速選題"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rail-frame h-full w-full max-w-md rounded-none border-l border-white/25 bg-[#0B1230] p-4 sm:p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h2 className="text-base font-black text-white">
                選題與篩選（{questions.length} 站）
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="關閉選題抽屜"
                className="rail-btn p-1.5"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="篩選題庫來源"
                value={sourceFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setSourceFilter(v);
                  setAssignmentId(null);
                  applyFilters(
                    topicFilter,
                    typeFilter,
                    diffFilter,
                    statusFilter,
                    v,
                    null
                  );
                }}
                className="rail-input px-2.5 py-2 text-xs font-bold"
              >
                <option value="all">全部題庫</option>
                <option value="official">官方 0915</option>
                <option value="mock">原創模擬 SIM</option>
              </select>

              <select
                aria-label="篩選路線"
                value={topicFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTopicFilter(v);
                  setAssignmentId(null);
                  applyFilters(
                    v,
                    typeFilter,
                    diffFilter,
                    statusFilter,
                    sourceFilter,
                    null
                  );
                }}
                className="rail-input px-2.5 py-2 text-xs font-bold"
              >
                <option value="all">全部路線</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>

              <select
                aria-label="篩選題型"
                value={typeFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTypeFilter(v);
                  setAssignmentId(null);
                  applyFilters(
                    topicFilter,
                    v,
                    diffFilter,
                    statusFilter,
                    sourceFilter,
                    null
                  );
                }}
                className="rail-input px-2.5 py-2 text-xs font-bold"
              >
                <option value="all">全部題型</option>
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((qt) => (
                  <option key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </option>
                ))}
              </select>

              <select
                aria-label="篩選難度"
                value={diffFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setDiffFilter(v);
                  setAssignmentId(null);
                  applyFilters(
                    topicFilter,
                    typeFilter,
                    v,
                    statusFilter,
                    sourceFilter,
                    null
                  );
                }}
                className="rail-input px-2.5 py-2 text-xs font-bold"
              >
                <option value="all">全部難度</option>
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>

              <select
                aria-label="篩選破關狀態"
                value={statusFilter}
                disabled={!isLoggedIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v);
                  setAssignmentId(null);
                  applyFilters(
                    topicFilter,
                    typeFilter,
                    diffFilter,
                    v,
                    sourceFilter,
                    null
                  );
                }}
                className="rail-input px-2.5 py-2 text-xs font-bold disabled:opacity-45"
              >
                <option value="all">全部狀態</option>
                <option value="unsolved">未挑戰</option>
                <option value="wrong">待訂正</option>
                <option value="solved">已過關</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setTopicFilter("all");
                  setTypeFilter("all");
                  setDiffFilter("all");
                  setStatusFilter("all");
                  setSourceFilter("all");
                  setAssignmentId(null);
                  applyFilters("all", "all", "all", "all", "all", null);
                }}
                className="rail-btn py-2 text-xs font-bold"
              >
                重設篩選
              </button>
            </div>

            <div className="rail-well flex-1 overflow-y-auto divide-y divide-white/10">
              {questions.map((q, idx) => {
                const isActive = activeQuestion?.id === q.id;
                const last = q.user_last_attempt;
                const theme = getTopicTheme(q.topic_slug);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(q.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2.5 px-3 py-2.5 text-left ui-transition ${
                      isActive
                        ? "bg-[#1E5BFF]/20 text-white"
                        : "hover:bg-white/[0.04] text-[#B8C5E0]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.hex }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-code text-[11px] text-[#7E91B8] tabular-nums">
                          <span>{String(idx + 1).padStart(2, "0")}</span>
                          {q.official_ref && (
                            <span
                              className={
                                q.official_ref.startsWith("SIM-")
                                  ? "rounded border border-[#1E5BFF]/50 bg-[#1E5BFF]/22 px-1 font-bold text-[#7AA4FF]"
                                  : "font-bold text-white"
                              }
                            >
                              {q.official_ref}
                            </span>
                          )}
                          <span>· {QUESTION_TYPE_LABELS[q.question_type]}</span>
                        </div>
                        <div
                          className={`truncate text-xs font-bold ${
                            isActive ? "text-white" : "text-[#B8C5E0]"
                          }`}
                        >
                          {q.title}
                        </div>
                      </div>
                    </div>

                    {last && (
                      <span className="shrink-0">
                        {last.is_correct ? (
                          <CheckCircle2
                            className="h-4 w-4 text-[#4ADE80]"
                            strokeWidth={2.2}
                          />
                        ) : (
                          <XCircle
                            className="h-4 w-4 text-[#FF7A85]"
                            strokeWidth={2.2}
                          />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
