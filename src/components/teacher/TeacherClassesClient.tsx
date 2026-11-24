"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Plus, Trash2, UserCog, UserMinus, Users } from "lucide-react";
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
          班級名冊 ({classes.length})
        </h1>
      </header>

      {/* Inline Create Class Bar */}
      <form onSubmit={handleCreateClass} className="rail-frame p-4 space-y-2.5">
        <div className="grid gap-2.5 sm:grid-cols-12">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="班級名稱（如：高二資訊乙班）"
            className="rail-input sm:col-span-4 px-3 py-2 text-xs font-bold"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="備註（選填）"
            className="rail-input sm:col-span-6 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-2 rail-btn-green inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>{creating ? "建立中" : "新增班級"}</span>
          </button>
        </div>
        {error && <p className="text-xs font-bold text-[#FF7A85]">{error}</p>}
      </form>

      {/* Split Timetable: Class List & Member Roster */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rail-frame divide-y divide-white/12">
          {classes.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7E91B8]">尚無班級</div>
          ) : (
            classes.map((cls) => {
              const isSelected = Number(cls.id) === selectedClassId;
              return (
                <div
                  key={cls.id}
                  onClick={() => loadClassDetail(Number(cls.id))}
                  className={`cursor-pointer p-4 ui-transition ${
                    isSelected
                      ? "bg-[#22B14C]/14"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white">{cls.name}</h3>
                      {cls.description && (
                        <p className="mt-0.5 text-xs text-[#B8C5E0]">{cls.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(Number(cls.id));
                      }}
                      title="刪除班級"
                      className="rounded p-1 text-[#7E91B8] hover:text-[#FF7A85]"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-code text-[#B8C5E0] tabular-nums">
                      <Users className="h-3.5 w-3.5" strokeWidth={2} />
                      {cls.member_count ?? 0} 人
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(cls.join_code);
                      }}
                      className="inline-flex items-center gap-1 rounded border border-white/25 bg-[#070C22] px-2 py-0.5 font-code font-bold text-[#4ADE80] hover:border-white"
                    >
                      <span>{cls.join_code}</span>
                      {copiedCode === cls.join_code ? (
                        <Check className="h-3 w-3" strokeWidth={2.2} />
                      ) : (
                        <Copy className="h-3 w-3" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7 rail-frame p-4 sm:p-5">
          {!activeClass ? (
            <p className="text-xs text-[#7E91B8]">選擇左側班級檢視名冊</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
                <h2 className="text-base font-black text-white">
                  {activeClass.name}
                </h2>
                <span className="rounded bg-[#070C22] border border-white/20 px-2.5 py-0.5 font-code text-xs font-bold text-[#4ADE80]">
                  {activeClass.join_code}
                </span>
              </div>

              {loadingMembers ? (
                <p className="text-xs text-[#7E91B8]">載入中...</p>
              ) : members.length === 0 ? (
                <div className="rail-well p-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#B8C5E0]">本班尚無學生</span>
                  <Link
                    href="/teacher/students"
                    className="rail-btn-green inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  >
                    <UserCog className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>建立學生帳號</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/15 text-[#7E91B8]">
                        <th className="py-2 text-left font-bold">姓名</th>
                        <th className="py-2 text-left font-bold">帳號</th>
                        <th className="py-2 text-right font-bold">破關</th>
                        <th className="py-2 text-right font-bold">作答</th>
                        <th className="py-2 text-right font-bold">正確率</th>
                        <th className="py-2 text-right font-bold">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {members.map((m) => (
                        <tr key={m.student_id}>
                          <td className="py-2.5 font-bold text-white">
                            {m.display_name}
                          </td>
                          <td className="py-2.5 font-code text-[#B8C5E0]">
                            {m.username}
                          </td>
                          <td className="py-2.5 text-right font-code text-white tabular-nums">
                            {m.solved_distinct}
                          </td>
                          <td className="py-2.5 text-right font-code text-[#B8C5E0] tabular-nums">
                            {m.attempts}
                          </td>
                          <td className="py-2.5 text-right font-code font-bold text-[#4ADE80] tabular-nums">
                            {m.accuracy !== null ? `${m.accuracy}%` : "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/teacher/students?studentId=${m.student_id}`}
                                className="rail-btn inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-[#4ADE80]"
                              >
                                <UserCog className="h-3 w-3" strokeWidth={2} />
                                <span>管理</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(m.student_id)}
                                className="rail-btn inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-[#FF7A85]"
                              >
                                <UserMinus className="h-3 w-3" strokeWidth={2} />
                                <span>移出</span>
                              </button>
                            </div>
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
