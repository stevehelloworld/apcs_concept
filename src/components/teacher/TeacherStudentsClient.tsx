"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  KeyRound,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { getTopicTheme } from "@/lib/topic-theme";
import type {
  ClassRecord,
  ManagedStudentSummary,
  TeacherStudentProgressPayload,
} from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

interface TeacherStudentsClientProps {
  classes: ClassRecord[];
  initialStudents: ManagedStudentSummary[];
  initialSelectedId: number | null;
  initialProgress: TeacherStudentProgressPayload | null;
}

type FormMode = "none" | "create" | "edit" | "batch";

export function TeacherStudentsClient({
  classes,
  initialStudents,
  initialSelectedId,
  initialProgress,
}: TeacherStudentsClientProps) {
  const [students, setStudents] = useState<ManagedStudentSummary[]>(initialStudents);
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);
  const [progress, setProgress] = useState<TeacherStudentProgressPayload | null>(
    initialProgress
  );
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [classFilter, setClassFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formMode, setFormMode] = useState<FormMode>("none");
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formClassIds, setFormClassIds] = useState<number[]>(() =>
    classes[0] ? [Number(classes[0].id)] : []
  );

  // Batch create state
  const [batchClassId, setBatchClassId] = useState<number>(() =>
    classes[0] ? Number(classes[0].id) : 0
  );
  const [batchText, setBatchText] = useState("");

  // Manual question mark/clear control
  const [manualQId, setManualQId] = useState<number>(() =>
    initialProgress?.availableQuestions[0]?.id ?? 0
  );

  const [submitting, setSubmitting] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function refreshStudentList() {
    const res = await fetch("/api/teacher/students");
    if (res.ok) {
      const json = await res.json();
      setStudents((json.students ?? []) as ManagedStudentSummary[]);
    }
  }

  async function selectStudent(studentId: number) {
    setSelectedId(studentId);
    setLoadingProgress(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}`);
      if (res.ok) {
        const json = await res.json();
        const nextProg = (json.progress ?? null) as TeacherStudentProgressPayload | null;
        setProgress(nextProg);
        if (nextProg?.availableQuestions.length) {
          setManualQId(nextProg.availableQuestions[0].id);
        }
      }
    } finally {
      setLoadingProgress(false);
    }
  }

  function syncSummaryFromProgress(nextProg: TeacherStudentProgressPayload) {
    const wrongCount = nextProg.recentAttempts.filter((a) => !a.is_correct).length;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === nextProg.student.id
          ? {
              ...s,
              username: nextProg.student.username,
              display_name: nextProg.student.display_name,
              classes: nextProg.student.classes,
              total_attempts: nextProg.stats.totalAttempts,
              solved_distinct: nextProg.stats.uniqueSolved,
              total_questions: nextProg.stats.totalQuestions,
              accuracy: nextProg.stats.accuracy,
              wrong_count: wrongCount,
              last_attempt_at: nextProg.recentAttempts[0]?.created_at ?? null,
            }
          : s
      )
    );
  }

  function openCreateForm() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingStudentId(null);
    setFormUsername("");
    setFormDisplayName("");
    setFormPassword("");
    setFormClassIds(
      classFilter !== "all"
        ? [Number(classFilter)]
        : classes[0]
        ? [Number(classes[0].id)]
        : []
    );
    setFormMode("create");
  }

  function openEditForm(stu: ManagedStudentSummary) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingStudentId(stu.id);
    setFormUsername(stu.username);
    setFormDisplayName(stu.display_name);
    setFormPassword("");
    setFormClassIds(stu.classes.map((c) => c.id));
    setFormMode("edit");
  }

  function toggleFormClass(cid: number) {
    setFormClassIds((prev) =>
      prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]
    );
  }

  async function handleSaveStudent(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formClassIds.length === 0) {
      setErrorMsg("請至少為學生勾選一個所屬班級。");
      return;
    }

    setSubmitting(true);
    try {
      if (formMode === "create") {
        const res = await fetch("/api/teacher/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formUsername.trim(),
            displayName: formDisplayName.trim(),
            password: formPassword,
            classIds: formClassIds,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error ?? "建立學生帳號失敗。");
          return;
        }
        const created = json.student as ManagedStudentSummary;
        const nextProg = json.progress as TeacherStudentProgressPayload | null;
        setStudents((prev) => [created, ...prev]);
        setSelectedId(created.id);
        setProgress(nextProg);
        if (nextProg?.availableQuestions.length) {
          setManualQId(nextProg.availableQuestions[0].id);
        }
        setFormMode("none");
        setSuccessMsg(`已建立學生「${created.display_name}」(${created.username})。`);
      } else if (formMode === "edit" && editingStudentId !== null) {
        const res = await fetch(`/api/teacher/students/${editingStudentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formUsername.trim(),
            displayName: formDisplayName.trim(),
            newPassword: formPassword || undefined,
            classIds: formClassIds,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setErrorMsg(json.error ?? "更新學生資料失敗。");
          return;
        }
        const updatedProg = json.progress as TeacherStudentProgressPayload | null;
        await refreshStudentList();
        if (selectedId === editingStudentId && updatedProg) {
          setProgress(updatedProg);
        }
        setFormMode("none");
        setSuccessMsg(
          formPassword
            ? `已更新「${formDisplayName.trim()}」資料並重設密碼（原登入階段已強制登出）。`
            : `已更新「${formDisplayName.trim()}」帳號與班級設定。`
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatchCreate(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!batchClassId) {
      setErrorMsg("請先選擇目標班級。");
      return;
    }

    const lines = batchText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setErrorMsg("請至少輸入一筆學生資料（格式：帳號,姓名,密碼）。");
      return;
    }

    setSubmitting(true);
    let okCount = 0;
    const failedLines: string[] = [];

    try {
      for (const line of lines) {
        const parts = line.split(/[,\t]+/).map((p) => p.trim());
        const [uname, dname, pwd] = parts;
        if (!uname || !dname || !pwd) {
          failedLines.push(`${line}（欄位不足，需為：帳號,姓名,密碼）`);
          continue;
        }
        const res = await fetch("/api/teacher/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: uname,
            displayName: dname,
            password: pwd,
            classIds: [batchClassId],
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          failedLines.push(`${uname}：${json.error ?? "建立失敗"}`);
        } else {
          okCount += 1;
        }
      }

      await refreshStudentList();
      if (okCount > 0) {
        const res = await fetch("/api/teacher/students");
        if (res.ok) {
          const json = await res.json();
          const list = (json.students ?? []) as ManagedStudentSummary[];
          setStudents(list);
          if (list[0]) {
            await selectStudent(list[0].id);
          }
        }
      }

      if (failedLines.length === 0) {
        setBatchText("");
        setFormMode("none");
        setSuccessMsg(`批次建帳完成：成功新增 ${okCount} 位學生帳號。`);
      } else {
        setSuccessMsg(okCount > 0 ? `已成功建立 ${okCount} 位學生。` : null);
        setErrorMsg(`以下 ${failedLines.length} 筆失敗：${failedLines.join(" ｜ ")}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteStudent(stu: ManagedStudentSummary) {
    if (
      !confirm(
        `確定要刪除／移出學生「${stu.display_name} (${stu.username})」嗎？若此學生僅屬於您管理的班級，帳號與所有作答紀錄將一併刪除且無法復原。`
      )
    ) {
      return;
    }

    setActionBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/teacher/students/${stu.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "刪除學生帳號失敗。");
        return;
      }

      const remaining = students.filter((s) => s.id !== stu.id);
      setStudents(remaining);
      if (selectedId === stu.id) {
        const nextId = remaining[0]?.id ?? null;
        if (nextId) {
          await selectStudent(nextId);
        } else {
          setSelectedId(null);
          setProgress(null);
        }
      }
      setSuccessMsg(
        json.mode === "deleted_account"
          ? `已永久刪除學生「${stu.display_name}」帳號與作答紀錄。`
          : `已將「${stu.display_name}」從您管理的班級移出。`
      );
    } finally {
      setActionBusy(false);
    }
  }

  async function runProgressAction(
    payload: Record<string, unknown>,
    confirmText?: string,
    doneMessage?: string
  ) {
    if (!progress) return;
    if (confirmText && !confirm(confirmText)) return;

    setActionBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/teacher/students/${progress.student.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "更新學生進度失敗。");
        return;
      }
      const nextProg = json.progress as TeacherStudentProgressPayload;
      setProgress(nextProg);
      syncSummaryFromProgress(nextProg);
      if (doneMessage) setSuccessMsg(doneMessage);
    } finally {
      setActionBusy(false);
    }
  }

  const filteredStudents = students.filter((s) => {
    if (
      classFilter !== "all" &&
      !s.classes.some((c) => String(c.id) === classFilter)
    ) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return (
        s.display_name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeSummary =
    students.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <section className="synth-panel-hard p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#11151C]">
            學生帳號 CRUD 與進度管理
          </h1>
          <p className="mt-1 text-sm text-[#4B5565]">
            由教師統一新增、編輯學生帳密與分班，並即時調校每位學生的單元與單題破關進度。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={classes.length === 0}
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              if (!batchClassId && classes[0]) setBatchClassId(Number(classes[0].id));
              setFormMode(formMode === "batch" ? "none" : "batch");
            }}
            className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold disabled:opacity-45"
          >
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            <span>批次匯入建帳</span>
          </button>

          <button
            type="button"
            disabled={classes.length === 0}
            onClick={openCreateForm}
            className="synth-pad-emerald inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold disabled:opacity-45"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.2} />
            <span>新增學生帳號</span>
          </button>
        </div>
      </section>

      {classes.length === 0 && (
        <div className="synth-panel p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#11151C]">
            您名下尚未建立任何班級，請先建立至少一個班級後再新增學生帳號。
          </p>
          <Link href="/teacher/classes" className="synth-pad-emerald px-4 py-2 text-xs font-bold">
            前往建立班級 →
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-[#F9B4B4] bg-[#FDECEC] px-4 py-3 text-xs font-bold text-[#C62828]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-[#9EE7D0] bg-[#E6FAF3] px-4 py-3 text-xs font-bold text-[#007A57]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Single Create / Edit Student Panel */}
      {(formMode === "create" || formMode === "edit") && (
        <form onSubmit={handleSaveStudent} className="synth-panel-hard p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4DAE4] pb-3">
            <h2 className="text-base font-black text-[#007A5B]">
              {formMode === "create"
                ? "建立新學生帳號"
                : `編輯學生帳號：${formDisplayName || formUsername}`}
            </h2>
            <button
              type="button"
              onClick={() => setFormMode("none")}
              className="rounded-lg p-1.5 text-[#4B5565] hover:bg-[#DDE2EA]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-3">
            <label className="text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">
                登入帳號（3–32 碼英數字或底線）
              </span>
              <input
                type="text"
                required
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="例如 stu_chen01"
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 font-code text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </label>

            <label className="text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">顯示姓名</span>
              <input
                type="text"
                required
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
                placeholder="例如 陳同學"
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </label>

            <label className="text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">
                {formMode === "create"
                  ? "初始密碼（至少 6 字元）"
                  : "重設密碼（選填，留空保留原密碼）"}
              </span>
              <input
                type="text"
                required={formMode === "create"}
                minLength={formMode === "create" ? 6 : undefined}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={formMode === "create" ? "請輸入初始密碼" : "留空表示不修改"}
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 font-code text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#4B5565]">
              分派所屬班級（至少勾選 1 班）：
            </span>
            <div className="synth-recess p-3 flex flex-wrap gap-2">
              {classes.map((cls) => {
                const checked = formClassIds.includes(Number(cls.id));
                return (
                  <label
                    key={cls.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ui-transition ${
                      checked
                        ? "border-[#161A22] bg-[#E6F7F2] text-[#007A5B]"
                        : "border-[#C4CBD6] bg-white text-[#4B5565]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFormClass(Number(cls.id))}
                      className="accent-[#007A5B]"
                    />
                    <span>{cls.name}</span>
                    <span className="font-code text-[11px] opacity-75">
                      ({cls.join_code})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#D4DAE4] pt-3.5">
            <button
              type="button"
              onClick={() => setFormMode("none")}
              className="synth-pad px-4 py-2 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="synth-pad-emerald inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>
                {submitting
                  ? "處理中..."
                  : formMode === "create"
                  ? "確認建立帳號"
                  : "儲存更新"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Batch Create Form */}
      {formMode === "batch" && (
        <form onSubmit={handleBatchCreate} className="synth-panel-hard p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4DAE4] pb-3">
            <h2 className="text-base font-black text-[#007A5B]">
              批次匯入建立學生帳號
            </h2>
            <button
              type="button"
              onClick={() => setFormMode("none")}
              className="rounded-lg p-1.5 text-[#4B5565] hover:bg-[#DDE2EA]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-12">
            <label className="sm:col-span-4 text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">匯入目標班級</span>
              <select
                value={batchClassId}
                onChange={(e) => setBatchClassId(Number(e.target.value))}
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 text-sm text-[#11151C]"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.join_code})
                  </option>
                ))}
              </select>
            </label>

            <label className="sm:col-span-8 text-xs">
              <span className="mb-1.5 block font-bold text-[#4B5565]">
                學生名單（每行一筆，格式：帳號,姓名,密碼，逗號或 Tab 分隔）
              </span>
              <textarea
                rows={4}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={"stu_lin01,林小華,apcs2025\nstu_chen02,陳大明,apcs2025"}
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] p-3 font-code text-xs text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormMode("none")}
              className="synth-pad px-4 py-2 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="synth-pad-emerald inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold disabled:opacity-50"
            >
              <UserPlus className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>{submitting ? "批次建立中..." : "執行批次建立"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="synth-panel p-4 grid gap-3 sm:grid-cols-12">
        <label className="sm:col-span-4 text-xs">
          <span className="mb-1.5 block font-bold text-[#4B5565]">篩選班級</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-white px-3 py-2 text-sm font-medium text-[#11151C]"
          >
            <option value="all">名下所有班級學生 ({students.length} 人)</option>
            {classes.map((cls) => (
              <option key={cls.id} value={String(cls.id)}>
                {cls.name} ({cls.join_code})
              </option>
            ))}
          </select>
        </label>

        <label className="sm:col-span-8 text-xs">
          <span className="mb-1.5 block font-bold text-[#4B5565]">搜尋姓名或帳號</span>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#647082]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入學生姓名或登入帳號關鍵字..."
              className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-white pl-9 pr-3 py-2 text-sm text-[#11151C] focus:border-[#161A22] focus:outline-none"
            />
          </div>
        </label>
      </div>

      {/* Split Master-Detail Console */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Student Roster */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
          <div className="px-1 font-code text-xs font-bold text-[#4B5565] tabular-nums">
            ROSTER // 顯示 {filteredStudents.length} 位學生
          </div>

          {filteredStudents.length === 0 ? (
            <div className="synth-panel p-6 text-center text-xs text-[#4B5565]">
              目前條件下沒有學生資料，請點擊右上角「新增學生帳號」建立第一位學生。
            </div>
          ) : (
            filteredStudents.map((stu) => {
              const isSelected = stu.id === selectedId;
              return (
                <div
                  key={stu.id}
                  onClick={() => selectStudent(stu.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 ui-transition ${
                    isSelected
                      ? "border-[#161A22] bg-[#E6F7F2] shadow-xs"
                      : "border-[#C4CBD6] bg-white hover:border-[#161A22]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-[#11151C]">
                          {stu.display_name}
                        </span>
                        <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-[11px] font-bold text-white">
                          {stu.username}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {stu.classes.map((c) => (
                          <span
                            key={c.id}
                            className="rounded border border-[#C4CBD6] bg-[#F8F9FB] px-2 py-0.5 text-[11px] font-bold text-[#4B5565]"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(stu);
                        }}
                        title="編輯資料與密碼"
                        className="rounded-lg border border-[#C4CBD6] bg-white p-1.5 text-[#4B5565] hover:border-[#007A5B] hover:text-[#007A5B]"
                      >
                        <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudent(stu);
                        }}
                        disabled={actionBusy}
                        title="刪除／移出學生"
                        className="rounded-lg border border-[#C4CBD6] bg-white p-1.5 text-[#C62828] hover:bg-[#FDECEC] disabled:opacity-45"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#C4CBD6] pt-2.5 font-code text-xs tabular-nums">
                    <span className="font-bold text-[#11151C]">
                      破關 {stu.solved_distinct} / {stu.total_questions}
                    </span>
                    <span className="text-[#4B5565]">
                      作答 {stu.total_attempts} 次 · 正確率{" "}
                      <strong className="text-[#007A5B]">
                        {stu.accuracy !== null ? `${stu.accuracy}%` : "—"}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Progress Control Console */}
        <div className="lg:col-span-7">
          {loadingProgress ? (
            <div className="synth-panel-hard p-10 text-center text-sm font-bold text-[#4B5565]">
              載入學生學習進度中...
            </div>
          ) : !progress ? (
            <div className="synth-panel-hard p-10 text-center text-sm font-bold text-[#4B5565]">
              請先從左側挑選一位學生，即可檢視並管理他的學習進度與作答紀錄。
            </div>
          ) : (
            <div className="synth-panel-hard overflow-hidden">
              <div className="h-2 w-full bg-[#007A5B]" />
              <div className="p-5 sm:p-6 space-y-6">
                {/* Student Identity Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D4DAE4] pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-[#11151C]">
                        {progress.student.display_name}
                      </h2>
                      <span className="rounded bg-[#161A22] px-2.5 py-0.5 font-code text-xs font-bold text-[#00E5A0]">
                        {progress.student.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {progress.student.classes.map((c) => (
                        <span
                          key={c.id}
                          className="rounded bg-[#E6F7F2] px-2 py-0.5 font-bold text-[#007A5B]"
                        >
                          {c.name} ({c.join_code})
                        </span>
                      ))}
                      {progress.student.other_teacher_class_count > 0 && (
                        <span className="rounded bg-[#FFF6E0] px-2 py-0.5 font-bold text-[#9A5800]">
                          同時修習他師 {progress.student.other_teacher_class_count} 個班級
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeSummary && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditForm(activeSummary)}
                          className="synth-pad inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                        >
                          <KeyRound className="h-3.5 w-3.5" strokeWidth={2} />
                          <span>編輯／重設密碼</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionBusy}
                          onClick={() => handleDeleteStudent(activeSummary)}
                          className="synth-pad inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#C62828] hover:bg-[#FDECEC] disabled:opacity-45"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          <span>刪除</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Recessed OLED KPI Telemetry */}
                <div className="synth-oled grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 sm:divide-x sm:divide-[#262F3F]">
                  <div className="sm:pr-3">
                    <div className="font-display text-2xl font-bold text-[#00E5A0] tabular-nums">
                      {progress.stats.uniqueSolved}/{progress.stats.totalQuestions}
                    </div>
                    <div className="mt-0.5 text-[11px] font-bold text-[#A8B6CC]">
                      已破關題數
                    </div>
                  </div>
                  <div className="sm:px-3">
                    <div className="font-display text-2xl font-bold text-white tabular-nums">
                      {progress.stats.totalAttempts}
                    </div>
                    <div className="mt-0.5 text-[11px] font-bold text-[#A8B6CC]">
                      累計作答次數
                    </div>
                  </div>
                  <div className="sm:px-3">
                    <div className="font-display text-2xl font-bold text-[#38BDF8] tabular-nums">
                      {progress.stats.accuracy !== null
                        ? `${progress.stats.accuracy}%`
                        : "—"}
                    </div>
                    <div className="mt-0.5 text-[11px] font-bold text-[#A8B6CC]">
                      作答正確率
                    </div>
                  </div>
                  <div className="sm:pl-3">
                    <div className="font-display text-2xl font-bold text-[#FFB800] tabular-nums">
                      {progress.stats.avgDurationSec > 0
                        ? `${progress.stats.avgDurationSec}s`
                        : "—"}
                    </div>
                    <div className="mt-0.5 text-[11px] font-bold text-[#A8B6CC]">
                      平均思考耗時
                    </div>
                  </div>
                </div>

                {/* 5-Module Progress Bars + Per-Module Reset */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-[#11151C]">
                      五大模組破關進度管理
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actionBusy || progress.stats.totalAttempts === 0}
                        onClick={() =>
                          runProgressAction(
                            { action: "reset_wrong" },
                            `確定要清除「${progress.student.display_name}」的所有答錯紀錄嗎？`,
                            "已清除所有答錯作答紀錄。"
                          )
                        }
                        className="synth-pad px-2.5 py-1 text-[11px] font-bold disabled:opacity-40"
                      >
                        僅清除錯題紀錄
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy || progress.stats.totalAttempts === 0}
                        onClick={() =>
                          runProgressAction(
                            { action: "reset_all" },
                            `確定要將「${progress.student.display_name}」的學習進度全部歸零嗎？此操作無法復原。`,
                            "已將學生全部學習進度歸零。"
                          )
                        }
                        className="synth-pad px-2.5 py-1 text-[11px] font-bold text-[#C62828] hover:bg-[#FDECEC] disabled:opacity-40"
                      >
                        全部進度歸零
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {progress.topicMastery.map((t, idx) => {
                      const theme = getTopicTheme(t.slug, idx);
                      const pct =
                        t.totalQuestions > 0
                          ? Math.round((t.solvedCorrect / t.totalQuestions) * 100)
                          : 0;
                      const hasData = t.attemptedDistinct > 0 || t.solvedCorrect > 0;
                      return (
                        <div
                          key={t.topicId}
                          className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-3 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-bold text-[#11151C]">
                              <span
                                className="rounded px-1.5 py-0.5 font-display text-[10px] font-bold text-white"
                                style={{ backgroundColor: theme.buttonBg }}
                              >
                                {theme.code}
                              </span>
                              <span>{t.title}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-code text-[#4B5565] tabular-nums">
                                {t.solvedCorrect}/{t.totalQuestions}
                                {t.accuracy !== null ? ` · ${t.accuracy}%` : ""}
                              </span>
                              <button
                                type="button"
                                disabled={actionBusy || !hasData}
                                onClick={() =>
                                  runProgressAction(
                                    { action: "reset_topic", topicId: t.topicId },
                                    `確定要重設「${progress.student.display_name}」在「${t.title}」的作答進度嗎？`,
                                    `已重設「${t.title}」單元進度。`
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded border border-[#C4CBD6] bg-white px-2 py-0.5 text-[11px] font-bold text-[#4B5565] hover:border-[#161A22] hover:text-[#11151C] disabled:opacity-40"
                              >
                                <RotateCcw className="h-3 w-3" strokeWidth={2} />
                                <span>重設單元</span>
                              </button>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#DDE2EA]">
                            <div
                              style={{ width: `${pct}%`, backgroundColor: theme.hex }}
                              className="h-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Single Question Manual Mark / Clear Control */}
                <div className="synth-recess p-4 space-y-2.5">
                  <div className="text-xs font-black text-[#11151C]">
                    單題進度手動調校（可幫學生補標通過或重置單題）
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={manualQId}
                      onChange={(e) => setManualQId(Number(e.target.value))}
                      className="flex-1 min-w-[200px] rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-2 text-xs font-medium text-[#11151C]"
                    >
                      {progress.availableQuestions.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.official_ref ?? `#${q.id}`}] {q.title}（
                          {q.is_solved ? "已通過" : `未過 · ${q.attempt_count}次`}）
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={actionBusy || !manualQId}
                      onClick={() =>
                        runProgressAction(
                          {
                            action: "mark_question",
                            questionId: manualQId,
                            status: "passed",
                          },
                          undefined,
                          "已將該題手動標記為「已通過」。"
                        )
                      }
                      className="synth-pad-emerald px-3 py-2 text-xs font-bold disabled:opacity-45"
                    >
                      標記通過
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy || !manualQId}
                      onClick={() =>
                        runProgressAction(
                          {
                            action: "mark_question",
                            questionId: manualQId,
                            status: "clear",
                          },
                          undefined,
                          "已清除該題所有作答紀錄。"
                        )
                      }
                      className="synth-pad px-3 py-2 text-xs font-bold disabled:opacity-45"
                    >
                      清除此題
                    </button>
                  </div>
                </div>

                {/* Class Assignments Progress */}
                {progress.assignments.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-black text-[#11151C]">
                      班級作業完成進度
                    </h3>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {progress.assignments.map((a) => (
                        <div
                          key={a.id}
                          className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#007A5B]">
                              {a.class_name}
                            </span>
                            <span className="font-code font-bold text-[#11151C] tabular-nums">
                              {a.completed_count}/{a.question_count}（對 {a.correct_count}）
                            </span>
                          </div>
                          <div className="font-bold text-[#11151C]">{a.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Attempt History with Delete Button */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-black text-[#11151C]">
                    最近作答歷史紀錄（最新 {progress.recentAttempts.length} 筆）
                  </h3>

                  {progress.recentAttempts.length === 0 ? (
                    <div className="synth-recess p-4 text-xs text-[#4B5565]">
                      目前尚無任何作答紀錄。
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-[#C4CBD6]">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#161A22] text-white">
                            <th className="px-3 py-2 text-left font-bold">題目</th>
                            <th className="px-2 py-2 text-left font-bold">考法</th>
                            <th className="px-2 py-2 text-center font-bold">作答 / 正解</th>
                            <th className="px-2 py-2 text-center font-bold">結果</th>
                            <th className="px-3 py-2 text-right font-bold">管理</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D4DAE4] bg-white">
                          {progress.recentAttempts.map((att) => (
                            <tr key={att.id}>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  {att.official_ref && (
                                    <span className="rounded bg-[#161A22] px-1.5 py-0.5 font-code text-[10px] font-bold text-white">
                                      {att.official_ref}
                                    </span>
                                  )}
                                  <span className="font-bold text-[#11151C]">
                                    {att.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-2 text-[#4B5565]">
                                {QUESTION_TYPE_LABELS[att.question_type]}
                              </td>
                              <td className="px-2 py-2 text-center font-code tabular-nums">
                                <span className="font-bold text-[#11151C]">
                                  {att.selected_option}
                                </span>{" "}
                                / {att.correct_option}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                    att.is_correct
                                      ? "bg-[#E6FAF3] text-[#007A57]"
                                      : "bg-[#FDECEC] text-[#C62828]"
                                  }`}
                                >
                                  {att.is_correct ? "通過" : "答錯"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  disabled={actionBusy}
                                  onClick={() =>
                                    runProgressAction(
                                      { action: "delete_attempt", attemptId: att.id },
                                      undefined,
                                      "已刪除該筆作答紀錄。"
                                    )
                                  }
                                  className="rounded border border-[#C4CBD6] bg-white px-2 py-0.5 text-[11px] font-bold text-[#C62828] hover:bg-[#FDECEC] disabled:opacity-45"
                                >
                                  刪除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
