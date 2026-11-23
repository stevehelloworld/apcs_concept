"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Filter,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
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
  initialAssignmentId,
  initialQuestionId,
  isLoggedIn,
}: PracticeWorkbenchClientProps) {
  const [questions, setQuestions] = useState<PublicQuestionRecord[]>(initialQuestions);
  const [topicFilter, setTopicFilter] = useState(initialTopic);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [diffFilter, setDiffFilter] = useState(initialDifficulty);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [assignmentId, setAssignmentId] = useState<number | null>(initialAssignmentId);
  const [mockMode, setMockMode] = useState(false);

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
    // Keep selection valid if questions list changes
    if (questions.length > 0 && !questions.some((q) => q.id === selectedId)) {
      setSelectedId(questions[0].id);
    }
  }, [questions, selectedId]);

  function handleStartMockExam() {
    setMockMode(true);
    setTopicFilter("all");
    setTypeFilter("all");
    setDiffFilter("all");
    setStatusFilter("all");
    setAssignmentId(null);
    setSessionResults({});
    // Pick 10 balanced questions across topics
    const shuffled = [...initialQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setSelectedId(shuffled[0]?.id ?? null);
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
    <div className="space-y-6">
      {/* Top Header & Quick Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E0D8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17191C]">
            {assignmentId
              ? `班級作業任務 #${assignmentId}`
              : mockMode
              ? "10 題綜合模擬測驗"
              : "APCS 程式識讀刷題工作台"}
          </h1>
          <p className="mt-1 text-sm text-[#525866]">
            依五大主題、六大認知題型或待訂正狀態篩選題目；作答後立即獲得迷思診斷與單步追蹤。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!mockMode ? (
            <button
              type="button"
              onClick={handleStartMockExam}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3.5 py-2 text-xs font-medium text-white ui-transition hover:bg-[#163C6E]"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>開啟 10 題綜合模擬測驗</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMockMode(false);
                applyFilters("all", "all", "all", "all", null);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E0D8] bg-white px-3.5 py-2 text-xs font-medium text-[#17191C] hover:bg-[#F0EFEA]"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>結束模擬、回到完整題庫</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {!mockMode && (
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs">
              <span className="mb-1 flex items-center gap-1 font-semibold text-[#525866]">
                <Filter className="h-3 w-3" strokeWidth={1.75} /> 主題單元
              </span>
              <select
                value={topicFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTopicFilter(v);
                  setAssignmentId(null);
                  applyFilters(v, typeFilter, diffFilter, statusFilter, null);
                }}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1.5 text-sm text-[#17191C]"
              >
                <option value="all">全部五大主題</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">認知題型</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTypeFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, v, diffFilter, statusFilter, null);
                }}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1.5 text-sm text-[#17191C]"
              >
                <option value="all">全部六大題型</option>
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((qt) => (
                  <option key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">難度</span>
              <select
                value={diffFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setDiffFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, typeFilter, v, statusFilter, null);
                }}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1.5 text-sm text-[#17191C]"
              >
                <option value="all">全部難度</option>
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">個人作答狀態</span>
              <select
                value={statusFilter}
                disabled={!isLoggedIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, typeFilter, diffFilter, v, null);
                }}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1.5 text-sm text-[#17191C] disabled:opacity-50"
              >
                <option value="all">全部題目</option>
                <option value="unsolved">尚未作答</option>
                <option value="wrong">答錯待訂正</option>
                <option value="solved">已答對</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setTopicFilter("all");
                  setTypeFilter("all");
                  setDiffFilter("all");
                  setStatusFilter("all");
                  setAssignmentId(null);
                  applyFilters("all", "all", "all", "all", null);
                }}
                className="w-full rounded border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-medium text-[#525866] hover:bg-[#F0EFEA] hover:text-[#17191C]"
              >
                清除篩選條件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Exam Summary Banner */}
      {mockMode && (
        <div className="rounded-lg border border-[#1E4E8C]/30 bg-[#EAF1FA] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#1E4E8C]">
            <ClipboardCheck className="h-5 w-5" strokeWidth={1.75} />
            <span>
              模擬測驗進度：已作答 {mockAnsweredCount} / {questions.length} 題 · 答對{" "}
              {mockCorrectCount} 題（正確率{" "}
              {mockAnsweredCount > 0
                ? Math.round((mockCorrectCount / mockAnsweredCount) * 100)
                : 0}
              %）
            </span>
          </div>
          {isLoggedIn && (
            <Link href="/dashboard" className="text-xs font-semibold text-[#1E4E8C] underline">
              前往儀表板查看能力分析
            </Link>
          )}
        </div>
      )}

      {/* Workbench Split Layout */}
      {loading ? (
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-8 text-center text-sm text-[#525866]">
          載入題目清單中...
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-8 text-center space-y-3">
          <p className="text-sm font-medium text-[#17191C]">目前篩選條件下沒有符合的題目。</p>
          <p className="text-xs text-[#525866]">
            試著切換其他主題、清除狀態篩選，或檢視全部 30 道官方範例題。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Question List */}
          <aside className="lg:col-span-4 space-y-2 max-h-[760px] overflow-y-auto pr-1">
            <div className="mb-1 text-xs font-semibold text-[#525866] tabular-nums">
              符合條件共 {questions.length} 題
            </div>
            {questions.map((q, idx) => {
              const isActive = activeQuestion?.id === q.id;
              const last = q.user_last_attempt;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedId(q.id)}
                  className={`flex w-full items-start justify-between gap-2 rounded-lg border p-3 text-left ui-transition ${
                    isActive
                      ? "border-[#1E4E8C] bg-[#EAF1FA]/60"
                      : "border-[#E2E0D8] bg-white hover:border-[#C9C6BB]"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-code text-[#6C7382] tabular-nums">
                        {idx + 1}.
                      </span>
                      {q.official_ref && (
                        <span className="rounded bg-[#17191C] px-1.5 py-0.5 font-code text-[11px] text-white">
                          {q.official_ref}
                        </span>
                      )}
                      <span className="text-[11px] text-[#525866]">
                        {QUESTION_TYPE_LABELS[q.question_type]}
                      </span>
                    </div>
                    <div className="truncate text-sm font-medium text-[#17191C]">
                      {q.title}
                    </div>
                    <div className="text-[11px] text-[#6C7382]">{q.topic_title}</div>
                  </div>

                  {last && (
                    <span className="shrink-0 mt-1">
                      {last.is_correct ? (
                        <CheckCircle2 className="h-4 w-4 text-[#157F4B]" strokeWidth={1.75} />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#C23535]" strokeWidth={1.75} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Right Active Question */}
          <div className="lg:col-span-8">
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
