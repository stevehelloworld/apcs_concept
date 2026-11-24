"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { getTopicTheme } from "@/lib/topic-theme";
import type {
  AttemptSubmitResult,
  Difficulty,
  PublicQuestionRecord,
  QuestionType,
  TopicSummary,
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
}: PracticeWorkbenchClientProps) {
  const [questions, setQuestions] = useState<PublicQuestionRecord[]>(initialQuestions);
  const [topicFilter, setTopicFilter] = useState(initialTopic);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [diffFilter, setDiffFilter] = useState(initialDifficulty);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sourceFilter, setSourceFilter] = useState(initialSource);
  const [assignmentId, setAssignmentId] = useState<number | null>(initialAssignmentId);
  const [mockMode, setMockMode] = useState<false | "all" | "mock">(false);

  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (initialQuestionId && initialQuestions.some((q) => q.id === initialQuestionId)) {
      return initialQuestionId;
    }
    return initialQuestions[0]?.id ?? null;
  });

  const [loading, setLoading] = useState(false);
  const [sessionResults, setSessionResults] = useState<Record<number, AttemptSubmitResult>>({});

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

  const activeQuestion = questions.find((q) => q.id === selectedId) ?? questions[0] ?? null;
  const mockAnsweredCount = Object.keys(sessionResults).length;
  const mockCorrectCount = Object.values(sessionResults).filter((r) => r.isCorrect).length;

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3.5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-white">
            {assignmentId
              ? `作業 #${assignmentId}`
              : mockMode === "mock"
              ? "10 題原創模擬考"
              : mockMode === "all"
              ? "10 題綜合模擬考"
              : "實戰刷題"}
          </h1>
          <span className="font-code text-xs text-[#7E91B8] tabular-nums">
            {questions.length} 站
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!mockMode ? (
            <>
              <button
                type="button"
                onClick={() => handleStartMockExam(true)}
                className="rail-btn-cobalt inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>10 題原創模擬</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartMockExam(false)}
                className="rail-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
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

      {/* Inline Filter Strip */}
      {!mockMode && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <select
            aria-label="篩選題庫來源"
            value={sourceFilter}
            onChange={(e) => {
              const v = e.target.value;
              setSourceFilter(v);
              setAssignmentId(null);
              applyFilters(topicFilter, typeFilter, diffFilter, statusFilter, v, null);
            }}
            className="rail-input px-3 py-2 text-xs font-bold"
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
              applyFilters(v, typeFilter, diffFilter, statusFilter, sourceFilter, null);
            }}
            className="rail-input px-3 py-2 text-xs font-bold"
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
              applyFilters(topicFilter, v, diffFilter, statusFilter, sourceFilter, null);
            }}
            className="rail-input px-3 py-2 text-xs font-bold"
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
              applyFilters(topicFilter, typeFilter, v, statusFilter, sourceFilter, null);
            }}
            className="rail-input px-3 py-2 text-xs font-bold"
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
              applyFilters(topicFilter, typeFilter, diffFilter, v, sourceFilter, null);
            }}
            className="rail-input px-3 py-2 text-xs font-bold disabled:opacity-45"
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
            重設
          </button>
        </div>
      )}

      {/* Mock Mode Telemetry */}
      {mockMode && (
        <div className="rail-frame p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white tabular-nums">
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

      {/* Split Station List + Active Question Panel */}
      {loading ? (
        <div className="rail-frame p-8 text-center text-xs font-bold text-[#B8C5E0]">
          載入中...
        </div>
      ) : questions.length === 0 ? (
        <div className="rail-frame p-8 text-center text-xs font-bold text-[#B8C5E0]">
          無符合條件的題目
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Station Timetable */}
          <aside className="lg:col-span-4 rail-frame divide-y divide-white/10 max-h-[760px] overflow-y-auto">
            {questions.map((q, idx) => {
              const isActive = activeQuestion?.id === q.id;
              const last = q.user_last_attempt;
              const theme = getTopicTheme(q.topic_slug);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedId(q.id)}
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
                        <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" strokeWidth={2.2} />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#FF7A85]" strokeWidth={2.2} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          <div className="lg:col-span-8 min-w-0">
            {activeQuestion && (
              <PracticeQuestionCard
                question={activeQuestion}
                assignmentId={assignmentId}
                isLoggedIn={isLoggedIn}
                onAttempted={handleAttempted}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
