"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Plus, Trash2, UserMinus, Users } from "lucide-react";
import type { ClassRecord } from "@/lib/types";

interface ClassMemberStat {
  student_id: number;
  username: string;
  display_name: string;
  joined_at: string;
  attempts: number;
  solved_distinct: number;
  accuracy: number | null;
}

export function TeacherClassesClient({
  initialClasses,
}: {
  initialClasses: ClassRecord[];
}) {
  const [classes, setClasses] = useState<ClassRecord[]>(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(
    initialClasses[0]?.id ?? null
  );
  const [members, setMembers] = useState<ClassMemberStat[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function loadClassDetail(classId: number) {
    setSelectedClassId(classId);
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.members ?? []);
      }
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    if (initialClasses[0]?.id) {
      loadClassDetail(Number(initialClasses[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "建立班級失敗");
        return;
      }
      const listRes = await fetch("/api/teacher/classes");
      const listJson = await listRes.json();
      setClasses(listJson.classes ?? []);
      setNewName("");
      setNewDesc("");
      if (json.classItem?.id) {
        await loadClassDetail(Number(json.classItem.id));
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteClass(classId: number) {
    if (!confirm("確定要刪除此班級嗎？相關班級專屬題目與作業將一併刪除。")) return;
    const res = await fetch(`/api/teacher/classes/${classId}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = classes.filter((c) => Number(c.id) !== classId);
      setClasses(remaining);
      if (selectedClassId === classId) {
        const nextId = remaining[0]?.id ?? null;
        setSelectedClassId(nextId);
        if (nextId) await loadClassDetail(nextId);
        else setMembers([]);
      }
    }
  }

  async function handleRemoveStudent(studentId: number) {
    if (!selectedClassId) return;
    const res = await fetch(
      `/api/teacher/classes/${selectedClassId}/members/${studentId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.student_id !== studentId));
      setClasses((prev) =>
        prev.map((c) =>
          Number(c.id) === selectedClassId
            ? { ...c, member_count: Math.max(0, Number(c.member_count ?? 1) - 1) }
            : c
        )
      );
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // ignore
    }
  }

  const activeClass = classes.find((c) => Number(c.id) === selectedClassId) ?? null;

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E0D8] pb-4">
        <h1 className="text-2xl font-bold text-[#17191C]">班級與學生名冊管理</h1>
        <p className="mt-1 text-sm text-[#525866]">
          建立新班級並將系統產生的 6 碼代碼發給學生；每位教師僅能管理自己的班級。
        </p>
      </div>

      {/* Create Class Form */}
      <form
        onSubmit={handleCreateClass}
        className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3"
      >
        <div className="text-sm font-semibold text-[#17191C]">建立新班級</div>
        <div className="grid gap-3 sm:grid-cols-12">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="班級名稱（如：高二資訊乙班）"
            className="sm:col-span-4 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm text-[#17191C] focus:border-[#0F6B5E] focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="班級備註說明（選填）"
            className="sm:col-span-6 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm text-[#17191C] focus:border-[#0F6B5E] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0F6B5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B5349] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            <span>{creating ? "建立中" : "新增班級"}</span>
          </button>
        </div>
        {error && <p className="text-xs text-[#C23535]">{error}</p>}
      </form>

      {/* Split View: Class List & Member Roster */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-semibold text-[#525866]">
            我的班級列表（共 {classes.length} 班）
          </div>
          {classes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E0D8] bg-white p-6 text-center text-xs text-[#525866]">
              尚未建立班級，請從上方新增第一個班級。
            </div>
          ) : (
            classes.map((cls) => {
              const isSelected = Number(cls.id) === selectedClassId;
              return (
                <div
                  key={cls.id}
                  onClick={() => loadClassDetail(Number(cls.id))}
                  className={`cursor-pointer rounded-lg border p-4 ui-transition ${
                    isSelected
                      ? "border-[#0F6B5E] bg-[#E6F4F1]/60"
                      : "border-[#E2E0D8] bg-white hover:border-[#C9C6BB]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#17191C]">{cls.name}</h3>
                      {cls.description && (
                        <p className="mt-0.5 text-xs text-[#525866]">{cls.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(Number(cls.id));
                      }}
                      title="刪除班級"
                      className="rounded p-1 text-[#6C7382] hover:bg-[#FCEEEE] hover:text-[#C23535]"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#E2E0D8] pt-2.5 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#525866] tabular-nums">
                      <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {cls.member_count ?? 0} 位學生
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(cls.join_code);
                      }}
                      className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] bg-white px-2 py-0.5 font-code font-semibold text-[#0F6B5E] hover:border-[#0F6B5E]"
                    >
                      <span>代碼：{cls.join_code}</span>
                      {copiedCode === cls.join_code ? (
                        <Check className="h-3 w-3 text-[#157F4B]" strokeWidth={1.75} />
                      ) : (
                        <Copy className="h-3 w-3" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7 rounded-lg border border-[#E2E0D8] bg-white p-5">
          {!activeClass ? (
            <p className="text-sm text-[#525866]">請先點選左側班級以檢視學生名冊。</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#17191C]">
                    {activeClass.name} — 學生名單
                  </h2>
                  <p className="text-xs text-[#525866]">
                    加入代碼：<span className="font-code font-semibold text-[#0F6B5E]">{activeClass.join_code}</span>
                  </p>
                </div>
              </div>

              {loadingMembers ? (
                <p className="text-xs text-[#525866]">載入學生名單中...</p>
              ) : members.length === 0 ? (
                <p className="rounded border border-dashed border-[#E2E0D8] bg-[#F7F6F2] p-4 text-xs text-[#525866]">
                  本班目前尚無學生加入。請將代碼{" "}
                  <code className="font-code font-semibold">{activeClass.join_code}</code> 提供給學生於「註冊」或「學習儀表板」輸入。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E0D8] text-[#525866]">
                        <th className="py-2 text-left font-semibold">學生姓名</th>
                        <th className="py-2 text-left font-semibold">帳號</th>
                        <th className="py-2 text-right font-semibold">通過題數</th>
                        <th className="py-2 text-right font-semibold">作答次數</th>
                        <th className="py-2 text-right font-semibold">正確率</th>
                        <th className="py-2 text-right font-semibold">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E0D8]">
                      {members.map((m) => (
                        <tr key={m.student_id}>
                          <td className="py-2.5 font-medium text-[#17191C]">
                            {m.display_name}
                          </td>
                          <td className="py-2.5 font-code text-[#525866]">{m.username}</td>
                          <td className="py-2.5 text-right font-code tabular-nums">
                            {m.solved_distinct}
                          </td>
                          <td className="py-2.5 text-right font-code tabular-nums">
                            {m.attempts}
                          </td>
                          <td className="py-2.5 text-right font-code font-semibold tabular-nums">
                            {m.accuracy !== null ? `${m.accuracy}%` : "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(m.student_id)}
                              className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] px-2 py-1 text-[11px] text-[#C23535] hover:bg-[#FCEEEE]"
                            >
                              <UserMinus className="h-3 w-3" strokeWidth={1.75} />
                              <span>移出</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
