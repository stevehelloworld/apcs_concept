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
      {/* Top Workbench Header */}
      <section className="synth-panel-hard p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#11151C] sm:text-3xl">
            {assignmentId
              ? `班級作業任務 #${assignmentId}`
              : mockMode
              ? "10 題隨機模擬挑戰"
              : "APCS 實戰刷題實驗台"}
          </h1>
          <p className="text-sm text-[#4B5565]">
            篩選主題、考法或個人作答狀態；每次送出即時呈現迷思盲點與單步執行重播
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!mockMode ? (
            <button
              type="button"
              onClick={handleStartMockExam}
              className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>開啟 10 題隨機模擬考</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMockMode(false);
                applyFilters("all", "all", "all", "all", null);
              }}
              className="synth-pad inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              <span>結束模擬、回到完整題庫</span>
            </button>
          )}
        </div>
      </section>

      {/* Hardware Filter Strip */}
      {!mockMode && (
        <div className="synth-panel p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs">
              <span className="mb-1.5 flex items-center gap-1 font-bold text-[#4B5565]">
                <Filter className="h-3.5 w-3.5" strokeWidth={2} /> 主題模組
              </span>
              <select
                value={topicFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTopicFilter(v);
                  setAssignmentId(null);
                  applyFilters(v, typeFilter, diffFilter, statusFilter, null);
                }}
                className="w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-2 text-sm font-medium text-[#11151C]"
              >
                <option value="all">全部五大模組</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">考法題型</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setTypeFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, v, diffFilter, statusFilter, null);
                }}
                className="w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-2 text-sm font-medium text-[#11151C]"
              >
                <option value="all">全部六大考法</option>
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((qt) => (
                  <option key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">題目難度</span>
              <select
                value={diffFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setDiffFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, typeFilter, v, statusFilter, null);
                }}
                className="w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-2 text-sm font-medium text-[#11151C]"
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
              <span className="mb-1.5 block font-bold text-[#4B5565]">破關狀態</span>
              <select
                value={statusFilter}
                disabled={!isLoggedIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v);
                  setAssignmentId(null);
                  applyFilters(topicFilter, typeFilter, diffFilter, v, null);
                }}
                className="w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-2 text-sm font-medium text-[#11151C] disabled:opacity-50"
              >
                <option value="all">全部題目</option>
                <option value="unsolved">尚未挑戰</option>
                <option value="wrong">答錯待訂正</option>
                <option value="solved">已破關</option>
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
                className="synth-pad w-full py-2 text-xs font-bold"
              >
                重設所有篩選
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Exam OLED Summary Banner */}
      {mockMode && (
        <div className="synth-oled p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold text-white">
            <ClipboardCheck className="h-5 w-5 text-[#FF8A65]" strokeWidth={2} />
            <span className="tabular-nums">
              模擬考進度：已作答 {mockAnsweredCount} / {questions.length} 題 · 答對{" "}
              <span className="text-[#00E5A0]">{mockCorrectCount}</span> 題（正確率{" "}
              {mockAnsweredCount > 0
                ? Math.round((mockCorrectCount / mockAnsweredCount) * 100)
                : 0}
              %）
            </span>
          </div>
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#38BDF8] hover:underline"
            >
              前往我的進度儀表板 →
            </Link>
          )}
        </div>
      )}

      {/* Split Sequencer Tracklist + Active Deck */}
      {loading ? (
        <div className="synth-panel p-10 text-center text-sm font-bold text-[#4B5565]">
          載入題目序列中...
        </div>
      ) : questions.length === 0 ? (
        <div className="synth-panel p-10 text-center space-y-2">
          <p className="text-base font-bold text-[#11151C]">
            目前篩選條件下沒有符合的題目。
          </p>
          <p className="text-xs text-[#4B5565]">
            請點擊「重設所有篩選」或切換其他主題模組。
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Sequencer Tracklist */}
          <aside className="lg:col-span-4 space-y-2 max-h-[780px] overflow-y-auto pr-1">
            <div className="mb-1.5 flex items-center justify-between px-1 font-code text-xs font-bold text-[#4B5565] tabular-nums">
              <span>TRACKLIST // 共 {questions.length} 題</span>
            </div>
            {questions.map((q, idx) => {
              const isActive = activeQuestion?.id === q.id;
              const last = q.user_last_attempt;
              const theme = getTopicTheme(q.topic_slug);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedId(q.id)}
                  className={`flex w-full items-start justify-between gap-2.5 rounded-xl border-[1.5px] p-3 text-left ui-transition ${
                    isActive
                      ? "border-[#161A22] bg-[#FFF1EC] ring-2 ring-[#FF4F17]/30 shadow-xs"
                      : "border-[#C4CBD6] bg-white hover:border-[#161A22]"
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isActive ? "bg-[#FF4F17]" : ""
                        }`}
                        style={!isActive ? { backgroundColor: theme.hex } : undefined}
                      />
                      <span className="font-code text-[#647082] tabular-nums">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      {q.official_ref && (
                        <span className="rounded bg-[#161A22] px-1.5 py-0.5 font-code text-[11px] font-bold text-white">
                          {q.official_ref}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-[#4B5565]">
                        {QUESTION_TYPE_LABELS[q.question_type]}
                      </span>
                    </div>
                    <div className="truncate text-sm font-bold text-[#11151C]">
                      {q.title}
                    </div>
                    <div className="text-[11px] font-medium text-[#647082]">
                      {q.topic_title}
                    </div>
                  </div>

                  {last && (
                    <span className="shrink-0 mt-1">
                      {last.is_correct ? (
                        <CheckCircle2 className="h-4 w-4 text-[#007A57]" strokeWidth={2.2} />
                      ) : (
                        <XCircle className="h-4 w-4 text-[#C62828]" strokeWidth={2.2} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Right Active Hardware Card */}
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
