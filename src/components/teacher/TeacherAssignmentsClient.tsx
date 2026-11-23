"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import type { ClassRecord, QuestionRecord } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

interface AssignmentWithProgress {
  id: number;
  class_id: number;
  class_name: string;
  title: string;
  description: string;
  question_ids: number[];
  due_date: string | null;
  is_published: boolean;
  created_by: number;
  created_at: string;
  student_progress: Array<{
    studentId: number;
    displayName: string;
    username: string;
    completedCount: number;
    correctCount: number;
  }>;
}

export function TeacherAssignmentsClient({
  initialAssignments,
  classes,
  questions,
}: {
  initialAssignments: AssignmentWithProgress[];
  classes: ClassRecord[];
  questions: QuestionRecord[];
}) {
  const [assignments, setAssignments] =
    useState<AssignmentWithProgress[]>(initialAssignments);
  const [classId, setClassId] = useState<string>(
    classes[0] ? String(classes[0].id) : ""
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedQIds, setSelectedQIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleQuestion(id: number) {
    setSelectedQIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function refreshAssignments() {
    const res = await fetch("/api/teacher/assignments");
    if (res.ok) {
      const json = await res.json();
      setAssignments(json.assignments ?? []);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!classId || !title.trim() || selectedQIds.length === 0) {
      setError("請選擇班級、填寫作業標題，並至少勾選 1 道題目。");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: Number(classId),
          title,
          description,
          due_date: dueDate || null,
          question_ids: selectedQIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "建立作業失敗");
        return;
      }
      setTitle("");
      setDescription("");
      setDueDate("");
      setSelectedQIds([]);
      await refreshAssignments();
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(a: AssignmentWithProgress) {
    const res = await fetch(`/api/teacher/assignments/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !a.is_published }),
    });
    if (res.ok) {
      await refreshAssignments();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("確定要刪除此班級作業嗎？")) return;
    const res = await fetch(`/api/teacher/assignments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E0D8] pb-4">
        <h1 className="text-2xl font-bold text-[#17191C]">班級作業指派與完成追蹤</h1>
        <p className="mt-1 text-sm text-[#525866]">
          挑選題庫題目指派給特定班級，並即時追蹤班上每位學生的作答完成進度與答對數。
        </p>
      </div>

      {/* Create Assignment Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-4"
      >
        <div className="text-sm font-bold text-[#17191C]">指派新作業任務</div>
        {classes.length === 0 ? (
          <p className="text-xs text-[#C23535]">
            您目前尚未建立任何班級，請先至「班級與學生管理」新增班級後再指派作業。
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                <span className="mb-1 block font-semibold text-[#525866]">目標班級</span>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-2 text-sm"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.join_code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-semibold text-[#525866]">作業名稱</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：第二週遞迴堆疊複習"
                  className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm"
                />
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-semibold text-[#525866]">截止日期（選填）</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 font-code text-sm"
                />
              </label>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">作答指示說明</span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：請先操作完該單元視覺化實驗後再作答"
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm"
              />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#525866]">
                  勾選本次作業題目（已選{" "}
                  <span className="font-code text-[#0F6B5E]">{selectedQIds.length}</span> 題）：
                </span>
                {selectedQIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedQIds([])}
                    className="text-[#525866] hover:underline"
                  >
                    清空勾選
                  </button>
                )}
              </div>

              <div className="max-h-52 overflow-y-auto rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-2.5 grid gap-1.5 sm:grid-cols-2">
                {questions.map((q) => {
                  const checked = selectedQIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex cursor-pointer items-center gap-2 rounded border px-2.5 py-1.5 text-xs ${
                        checked
                          ? "border-[#0F6B5E] bg-[#E6F4F1]"
                          : "border-[#E2E0D8] bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuestion(q.id)}
                        className="accent-[#0F6B5E]"
                      />
                      <span className="font-code font-semibold text-[#17191C]">
                        {q.official_ref ?? `#${q.id}`}
                      </span>
                      <span className="truncate flex-1 text-[#17191C]">{q.title}</span>
                      <span className="text-[10px] text-[#6C7382]">
                        {QUESTION_TYPE_LABELS[q.question_type]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-xs text-[#C23535]">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0F6B5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B5349] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                <span>{creating ? "發佈中..." : "指派作業"}</span>
              </button>
            </div>
          </>
        )}
      </form>

      {/* Existing Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E2E0D8] bg-white p-6 text-center text-xs text-[#525866]">
            尚未指派任何作業任務。
          </div>
        ) : (
          assignments.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-[#E6F4F1] px-2 py-0.5 font-medium text-[#0F6B5E]">
                      {a.class_name}
                    </span>
                    <span className="font-code text-[#525866] tabular-nums">
                      共 {a.question_ids.length} 題
                    </span>
                    {a.due_date && (
                      <span className="inline-flex items-center gap-1 font-code text-[#525866]">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {a.due_date}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-base font-bold text-[#17191C]">{a.title}</h2>
                  {a.description && (
                    <p className="mt-0.5 text-xs text-[#525866]">{a.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(a)}
                    className={`rounded px-2.5 py-1 text-xs font-medium ${
                      a.is_published
                        ? "bg-[#EAF6EF] text-[#157F4B]"
                        : "bg-[#F0EFEA] text-[#6C7382]"
                    }`}
                  >
                    {a.is_published ? "進行中（已開放）" : "已關閉"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="rounded border border-[#E2E0D8] p-1.5 text-[#C23535] hover:bg-[#FCEEEE]"
                    title="刪除作業"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Per-Student Completion Breakdown */}
              <div className="border-t border-[#E2E0D8] pt-3">
                <div className="mb-2 text-xs font-semibold text-[#525866]">
                  班級學生完成狀態：
                </div>
                {a.student_progress.length === 0 ? (
                  <p className="text-xs text-[#6C7382]">本班尚未有學生加入。</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {a.student_progress.map((sp) => (
                      <div
                        key={sp.studentId}
                        className="flex items-center justify-between rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-[#17191C]">{sp.displayName}</span>
                        <span className="font-code tabular-nums text-[#525866]">
                          完成 {sp.completedCount}/{a.question_ids.length}（對{" "}
                          <strong className="text-[#157F4B]">{sp.correctCount}</strong>）
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
