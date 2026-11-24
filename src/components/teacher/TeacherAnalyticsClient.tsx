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
  if (accuracy === null) return "bg-[#070C22] text-[#7E91B8] border-white/12";
  if (accuracy >= 80) return "bg-[#22B14C]/20 text-[#4ADE80] border-[#22B14C]/45";
  if (accuracy >= 55) return "bg-[#FFC20E]/18 text-[#FFD452] border-[#FFC20E]/45";
  return "bg-[#E21D2D]/22 text-[#FF7A85] border-[#E21D2D]/45";
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
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
          班級數據總覽
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="篩選班級"
            value={selectedClass}
            disabled={loading}
            onChange={(e) => handleClassChange(e.target.value)}
            className="rail-input px-3 py-1.5 text-xs font-bold"
          >
            <option value="all">全部班級 ({data.classes.length})</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.join_code})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleClassChange(selectedClass)}
            disabled={loading}
            className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              strokeWidth={2}
            />
            <span>同步</span>
          </button>
        </div>
      </header>

      {/* 4-Column KPI Strip */}
      <section className="rail-frame grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/15">
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">學生</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#4ADE80] tabular-nums">
            {data.kpis.studentCount}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">作答</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-white tabular-nums">
            {data.kpis.totalAttempts}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">正確率</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#7AA4FF] tabular-nums">
            {data.kpis.accuracy !== null ? `${data.kpis.accuracy}%` : "—"}
          </div>
        </div>
        <div className="p-4">
          <div className="font-code text-[11px] font-bold text-[#7E91B8]">作業</div>
          <div className="mt-1 font-display text-3xl font-extrabold text-[#FFD452] tabular-nums">
            {data.kpis.activeAssignments}
          </div>
        </div>
      </section>

      {/* 5x6 Topic x Cognitive Type Accuracy Matrix */}
      <section className="rail-frame p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-extrabold tracking-wide text-white">
            弱點熱度矩陣（路線 × 題型）
          </h2>
          <div className="font-code text-[11px] text-[#7E91B8]">
            ≥80% 綠 · 55–79% 黃 · &lt;55% 紅
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-white/15">
          <table className="w-full min-w-[680px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#070C22] text-[#B8C5E0]">
                <th className="border-r border-white/15 px-3 py-2 text-left font-bold">
                  路線
                </th>
                {ALL_TYPES.map((qt) => (
                  <th
                    key={qt}
                    className="border-r border-white/15 last:border-r-0 px-2 py-2 text-center font-bold"
                  >
                    {QUESTION_TYPE_LABELS[qt]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.topicId} className="border-t border-white/15">
                  <td className="border-r border-white/15 bg-[#070C22]/70 px-3 py-2 font-bold text-white">
                    {row.topicTitle}
                  </td>
                  {ALL_TYPES.map((qt) => {
                    const cell = row.cells[qt];
                    return (
                      <td
                        key={qt}
                        className="border-r border-white/15 last:border-r-0 p-1.5 text-center"
                      >
                        <div
                          className={`rounded border px-2 py-1.5 font-code tabular-nums ${getCellBadgeStyle(
                            cell.accuracy
                          )}`}
                        >
                          <div className="font-bold">
                            {cell.accuracy !== null ? `${cell.accuracy}%` : "—"}
                          </div>
                          <div className="text-[10px] opacity-85">
                            {cell.attempts > 0 ? `${cell.correct}/${cell.attempts}` : "—"}
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
        <section className="lg:col-span-6 rail-frame p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
            <h2 className="inline-flex items-center gap-1.5 font-display text-base font-extrabold text-white">
              <AlertTriangle className="h-4 w-4 text-[#FF7A85]" strokeWidth={2} />
              <span>高錯誤率題目</span>
            </h2>
            <Link
              href="/teacher/assignments"
              className="font-code text-xs font-bold text-[#4ADE80] hover:underline"
            >
              指派補強 →
            </Link>
          </div>

          {data.weakestQuestions.length === 0 ? (
            <div className="rail-well p-4 text-xs text-[#7E91B8]">無錯誤紀錄</div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.weakestQuestions.map((wq) => (
                <div key={wq.questionId} className="py-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {wq.officialRef && (
                        <span className="shrink-0 rounded bg-white px-1.5 py-0.5 font-code font-bold text-[#0B1230]">
                          {wq.officialRef}
                        </span>
                      )}
                      <span className="truncate font-bold text-white">{wq.title}</span>
                    </div>
                    <span className="shrink-0 font-code font-bold text-[#FF7A85] tabular-nums">
                      錯 {wq.errorRate}% ({wq.wrongCount}/{wq.attempts})
                    </span>
                  </div>
                  {wq.topWrongOption && (
                    <p className="text-[#B8C5E0]">
                      誤選 ({wq.topWrongOption})：{wq.topMisconception}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-6 rail-frame p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2.5">
            <h2 className="font-display text-base font-extrabold text-white">
              學生進度表
            </h2>
            <Link
              href="/teacher/students"
              className="font-code text-xs font-bold text-[#4ADE80] hover:underline"
            >
              管理帳號 →
            </Link>
          </div>

          {data.studentOverview.length === 0 ? (
            <div className="rail-well p-4 text-xs text-[#7E91B8]">班級尚無學生</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 text-[#7E91B8]">
                    <th className="py-2 text-left font-bold">姓名</th>
                    <th className="py-2 text-left font-bold">班級</th>
                    <th className="py-2 text-right font-bold">破關</th>
                    <th className="py-2 text-right font-bold">作答</th>
                    <th className="py-2 text-right font-bold">正確率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.studentOverview.map((s) => (
                    <tr key={`${s.studentId}-${s.className}`}>
                      <td className="py-2 font-bold text-white">
                        {s.displayName}{" "}
                        <span className="font-code text-[11px] font-normal text-[#7E91B8]">
                          {s.username}
                        </span>
                      </td>
                      <td className="py-2 text-[#B8C5E0]">{s.className}</td>
                      <td className="py-2 text-right font-code text-white tabular-nums">
                        {s.solvedDistinct}
                      </td>
                      <td className="py-2 text-right font-code text-[#B8C5E0] tabular-nums">
                        {s.attempts}
                      </td>
                      <td className="py-2 text-right font-code font-bold text-[#4ADE80] tabular-nums">
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
