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
      <section className="synth-panel-hard p-5">
        <h1 className="text-2xl font-black text-[#11151C]">班級與學生名冊管理</h1>
        <p className="mt-1 text-sm text-[#4B5565]">
          建立新班級並將系統產生的 6 碼代碼發給學生；每位教師僅能管理自己名下班級。
        </p>
      </section>

      {/* Create Class Form */}
      <form onSubmit={handleCreateClass} className="synth-panel-hard p-5 space-y-3">
        <div className="text-sm font-black text-[#11151C]">建立新班級</div>
        <div className="grid gap-3 sm:grid-cols-12">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="班級名稱（如：高二資訊乙班）"
            className="sm:col-span-4 rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="班級備註說明（選填）"
            className="sm:col-span-6 rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-2 synth-pad-emerald inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            <span>{creating ? "建立中" : "新增班級"}</span>
          </button>
        </div>
        {error && <p className="text-xs font-bold text-[#C62828]">{error}</p>}
      </form>

      {/* Split View: Class List & Member Roster */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 space-y-2.5">
          <div className="px-1 font-code text-xs font-bold text-[#4B5565]">
            我的班級列表（共 {classes.length} 班）
          </div>
          {classes.length === 0 ? (
            <div className="synth-panel p-6 text-center text-xs text-[#4B5565]">
              尚未建立班級，請從上方新增第一個班級。
            </div>
          ) : (
            classes.map((cls) => {
              const isSelected = Number(cls.id) === selectedClassId;
              return (
                <div
                  key={cls.id}
                  onClick={() => loadClassDetail(Number(cls.id))}
                  className={`cursor-pointer rounded-2xl border-2 p-4 ui-transition ${
                    isSelected
                      ? "border-[#161A22] bg-[#E6F7F2] shadow-xs"
                      : "border-[#C4CBD6] bg-white hover:border-[#161A22]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#11151C]">{cls.name}</h3>
                      {cls.description && (
                        <p className="mt-0.5 text-xs text-[#4B5565]">{cls.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(Number(cls.id));
                      }}
                      title="刪除班級"
                      className="rounded-lg p-1.5 text-[#647082] hover:bg-[#FDECEC] hover:text-[#C62828]"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#C4CBD6] pt-2.5 text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-[#4B5565] tabular-nums">
                      <Users className="h-3.5 w-3.5" strokeWidth={2} />
                      {cls.member_count ?? 0} 位學生
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(cls.join_code);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 font-code font-bold text-[#007A5B] hover:border-[#007A5B]"
                    >
                      <span>代碼：{cls.join_code}</span>
                      {copiedCode === cls.join_code ? (
                        <Check className="h-3 w-3 text-[#007A57]" strokeWidth={2.2} />
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

        <div className="lg:col-span-7 synth-panel-hard p-5">
          {!activeClass ? (
            <p className="text-sm text-[#4B5565]">請先點選左側班級以檢視學生名冊。</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4DAE4] pb-3">
                <div>
                  <h2 className="text-base font-black text-[#11151C]">
                    {activeClass.name} — 學生名單
                  </h2>
                  <p className="text-xs text-[#4B5565]">
                    加入代碼：
                    <span className="ml-1 rounded bg-[#161A22] px-2 py-0.5 font-code font-bold text-[#00E5A0]">
                      {activeClass.join_code}
                    </span>
                  </p>
                </div>
              </div>

              {loadingMembers ? (
                <p className="text-xs font-bold text-[#4B5565]">載入學生名單中...</p>
              ) : members.length === 0 ? (
                <div className="synth-recess p-4 text-xs leading-relaxed text-[#4B5565] space-y-2">
                  <p>
                    本班目前尚無學生。系統已關閉對外自行註冊，請前往「學生帳號與進度」由教師直接建立或分派學生到此班級。
                  </p>
                  <Link
                    href="/teacher/students"
                    className="synth-pad-emerald inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  >
                    <UserCog className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>前往建立學生帳號</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#C4CBD6] text-[#4B5565]">
                        <th className="py-2 text-left font-bold">學生姓名</th>
                        <th className="py-2 text-left font-bold">帳號</th>
                        <th className="py-2 text-right font-bold">通過題數</th>
                        <th className="py-2 text-right font-bold">作答次數</th>
                        <th className="py-2 text-right font-bold">正確率</th>
                        <th className="py-2 text-right font-bold">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4DAE4]">
                      {members.map((m) => (
                        <tr key={m.student_id}>
                          <td className="py-2.5 font-bold text-[#11151C]">
                            {m.display_name}
                          </td>
                          <td className="py-2.5 font-code text-[#4B5565]">{m.username}</td>
                          <td className="py-2.5 text-right font-code tabular-nums">
                            {m.solved_distinct}
                          </td>
                          <td className="py-2.5 text-right font-code tabular-nums">
                            {m.attempts}
                          </td>
                          <td className="py-2.5 text-right font-code font-bold text-[#007A5B] tabular-nums">
                            {m.accuracy !== null ? `${m.accuracy}%` : "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={`/teacher/students?studentId=${m.student_id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 text-[11px] font-bold text-[#007A5B] hover:border-[#007A5B]"
                              >
                                <UserCog className="h-3 w-3" strokeWidth={2} />
                                <span>管理</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(m.student_id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 text-[11px] font-bold text-[#C62828] hover:bg-[#FDECEC]"
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
