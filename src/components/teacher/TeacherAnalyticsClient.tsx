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
  if (accuracy === null) return "bg-[#F7F6F2] text-[#6C7382] border-[#E2E0D8]";
  if (accuracy >= 80) return "bg-[#EAF6EF] text-[#157F4B] border-[#157F4B]/30";
  if (accuracy >= 55) return "bg-[#FDF4E6] text-[#B4690E] border-[#B4690E]/30";
  return "bg-[#FCEEEE] text-[#C23535] border-[#C23535]/30";
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E0D8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17191C]">班級識讀數據總覽</h1>
          <p className="mt-1 text-sm text-[#525866]">
            僅統計您本人所屬班級學生的真實作答數據（嚴格班級隔離）
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#525866]">
            篩選班級：
            <select
              value={selectedClass}
              disabled={loading}
              onChange={(e) => handleClassChange(e.target.value)}
              className="ml-2 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-sm text-[#17191C]"
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
            className="inline-flex items-center gap-1 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-medium text-[#525866] hover:bg-[#F0EFEA]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.75} />
            <span>更新</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">所屬學生總數</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#0F6B5E] tabular-nums">
            {data.kpis.studentCount} 人
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">累計作答筆數</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#17191C] tabular-nums">
            {data.kpis.totalAttempts} 筆
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">班級平均正確率</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#17191C] tabular-nums">
            {data.kpis.accuracy !== null ? `${data.kpis.accuracy}%` : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
          <div className="text-xs text-[#525866]">進行中指派作業</div>
          <div className="mt-1 font-code text-2xl font-bold text-[#17191C] tabular-nums">
            {data.kpis.activeAssignments} 份
          </div>
        </div>
      </div>

      {/* 5x6 Topic x Cognitive Type Accuracy Matrix */}
      <section className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3">
        <div>
          <h2 className="text-base font-bold text-[#17191C]">
            班級弱點熱度矩陣（五大主題 × 六大認知題型）
          </h2>
          <p className="text-xs text-[#525866]">
            綠底 ≥ 80% · 黃底 55%–79% · 紅底 &lt; 55%（快速定位全班失分組合）
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#F0EFEA] text-[#525866]">
                <th className="border border-[#E2E0D8] px-3 py-2 text-left font-semibold">
                  知識主題
                </th>
                {ALL_TYPES.map((qt) => (
                  <th key={qt} className="border border-[#E2E0D8] px-2 py-2 text-center font-semibold">
                    {QUESTION_TYPE_LABELS[qt]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.topicId}>
                  <td className="border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2.5 font-medium text-[#17191C]">
                    {row.topicTitle}
                  </td>
                  {ALL_TYPES.map((qt) => {
                    const cell = row.cells[qt];
                    return (
                      <td key={qt} className="border border-[#E2E0D8] p-1.5 text-center">
                        <div
                          className={`rounded border px-2 py-1.5 font-code tabular-nums ${getCellBadgeStyle(
                            cell.accuracy
                          )}`}
                        >
                          <div className="font-semibold">
                            {cell.accuracy !== null ? `${cell.accuracy}%` : "—"}
                          </div>
                          <div className="text-[10px] opacity-80">
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
        <section className="lg:col-span-6 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#C23535]" strokeWidth={1.75} />
              <h2 className="text-base font-bold text-[#17191C]">最高錯誤率題目與常見迷思</h2>
            </div>
            <Link href="/teacher/assignments" className="text-xs font-medium text-[#0F6B5E] hover:underline">
              指派補強作業
            </Link>
          </div>

          {data.weakestQuestions.length === 0 ? (
            <p className="rounded border border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
              所選班級目前尚無錯誤作答紀錄。
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.weakestQuestions.map((wq) => (
                <div
                  key={wq.questionId}
                  className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {wq.officialRef && (
                        <span className="rounded bg-[#17191C] px-1.5 py-0.5 font-code text-white">
                          {wq.officialRef}
                        </span>
                      )}
                      <span className="font-semibold text-[#17191C]">{wq.title}</span>
                    </div>
                    <span className="font-code font-bold text-[#C23535] tabular-nums">
                      錯 {wq.errorRate}% ({wq.wrongCount}/{wq.attempts})
                    </span>
                  </div>
                  {wq.topWrongOption && (
                    <p className="text-[#525866] leading-relaxed">
                      <span className="font-semibold text-[#17191C]">
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

        <section className="lg:col-span-6 rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17191C]">學生學習進度一覽</h2>
            <Link href="/teacher/classes" className="text-xs font-medium text-[#0F6B5E] hover:underline">
              管理班級名單
            </Link>
          </div>

          {data.studentOverview.length === 0 ? (
            <p className="rounded border border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
              尚未有學生加入所選班級，請至「班級與學生管理」複製加入代碼給學生。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E0D8] text-[#525866]">
                    <th className="py-2 text-left font-semibold">姓名</th>
                    <th className="py-2 text-left font-semibold">班級</th>
                    <th className="py-2 text-right font-semibold">通過題數</th>
                    <th className="py-2 text-right font-semibold">作答次數</th>
                    <th className="py-2 text-right font-semibold">正確率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E0D8]">
                  {data.studentOverview.map((s) => (
                    <tr key={`${s.studentId}-${s.className}`}>
                      <td className="py-2 font-medium text-[#17191C]">
                        {s.displayName}
                        <span className="ml-1 font-code text-[11px] text-[#6C7382]">
                          ({s.username})
                        </span>
                      </td>
                      <td className="py-2 text-[#525866]">{s.className}</td>
                      <td className="py-2 text-right font-code tabular-nums">
                        {s.solvedDistinct}
                      </td>
                      <td className="py-2 text-right font-code tabular-nums">{s.attempts}</td>
                      <td className="py-2 text-right font-code font-semibold tabular-nums">
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
