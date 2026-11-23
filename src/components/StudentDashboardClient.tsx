"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  PlusCircle,
  RefreshCw,
  Users,
} from "lucide-react";
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
      setJoinSuccess(`已成功加入「${json.joinedClass.name}」！`);
      setJoinCode("");
      await refreshDashboard();
      router.refresh();
    } catch {
      setJoinError("網路連線異常，請重試。");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E0D8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17191C]">
            {data.user.display_name} 的學習儀表板
          </h1>
          <p className="mt-1 text-sm text-[#525866]">
            帳號 <span className="font-code">{data.user.username}</span> · 追蹤五大主題掌握度、六大題型能力與班級指派任務
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshDashboard}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-xs font-medium text-[#525866] hover:bg-[#F0EFEA]"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>重新整理</span>
          </button>
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#163C6E]"
          >
            <span>前往刷題練習</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">已通過題目進度</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#1E4E8C] tabular-nums">
            {data.stats.uniqueSolved} / {data.stats.totalVisibleQuestions}
          </div>
          <div className="mt-1 text-xs text-[#6C7382]">至少答對一次的獨立題數</div>
        </div>

        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">累計作答總次數</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#17191C] tabular-nums">
            {data.stats.totalAttempts}
          </div>
          <div className="mt-1 text-xs text-[#6C7382]">含重複訂正練習次數</div>
        </div>

        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">整體作答正確率</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#157F4B] tabular-nums">
            {data.stats.totalAttempts > 0 ? `${data.stats.accuracy}%` : "—"}
          </div>
          <div className="mt-1 text-xs text-[#6C7382]">每次提交即時計算</div>
        </div>

        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">平均思考時間</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#17191C] tabular-nums">
            {data.stats.avgDurationSec > 0 ? `${data.stats.avgDurationSec} 秒` : "—"}
          </div>
          <div className="mt-1 text-xs text-[#6C7382]">單題作答平均耗時</div>
        </div>
      </section>

      {/* Main Grid: Topic Mastery + Type Mastery */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-6 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17191C]">五大知識主題掌握度</h2>
            <Link href="/topics" className="text-xs font-medium text-[#1E4E8C] hover:underline">
              閱讀主題教學
            </Link>
          </div>
          <div className="space-y-3">
            {data.topicMastery.map((t) => {
              const pct =
                t.totalQuestions > 0
                  ? Math.round((t.solvedCorrect / t.totalQuestions) * 100)
                  : 0;
              return (
                <div key={t.topicId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Link
                      href={`/topics/${t.slug}`}
                      className="font-medium text-[#17191C] hover:text-[#1E4E8C]"
                    >
                      {t.title}
                    </Link>
                    <span className="font-code text-[#525866] tabular-nums">
                      已過 {t.solvedCorrect}/{t.totalQuestions} 題
                      {t.accuracy !== null ? ` · 正確率 ${t.accuracy}%` : ""}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F0EFEA]">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#1E4E8C] ui-transition"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-6 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17191C]">六大認知題型表現</h2>
            <span className="text-xs text-[#525866]">點擊弱項直接特訓</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.typeMastery.map((tm) => (
              <Link
                key={tm.type}
                href={`/practice?type=${tm.type}`}
                className="flex items-center justify-between rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-3.5 py-2.5 ui-transition hover:border-[#1E4E8C] hover:bg-white"
              >
                <div>
                  <div className="text-sm font-medium text-[#17191C]">{tm.label}</div>
                  <div className="text-[11px] text-[#6C7382] tabular-nums">
                    作答 {tm.attempts} 次（對 {tm.correct}）
                  </div>
                </div>
                <span
                  className={`font-code text-sm font-bold tabular-nums ${
                    tm.accuracy === null
                      ? "text-[#6C7382]"
                      : tm.accuracy >= 70
                      ? "text-[#157F4B]"
                      : "text-[#C23535]"
                  }`}
                >
                  {tm.accuracy !== null ? `${tm.accuracy}%` : "未作答"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Classes & Assignments */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1E4E8C]" strokeWidth={1.75} />
            <h2 className="text-base font-bold text-[#17191C]">我的班級與加入代碼</h2>
          </div>

          <form onSubmit={handleJoinClass} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="輸入 6 碼班級代碼（如 APCS2A）"
              className="flex-1 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-1.5 font-code text-sm uppercase text-[#17191C] focus:border-[#1E4E8C] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-[#1E4E8C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163C6E] disabled:opacity-45"
            >
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>{joining ? "加入中..." : "加入"}</span>
            </button>
          </form>

          {joinError && (
            <div className="flex items-center gap-1.5 rounded border border-[#C23535]/30 bg-[#FCEEEE] px-3 py-2 text-xs text-[#C23535]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>{joinError}</span>
            </div>
          )}
          {joinSuccess && (
            <div className="flex items-center gap-1.5 rounded border border-[#157F4B]/30 bg-[#EAF6EF] px-3 py-2 text-xs text-[#157F4B]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>{joinSuccess}</span>
            </div>
          )}

          {data.classes.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
              你尚未加入任何班級。向任課老師取得 6 碼加入代碼後輸入上方欄位，即可同步接收班級作業與專屬題目。
            </p>
          ) : (
            <div className="space-y-2">
              {data.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#17191C]">{cls.name}</span>
                    <span className="rounded bg-white border border-[#E2E0D8] px-2 py-0.5 font-code text-xs text-[#1E4E8C]">
                      {cls.join_code}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#525866]">
                    授課教師：{cls.teacher_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-7 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#1E4E8C]" strokeWidth={1.75} />
            <h2 className="text-base font-bold text-[#17191C]">班級指派作業任務</h2>
          </div>

          {data.assignments.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
              目前所屬班級尚無指派作業，你可以先自由到各主題教學頁或刷題工作台自主練習。
            </p>
          ) : (
            <div className="space-y-3">
              {data.assignments.map((a) => {
                const donePct =
                  a.question_count > 0
                    ? Math.round((a.completed_count / a.question_count) * 100)
                    : 0;
                return (
                  <div
                    key={a.id}
                    className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#525866]">
                          <span className="rounded bg-[#EAF1FA] px-2 py-0.5 font-medium text-[#1E4E8C]">
                            {a.class_name}
                          </span>
                          {a.due_date && (
                            <span className="font-code">截止：{a.due_date}</span>
                          )}
                        </div>
                        <h3 className="mt-1 text-sm font-semibold text-[#17191C]">
                          {a.title}
                        </h3>
                        {a.description && (
                          <p className="mt-0.5 text-xs text-[#525866]">{a.description}</p>
                        )}
                      </div>

                      <Link
                        href={`/practice?assignmentId=${a.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-[#1E4E8C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163C6E]"
                      >
                        <span>
                          {a.completed_count >= a.question_count ? "檢視／重練" : "開始作答"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E0D8]">
                        <div
                          style={{ width: `${donePct}%` }}
                          className="h-full bg-[#157F4B]"
                        />
                      </div>
                      <span className="font-code text-[#525866] tabular-nums">
                        完成 {a.completed_count}/{a.question_count}（答對 {a.correct_count}）
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Wrong Questions Review List */}
      <section className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#17191C]">待訂正錯題與迷思紀錄</h2>
          <Link
            href="/practice?status=wrong"
            className="text-xs font-medium text-[#1E4E8C] hover:underline"
          >
            一鍵專刷所有錯題
          </Link>
        </div>

        {data.recentWrong.length === 0 ? (
          <p className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
            太棒了！目前沒有尚未訂正的錯題。
          </p>
        ) : (
          <div className="divide-y divide-[#E2E0D8] rounded-md border border-[#E2E0D8]">
            {data.recentWrong.map((w) => (
              <div
                key={w.attemptId}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-sm"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {w.officialRef && (
                      <span className="rounded bg-[#17191C] px-1.5 py-0.5 font-code text-white">
                        {w.officialRef}
                      </span>
                    )}
                    <span className="font-medium text-[#1E4E8C]">{w.topicTitle}</span>
                    <span className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-1.5 py-0.5 text-[#525866]">
                      {QUESTION_TYPE_LABELS[w.questionType]}
                    </span>
                    <span className="font-code text-[#C23535]">
                      誤選 ({w.selectedOption})
                    </span>
                  </div>
                  <div className="font-medium text-[#17191C]">{w.title}</div>
                  {w.misconception && (
                    <p className="text-xs text-[#525866]">{w.misconception}</p>
                  )}
                </div>

                <Link
                  href={`/practice?topic=${w.topicSlug}&qid=${w.questionId}`}
                  className="inline-flex items-center gap-1 rounded-md border border-[#1E4E8C] px-3 py-1.5 text-xs font-medium text-[#1E4E8C] hover:bg-[#EAF1FA]"
                >
                  <span>立即重練追蹤</span>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
