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
      setError("請選班級、填標題並至少勾選 1 題。");
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
    if (!confirm("確定刪除此作業？")) return;
    const res = await fetch(`/api/teacher/assignments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
          班級作業 ({assignments.length})
        </h1>
      </header>

      {/* Create Assignment Panel */}
      <form onSubmit={handleCreate} className="rail-frame p-4 sm:p-5 space-y-3.5">
        <div className="text-xs font-black text-[#4ADE80]">指派新作業</div>
        {classes.length === 0 ? (
          <p className="text-xs font-bold text-[#FF7A85]">請先建立班級</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">班級</span>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="rail-input w-full px-2.5 py-1.5 text-xs font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.join_code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">標題</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="第二週遞迴複習"
                  className="rail-input w-full px-3 py-1.5 text-xs"
                />
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">截止日期</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rail-input w-full px-3 py-1.5 font-code text-xs"
                />
              </label>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">說明（選填）</span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="作業指示"
                className="rail-input w-full px-3 py-1.5 text-xs"
              />
            </label>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-bold text-[#B8C5E0]">
                  勾選題目（已選{" "}
                  <span className="font-code text-[#4ADE80]">{selectedQIds.length}</span>）
                </span>
                {selectedQIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedQIds([])}
                    className="font-bold text-[#7E91B8] hover:text-white"
                  >
                    清空
                  </button>
                )}
              </div>

              <div className="rail-well max-h-52 overflow-y-auto p-2.5 grid gap-1.5 sm:grid-cols-2">
                {questions.map((q) => {
                  const checked = selectedQIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex cursor-pointer items-center gap-2 rounded border px-2.5 py-1.5 text-xs ui-transition ${
                        checked
                          ? "border-[#22B14C] bg-[#22B14C]/18 text-white"
                          : "border-white/15 bg-[#0B1230] text-[#B8C5E0]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuestion(q.id)}
                        className="accent-[#22B14C]"
                      />
                      <span className="rounded bg-white px-1.5 py-0.5 font-code text-[10px] font-bold text-[#0B1230]">
                        {q.official_ref ?? `#${q.id}`}
                      </span>
                      <span className="truncate flex-1 font-bold">{q.title}</span>
                      <span className="text-[10px] text-[#7E91B8]">
                        {QUESTION_TYPE_LABELS[q.question_type]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-xs font-bold text-[#FF7A85]">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rail-btn-green inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>{creating ? "發佈中" : "指派作業"}</span>
              </button>
            </div>
          </>
        )}
      </form>

      {/* Existing Assignments */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rail-frame p-6 text-center text-xs text-[#7E91B8]">
            尚無作業
          </div>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="rail-frame p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-bold text-[#4ADE80]">
                      {a.class_name}
                    </span>
                    <span className="font-code font-bold text-[#B8C5E0] tabular-nums">
                      {a.question_ids.length} 題
                    </span>
                    {a.due_date && (
                      <span className="inline-flex items-center gap-1 font-code text-[#7E91B8]">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                        {a.due_date}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1.5 text-base font-black text-white">{a.title}</h2>
                  {a.description && (
                    <p className="mt-0.5 text-xs text-[#B8C5E0]">{a.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(a)}
                    className={`rounded px-2.5 py-1 text-xs font-bold ${
                      a.is_published
                        ? "bg-[#22B14C]/18 text-[#4ADE80]"
                        : "bg-white/10 text-[#7E91B8]"
                    }`}
                  >
                    {a.is_published ? "進行中" : "已關閉"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="rail-btn p-1.5 text-[#FF7A85]"
                    title="刪除"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/15 pt-2.5">
                {a.student_progress.length === 0 ? (
                  <p className="text-xs text-[#7E91B8]">班級尚無學生</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {a.student_progress.map((sp) => (
                      <div
                        key={sp.studentId}
                        className="rail-well flex items-center justify-between px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-white">{sp.displayName}</span>
                        <span className="font-code tabular-nums text-[#B8C5E0]">
                          {sp.completedCount}/{a.question_ids.length}（對{" "}
                          <strong className="text-[#4ADE80]">{sp.correctCount}</strong>）
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
