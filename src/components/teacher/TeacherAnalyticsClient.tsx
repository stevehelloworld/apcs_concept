"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { QuestionType, TeacherAnalyticsPayload } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

const ALL_TYPES: QuestionType[] = [
  "trace",
  "fill",
  "debug",
  "counterexample",
  "static",
  "complexity",
];

function getCellBadgeStyle(accuracy: number | null): string {
  if (accuracy === null) return "bg-[#F8F9FB] text-[#647082] border-[#C4CBD6]";
  if (accuracy >= 80) return "bg-[#E6FAF3] text-[#007A57] border-[#9EE7D0]";
  if (accuracy >= 55) return "bg-[#FFF6E0] text-[#9A5800] border-[#FCD47A]";
  return "bg-[#FDECEC] text-[#C62828] border-[#F9B4B4]";
}

export function TeacherAnalyticsClient({
  initialData,
}: {
  initialData: TeacherAnalyticsPayload;
}) {
  const [data, setData] = useState<TeacherAnalyticsPayload>(initialData);
  const [selectedClass, setSelectedClass] = useState<string>(
    initialData.selectedClassId ? String(initialData.selectedClassId) : "all"
  );
  const [loading, setLoading] = useState(false);

  async function handleClassChange(nextVal: string) {
    setSelectedClass(nextVal);
    setLoading(true);
    try {
      const qs = nextVal === "all" ? "" : `?classId=${nextVal}`;
      const res = await fetch(`/api/teacher/analytics${qs}`);
      if (res.ok) {
        const next = (await res.json()) as TeacherAnalyticsPayload;
        setData(next);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <section className="synth-panel-hard p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#11151C]">班級識讀數據總覽</h1>
          <p className="mt-1 text-sm text-[#4B5565]">
            僅統計您本人所屬班級學生的真實作答數據（嚴格班級隔離）
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-[#4B5565]">
            篩選班級：
            <select
              value={selectedClass}
              disabled={loading}
              onChange={(e) => handleClassChange(e.target.value)}
              className="ml-2 rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-3 py-1.5 text-sm font-medium text-[#11151C]"
            >
              <option value="all">名下所有班級 ({data.classes.length})</option>
              {data.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.join_code})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => handleClassChange(selectedClass)}
            disabled={loading}
            className="synth-pad inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              strokeWidth={2}
            />
            <span>同步</span>
          </button>
        </div>
      </section>

      {/* Recessed OLED KPI Telemetry Strip */}
      <section className="synth-oled grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#262F3F]">
        <div className="lg:pr-4">
          <div className="font-display text-3xl font-bold text-[#00E5A0] tabular-nums">
            {data.kpis.studentCount} 人
          </div>
          <div className="mt-1 text-xs font-bold text-[#A8B6CC]">所屬學生總數</div>
        </div>
        <div className="lg:px-4">
          <div className="font-display text-3xl font-bold text-white tabular-nums">
            {data.kpis.totalAttempts} 筆
          </div>
          <div className="mt-1 text-xs font-bold text-[#A8B6CC]">累計作答筆數</div>
        </div>
        <div className="lg:px-4">
          <div className="font-display text-3xl font-bold text-[#38BDF8] tabular-nums">
            {data.kpis.accuracy !== null ? `${data.kpis.accuracy}%` : "—"}
          </div>
          <div className="mt-1 text-xs font-bold text-[#A8B6CC]">班級平均正確率</div>
        </div>
        <div className="lg:pl-4">
          <div className="font-display text-3xl font-bold text-[#FFB800] tabular-nums">
            {data.kpis.activeAssignments} 份
          </div>
          <div className="mt-1 text-xs font-bold text-[#A8B6CC]">進行中指派作業</div>
        </div>
      </section>

      {/* 5x6 Topic x Cognitive Type Accuracy Matrix */}
      <section className="synth-panel-hard p-5 space-y-3">
        <div>
          <h2 className="text-lg font-black text-[#11151C]">
            班級弱點熱度矩陣（五大主題 × 六大考法）
          </h2>
          <p className="text-xs text-[#4B5565]">
            綠底 ≥ 80% · 黃底 55%–79% · 紅底 &lt; 55%（快速定位全班失分組合）
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#C4CBD6]">
          <table className="w-full min-w-[680px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#161A22] text-white">
                <th className="border-r border-[#262F3F] px-3 py-2.5 text-left font-bold">
                  知識主題
                </th>
                {ALL_TYPES.map((qt) => (
                  <th
                    key={qt}
                    className="border-r border-[#262F3F] last:border-r-0 px-2 py-2.5 text-center font-bold"
                  >
                    {QUESTION_TYPE_LABELS[qt]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.topicId} className="border-t border-[#C4CBD6]">
                  <td className="border-r border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2.5 font-bold text-[#11151C]">
                    {row.topicTitle}
                  </td>
                  {ALL_TYPES.map((qt) => {
                    const cell = row.cells[qt];
                    return (
                      <td
                        key={qt}
                        className="border-r border-[#C4CBD6] last:border-r-0 p-1.5 text-center"
                      >
                        <div
                          className={`rounded-lg border px-2 py-1.5 font-code tabular-nums ${getCellBadgeStyle(
                            cell.accuracy
                          )}`}
                        >
                          <div className="font-bold">
                            {cell.accuracy !== null ? `${cell.accuracy}%` : "—"}
                          </div>
                          <div className="text-[10px] opacity-85">
                            {cell.attempts > 0 ? `${cell.correct}/${cell.attempts}` : "無紀錄"}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Weakest Questions + Student Overview */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-6 synth-panel-hard p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#C62828]" strokeWidth={2} />
              <h2 className="text-base font-black text-[#11151C]">
                最高錯誤率題目與常見迷思
              </h2>
            </div>
            <Link
              href="/teacher/assignments"
              className="text-xs font-bold text-[#007A5B] hover:underline"
            >
              指派補強作業 →
            </Link>
          </div>

          {data.weakestQuestions.length === 0 ? (
            <p className="synth-recess p-4 text-xs text-[#4B5565]">
              所選班級目前尚無錯誤作答紀錄。
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.weakestQuestions.map((wq) => (
                <div
                  key={wq.questionId}
                  className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {wq.officialRef && (
                        <span className="shrink-0 rounded bg-[#161A22] px-1.5 py-0.5 font-code font-bold text-white">
                          {wq.officialRef}
                        </span>
                      )}
                      <span className="truncate font-bold text-[#11151C]">{wq.title}</span>
                    </div>
                    <span className="shrink-0 font-code font-bold text-[#C62828] tabular-nums">
                      錯 {wq.errorRate}% ({wq.wrongCount}/{wq.attempts})
                    </span>
                  </div>
                  {wq.topWrongOption && (
                    <p className="text-[#4B5565] leading-relaxed">
                      <span className="font-bold text-[#11151C]">
                        最常見誤選 ({wq.topWrongOption})：
                      </span>
                      {wq.topMisconception}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-6 synth-panel-hard p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-black text-[#11151C]">學生學習進度一覽</h2>
            <Link
              href="/teacher/classes"
              className="text-xs font-bold text-[#007A5B] hover:underline"
            >
              管理班級名單 →
            </Link>
          </div>

          {data.studentOverview.length === 0 ? (
            <p className="synth-recess p-4 text-xs text-[#4B5565]">
              尚未有學生加入所選班級，請至「班級與學生名冊」複製加入代碼給學生。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#C4CBD6] text-[#4B5565]">
                    <th className="py-2 text-left font-bold">姓名</th>
                    <th className="py-2 text-left font-bold">班級</th>
                    <th className="py-2 text-right font-bold">通過題數</th>
                    <th className="py-2 text-right font-bold">作答次數</th>
                    <th className="py-2 text-right font-bold">正確率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4DAE4]">
                  {data.studentOverview.map((s) => (
                    <tr key={`${s.studentId}-${s.className}`}>
                      <td className="py-2.5 font-bold text-[#11151C]">
                        {s.displayName}
                        <span className="ml-1 font-code text-[11px] font-normal text-[#647082]">
                          ({s.username})
                        </span>
                      </td>
                      <td className="py-2.5 text-[#4B5565]">{s.className}</td>
                      <td className="py-2.5 text-right font-code tabular-nums">
                        {s.solvedDistinct}
                      </td>
                      <td className="py-2.5 text-right font-code tabular-nums">
                        {s.attempts}
                      </td>
                      <td className="py-2.5 text-right font-code font-bold text-[#007A5B] tabular-nums">
                        {s.accuracy !== null ? `${s.accuracy}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
