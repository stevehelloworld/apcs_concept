"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { getTopicTheme, QUESTION_TYPE_PAD_CODES } from "@/lib/topic-theme";
import type { StudentDashboardPayload } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

interface StudentDashboardClientProps {
  initialData: StudentDashboardPayload;
}

export function StudentDashboardClient({ initialData }: StudentDashboardClientProps) {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardPayload>(initialData);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  async function refreshDashboard() {
    const res = await fetch("/api/student/dashboard");
    if (res.ok) {
      const next = (await res.json()) as StudentDashboardPayload;
      setData(next);
    }
  }

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);
    setJoining(true);

    try {
      const res = await fetch("/api/student/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setJoinError(json.error ?? "無法加入班級，請確認代碼。");
        return;
      }
      setJoinSuccess(`已加入「${json.joinedClass.name}」`);
      setJoinCode("");
      await refreshDashboard();
      router.refresh();
    } catch {
      setJoinError("網路連線異常");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8 space-y-6">
      {/* Compact Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-3xl font-extrabold text-white">
            {data.user.display_name}
          </h1>
          <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-code text-xs font-bold text-[#B8C5E0]">
            {data.user.username}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshDashboard}
            className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            <span>同步</span>
          </button>
          <Link
            href="/practice"
            className="rail-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            <span>刷題</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </header>

      {/* 4-Column Porcelain-Ruled KPI Strip */}
      <section className="rail-frame grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">破關</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
            {data.stats.uniqueSolved} / {data.stats.totalVisibleQuestions}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">作答</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
            {data.stats.totalAttempts}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">正確率</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#4ADE80] tabular-nums">
            {data.stats.totalAttempts > 0 ? `${data.stats.accuracy}%` : "—"}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">均時</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#7AA4FF] tabular-nums">
            {data.stats.avgDurationSec > 0 ? `${data.stats.avgDurationSec}s` : "—"}
          </div>
        </div>
      </section>

      {/* Line Mastery + Exam Type Mastery */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-6 rail-frame p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <h2 className="font-display text-base font-extrabold tracking-wide text-white">
              路線進度
            </h2>
            <Link
              href="/topics"
              className="font-code text-xs font-bold text-[#B8C5E0] hover:text-white"
            >
              路線圖 →
            </Link>
          </div>
          <div className="space-y-3">
            {data.topicMastery.map((t, idx) => {
              const theme = getTopicTheme(t.slug, idx);
              const pct =
                t.totalQuestions > 0
                  ? Math.round((t.solvedCorrect / t.totalQuestions) * 100)
                  : 0;
              return (
                <div key={t.topicId} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/topics/${t.slug}`}
                      className="inline-flex items-center gap-2 font-bold text-white hover:underline truncate"
                    >
                      <span
                        className="rounded px-1.5 py-0.5 font-code text-[10px] font-bold shrink-0"
                        style={{
                          backgroundColor: theme.hex,
                          color: theme.buttonText,
                        }}
                      >
                        {theme.code}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </Link>
                    <span className="font-code text-[#B8C5E0] tabular-nums shrink-0">
                      {t.solvedCorrect}/{t.totalQuestions}
                      {t.accuracy !== null ? ` · ${t.accuracy}%` : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#070C22]">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: theme.hex }}
                      className="h-full ui-transition"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-6 rail-frame p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <h2 className="font-display text-base font-extrabold tracking-wide text-white">
              題型正確率
            </h2>
            <Link
              href="/practice"
              className="font-code text-xs font-bold text-[#B8C5E0] hover:text-white"
            >
              特訓 →
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {data.typeMastery.map((tm) => (
              <Link
                key={tm.type}
                href={`/practice?type=${tm.type}`}
                className="flex items-center justify-between py-2.5 px-1.5 hover:bg-white/[0.04] rounded ui-transition text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-white px-1.5 py-0.5 font-code text-[10px] font-bold text-[#0B1230]">
                    {QUESTION_TYPE_PAD_CODES[tm.type]}
                  </span>
                  <span className="font-bold text-white">{tm.label}</span>
                  <span className="font-code text-[#7E91B8] tabular-nums">
                    {tm.correct}/{tm.attempts}
                  </span>
                </div>
                <span
                  className={`font-display text-sm font-extrabold tabular-nums ${
                    tm.accuracy === null
                      ? "text-[#7E91B8]"
                      : tm.accuracy >= 70
                      ? "text-[#4ADE80]"
                      : "text-[#FF7A85]"
                  }`}
                >
                  {tm.accuracy !== null ? `${tm.accuracy}%` : "—"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Classes & Assignments */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 rail-frame p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
            <h2 className="font-display text-base font-extrabold tracking-wide text-white">
              所屬班級
            </h2>
          </div>

          <form onSubmit={handleJoinClass} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="班級代碼（如 APCS2A）"
              className="rail-input flex-1 px-3 py-1.5 font-code text-xs uppercase"
            />
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="rail-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold disabled:opacity-45"
            >
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>{joining ? "加入中" : "加入"}</span>
            </button>
          </form>

          {joinError && (
            <div className="flex items-center gap-1.5 rounded border border-[#E21D2D]/50 bg-[#E21D2D]/15 px-3 py-2 text-xs text-[#FF7A85]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{joinError}</span>
            </div>
          )}
          {joinSuccess && (
            <div className="flex items-center gap-1.5 rounded border border-[#22B14C]/50 bg-[#22B14C]/15 px-3 py-2 text-xs text-[#4ADE80]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{joinSuccess}</span>
            </div>
          )}

          {data.classes.length === 0 ? (
            <div className="rail-well p-3 text-xs text-[#7E91B8]">
              尚無班級，輸入代碼加入
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.classes.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <div className="font-bold text-white">{cls.name}</div>
                    <div className="text-[#7E91B8]">{cls.teacher_name}</div>
                  </div>
                  <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-code font-bold text-[#B8C5E0]">
                    {cls.join_code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-7 rail-frame p-4 sm:p-5 space-y-3">
          <div className="border-b border-white/15 pb-2.5">
            <h2 className="font-display text-base font-extrabold tracking-wide text-white">
              班級作業 ({data.assignments.length})
            </h2>
          </div>

          {data.assignments.length === 0 ? (
            <div className="rail-well p-4 text-xs text-[#7E91B8]">
              目前無指派作業
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.assignments.map((a) => {
                const donePct =
                  a.question_count > 0
                    ? Math.round((a.completed_count / a.question_count) * 100)
                    : 0;
                return (
                  <div key={a.id} className="py-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-code text-[11px] font-bold text-[#B8C5E0]">
                          {a.class_name}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {a.title}
                        </span>
                        {a.due_date && (
                          <span className="font-code text-xs text-[#7E91B8]">
                            截止 {a.due_date}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/practice?assignmentId=${a.id}`}
                        className="rail-btn-primary inline-flex items-center gap-1 px-3 py-1 text-xs font-bold"
                      >
                        <span>
                          {a.completed_count >= a.question_count ? "重練" : "作答"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#070C22]">
                        <div
                          style={{ width: `${donePct}%` }}
                          className="h-full bg-[#22B14C]"
                        />
                      </div>
                      <span className="font-code text-[#B8C5E0] tabular-nums">
                        {a.completed_count}/{a.question_count}（對 {a.correct_count}）
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Wrong Questions Queue */}
      <section className="rail-frame p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
          <h2 className="font-display text-base font-extrabold tracking-wide text-white">
            待訂正站點 ({data.recentWrong.length})
          </h2>
          <Link
            href="/practice?status=wrong"
            className="rail-btn inline-flex items-center gap-1 px-3 py-1 text-xs font-bold"
          >
            <span>專刷錯題</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        {data.recentWrong.length === 0 ? (
          <div className="rail-well p-4 text-xs font-bold text-[#4ADE80]">
            無待訂正錯題
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.recentWrong.map((w) => (
              <div
                key={w.attemptId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
              >
                <div className="space-y-1 min-w-0 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {w.officialRef && (
                      <span className="rounded bg-white px-1.5 py-0.5 font-code text-[11px] font-bold text-[#0B1230]">
                        {w.officialRef}
                      </span>
                    )}
                    <span className="font-bold text-white">{w.title}</span>
                    <span className="text-[#7E91B8]">{w.topicTitle}</span>
                    <span className="font-code font-bold text-[#FF7A85]">
                      誤選 {w.selectedOption}
                    </span>
                  </div>
                  {w.misconception && (
                    <p className="text-[#B8C5E0]">{w.misconception}</p>
                  )}
                </div>

                <Link
                  href={`/practice?topic=${w.topicSlug}&qid=${w.questionId}`}
                  className="rail-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold shrink-0"
                >
                  <span>重練</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
