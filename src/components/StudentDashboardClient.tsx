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
      {/* Header Console */}
      <section className="synth-panel-hard p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#11151C] sm:text-3xl">
            {data.user.display_name} 的學習實驗紀錄
          </h1>
          <p className="mt-1 text-sm text-[#4B5565]">
            帳號{" "}
            <span className="rounded bg-[#DDE2EA] px-1.5 py-0.5 font-code text-xs font-bold text-[#11151C]">
              {data.user.username}
            </span>{" "}
            · 即時追蹤五大模組過關數、六大考法正確率與班級任務
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={refreshDashboard}
            className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
            <span>同步數據</span>
          </button>
          <Link
            href="/practice"
            className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
          >
            <span>前往刷題實驗台</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      {/* Recessed OLED Telemetry Strip */}
      <section className="synth-oled grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#262F3F]">
        <div className="lg:pr-4">
          <div className="font-display text-3xl font-bold text-[#FF8A65] tabular-nums">
            {data.stats.uniqueSolved} / {data.stats.totalVisibleQuestions}
          </div>
          <div className="mt-1 text-xs font-bold text-white">已過關獨立題數</div>
          <div className="mt-0.5 text-[11px] text-[#A8B6CC]">至少答對一次的題目</div>
        </div>

        <div className="lg:px-4">
          <div className="font-display text-3xl font-bold text-[#EEF2F8] tabular-nums">
            {data.stats.totalAttempts}
          </div>
          <div className="mt-1 text-xs font-bold text-white">累計實戰送出次數</div>
          <div className="mt-0.5 text-[11px] text-[#A8B6CC]">含訂正與重複挑戰</div>
        </div>

        <div className="lg:px-4">
          <div className="font-display text-3xl font-bold text-[#00E5A0] tabular-nums">
            {data.stats.totalAttempts > 0 ? `${data.stats.accuracy}%` : "—"}
          </div>
          <div className="mt-1 text-xs font-bold text-white">整體作答正確率</div>
          <div className="mt-0.5 text-[11px] text-[#A8B6CC]">即時批改動態統計</div>
        </div>

        <div className="lg:pl-4">
          <div className="font-display text-3xl font-bold text-[#38BDF8] tabular-nums">
            {data.stats.avgDurationSec > 0 ? `${data.stats.avgDurationSec}s` : "—"}
          </div>
          <div className="mt-1 text-xs font-bold text-white">平均單題思考時間</div>
          <div className="mt-0.5 text-[11px] text-[#A8B6CC]">掌握 APCS 讀題節奏</div>
        </div>
      </section>

      {/* 5-Channel Topic Mastery + 6-Pad Type Mastery */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-6 synth-panel-hard p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#11151C]">五大模組破關進度條</h2>
            <Link
              href="/topics"
              className="text-xs font-bold text-[#D93B09] hover:underline"
            >
              前往模組地圖 →
            </Link>
          </div>
          <div className="space-y-3.5">
            {data.topicMastery.map((t, idx) => {
              const theme = getTopicTheme(t.slug, idx);
              const pct =
                t.totalQuestions > 0
                  ? Math.round((t.solvedCorrect / t.totalQuestions) * 100)
                  : 0;
              return (
                <div key={t.topicId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Link
                      href={`/topics/${t.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[#11151C] hover:underline truncate"
                    >
                      <span
                        className="rounded px-1.5 py-0.5 font-display text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: theme.buttonBg }}
                      >
                        {theme.code}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </Link>
                    <span className="font-code text-[#4B5565] tabular-nums shrink-0">
                      {t.solvedCorrect}/{t.totalQuestions}
                      {t.accuracy !== null ? ` · ${t.accuracy}%` : " · 未挑戰"}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#DDE2EA]">
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

        <section className="lg:col-span-6 synth-panel-hard p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#11151C]">六大考法雷達墊</h2>
            <span className="text-xs font-bold text-[#4B5565]">點擊紅燈弱項立即特訓</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {data.typeMastery.map((tm) => (
              <Link
                key={tm.type}
                href={`/practice?type=${tm.type}`}
                className="synth-pad flex items-center justify-between p-3.5"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[#161A22] px-1.5 py-0.5 font-display text-[10px] font-bold text-white">
                      {QUESTION_TYPE_PAD_CODES[tm.type]}
                    </span>
                    <span className="text-sm font-bold text-[#11151C]">
                      {tm.label}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-[#4B5565] tabular-nums">
                    作答 {tm.attempts} 次（對 {tm.correct}）
                  </div>
                </div>
                <span
                  className={`font-display text-sm font-bold tabular-nums ${
                    tm.accuracy === null
                      ? "text-[#647082]"
                      : tm.accuracy >= 70
                      ? "text-[#007A57]"
                      : "text-[#C62828]"
                  }`}
                >
                  {tm.accuracy !== null ? `${tm.accuracy}%` : "NEW"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Classes & Assignments */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-5 synth-panel-hard p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#D93B09]" strokeWidth={2} />
            <h2 className="text-lg font-black text-[#11151C]">我的班級與代碼加入</h2>
          </div>

          <form onSubmit={handleJoinClass} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="輸入 6 碼代碼（如 APCS2A）"
              className="flex-1 rounded-lg border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 font-code text-sm uppercase text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={joining || !joinCode.trim()}
              className="synth-pad-orange inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold disabled:opacity-45"
            >
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>{joining ? "加入中..." : "加入"}</span>
            </button>
          </form>

          {joinError && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#F9B4B4] bg-[#FDECEC] px-3 py-2 text-xs font-medium text-[#C62828]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{joinError}</span>
            </div>
          )}
          {joinSuccess && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[#9EE7D0] bg-[#E6FAF3] px-3 py-2 text-xs font-medium text-[#007A57]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span>{joinSuccess}</span>
            </div>
          )}

          {data.classes.length === 0 ? (
            <p className="synth-recess p-4 text-xs leading-relaxed text-[#4B5565]">
              你尚未加入任何班級。向老師索取 6 碼加入代碼後輸入上方欄位，即可同步接收班級作業與專屬題庫。
            </p>
          ) : (
            <div className="divide-y divide-[#D4DAE4] rounded-xl border border-[#C4CBD6] bg-[#F8F9FB]">
              {data.classes.map((cls) => (
                <div key={cls.id} className="p-3.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#11151C]">{cls.name}</span>
                    <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-xs font-bold text-white">
                      {cls.join_code}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#4B5565]">
                    授課教師：{cls.teacher_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-7 synth-panel-hard p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#D93B09]" strokeWidth={2} />
            <h2 className="text-lg font-black text-[#11151C]">班級指派作業任務</h2>
          </div>

          {data.assignments.length === 0 ? (
            <p className="synth-recess p-4 text-xs leading-relaxed text-[#4B5565]">
              目前所屬班級尚無指派作業，你可以先自由前往五大模組實驗室或刷題台自主練習。
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
                    className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-4 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded bg-[#161A22] px-2 py-0.5 font-bold text-white">
                            {a.class_name}
                          </span>
                          {a.due_date && (
                            <span className="font-code text-[#4B5565]">
                              截止：{a.due_date}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-sm font-black text-[#11151C]">
                          {a.title}
                        </h3>
                        {a.description && (
                          <p className="mt-0.5 text-xs text-[#4B5565]">
                            {a.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/practice?assignmentId=${a.id}`}
                        className="synth-pad-orange inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold"
                      >
                        <span>
                          {a.completed_count >= a.question_count
                            ? "檢視／重練"
                            : "開始作答"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#DDE2EA]">
                        <div
                          style={{ width: `${donePct}%` }}
                          className="h-full bg-[#00A878]"
                        />
                      </div>
                      <span className="font-code font-bold text-[#4B5565] tabular-nums">
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

      {/* Wrong Questions Replay Queue */}
      <section className="synth-panel-hard p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-[#11151C]">待訂正錯題與迷思紀錄</h2>
          <Link
            href="/practice?status=wrong"
            className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            <span>一鍵專刷所有錯題</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        {data.recentWrong.length === 0 ? (
          <div className="synth-recess p-5 text-sm font-bold text-[#007A57]">
            太強了！目前沒有任何尚未訂正的錯題。
          </div>
        ) : (
          <div className="divide-y divide-[#D4DAE4] rounded-xl border border-[#C4CBD6] bg-[#F8F9FB]">
            {data.recentWrong.map((w) => (
              <div
                key={w.attemptId}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {w.officialRef && (
                      <span className="rounded bg-[#161A22] px-2 py-0.5 font-code font-bold text-white">
                        {w.officialRef}
                      </span>
                    )}
                    <span className="font-bold text-[#11151C]">{w.topicTitle}</span>
                    <span className="rounded border border-[#C4CBD6] bg-white px-2 py-0.5 text-[#4B5565]">
                      {QUESTION_TYPE_LABELS[w.questionType]}
                    </span>
                    <span className="font-code font-bold text-[#C62828]">
                      上次誤選 ({w.selectedOption})
                    </span>
                  </div>
                  <div className="font-bold text-[#11151C]">{w.title}</div>
                  {w.misconception && (
                    <p className="text-xs leading-relaxed text-[#4B5565]">
                      {w.misconception}
                    </p>
                  )}
                </div>

                <Link
                  href={`/practice?topic=${w.topicSlug}&qid=${w.questionId}`}
                  className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
                >
                  <span>立即重練追蹤</span>
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
