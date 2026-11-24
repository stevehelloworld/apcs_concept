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

  const [batchClassId, setBatchClassId] = useState<number>(() =>
    classes[0] ? Number(classes[0].id) : 0
  );
  const [batchText, setBatchText] = useState("");

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
      setErrorMsg("請至少勾選一個班級。");
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
        setSuccessMsg(`已建立「${created.display_name}」(${created.username})`);
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
          setErrorMsg(json.error ?? "更新失敗。");
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
            ? `已更新「${formDisplayName.trim()}」並重設密碼`
            : `已更新「${formDisplayName.trim()}」`
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
      setErrorMsg("請選擇班級。");
      return;
    }

    const lines = batchText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setErrorMsg("請輸入學生資料（帳號,姓名,密碼）。");
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
          failedLines.push(`${line}（欄位不足）`);
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
          failedLines.push(`${uname}：${json.error ?? "失敗"}`);
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
        setSuccessMsg(`批次建立完成（${okCount} 人）`);
      } else {
        setSuccessMsg(okCount > 0 ? `已建立 ${okCount} 人` : null);
        setErrorMsg(`失敗 ${failedLines.length} 筆：${failedLines.join(" ｜ ")}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteStudent(stu: ManagedStudentSummary) {
    if (
      !confirm(
        `確定刪除／移出「${stu.display_name} (${stu.username})」？若僅屬您管理的班級，帳號與作答紀錄將一併刪除。`
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
        setErrorMsg(json.error ?? "刪除失敗。");
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
          ? `已刪除「${stu.display_name}」`
          : `已移出「${stu.display_name}」`
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
        setErrorMsg(json.error ?? "更新進度失敗。");
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

  const activeSummary = students.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
            學生帳號與進度
          </h1>
          <span className="font-code text-xs text-[#7E91B8] tabular-nums">
            {filteredStudents.length} 人
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={classes.length === 0}
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              if (!batchClassId && classes[0]) setBatchClassId(Number(classes[0].id));
              setFormMode(formMode === "batch" ? "none" : "batch");
            }}
            className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold disabled:opacity-45"
          >
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            <span>批次匯入建帳</span>
          </button>

          <button
            type="button"
            disabled={classes.length === 0}
            onClick={openCreateForm}
            className="rail-btn-green inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold disabled:opacity-45"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span>新增學生帳號</span>
          </button>
        </div>
      </header>

      {classes.length === 0 && (
        <div className="rail-frame p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#B8C5E0]">請先建立班級</span>
          <Link href="/teacher/classes" className="rail-btn-green px-3 py-1.5 text-xs font-bold">
            建立班級 →
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded border border-[#E21D2D]/55 bg-[#E21D2D]/15 px-3.5 py-2.5 text-xs font-bold text-[#FF7A85]">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded border border-[#22B14C]/55 bg-[#22B14C]/15 px-3.5 py-2.5 text-xs font-bold text-[#4ADE80]">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search + Class Filter */}
      <div className="grid gap-2.5 sm:grid-cols-12">
        <select
          aria-label="篩選班級"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rail-input sm:col-span-4 px-3 py-2 text-xs font-bold"
        >
          <option value="all">全部班級 ({students.length} 人)</option>
          {classes.map((cls) => (
            <option key={cls.id} value={String(cls.id)}>
              {cls.name} ({cls.join_code})
            </option>
          ))}
        </select>

        <div className="relative sm:col-span-8">
          <Search
            className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#7E91B8]"
            strokeWidth={2}
          />
          <input
            type="text"
            aria-label="搜尋姓名或帳號"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名或帳號..."
            className="rail-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      {/* Master-Detail Split */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Roster Timetable */}
        <div className="lg:col-span-5 rail-frame divide-y divide-white/12 max-h-[820px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#7E91B8]">無符合學生</div>
          ) : (
            filteredStudents.map((stu) => {
              const isSelected = stu.id === selectedId;
              return (
                <div
                  key={stu.id}
                  onClick={() => selectStudent(stu.id)}
                  className={`cursor-pointer p-3.5 ui-transition ${
                    isSelected ? "bg-[#22B14C]/14" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            isSelected ? "bg-[#22B14C]" : "bg-white/35"
                          }`}
                        />
                        <span className="text-sm font-black text-white">
                          {stu.display_name}
                        </span>
                        <span className="rounded bg-[#070C22] border border-white/20 px-1.5 py-0.5 font-code text-[11px] font-bold text-[#B8C5E0]">
                          {stu.username}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pl-4">
                        {stu.classes.map((c) => (
                          <span
                            key={c.id}
                            className="font-code text-[11px] text-[#7E91B8]"
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
                        title="編輯"
                        className="rail-btn p-1.5 text-[#B8C5E0] hover:text-[#4ADE80]"
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
                        title="刪除"
                        className="rail-btn p-1.5 text-[#FF7A85] disabled:opacity-45"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pl-4 font-code text-[11px] tabular-nums text-[#B8C5E0]">
                    <span>
                      破關 {stu.solved_distinct}/{stu.total_questions}
                    </span>
                    <span>
                      {stu.total_attempts} 次 ·{" "}
                      <strong className="text-[#4ADE80]">
                        {stu.accuracy !== null ? `${stu.accuracy}%` : "—"}
                      </strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Telemetry & Progress Panel */}
        <div className="lg:col-span-7">
          {loadingProgress ? (
            <div className="rail-frame p-8 text-center text-xs text-[#7E91B8]">
              載入中...
            </div>
          ) : !progress ? (
            <div className="rail-frame p-8 text-center text-xs text-[#7E91B8]">
              選擇左側學生管理進度
            </div>
          ) : (
            <div className="rail-frame overflow-hidden">
              <div className="h-1 w-full bg-[#22B14C]" />
              <div className="p-4 sm:p-5 space-y-5">
                {/* Identity Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/15 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-white">
                        {progress.student.display_name}
                      </h2>
                      <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-code text-xs font-bold text-[#4ADE80]">
                        {progress.student.username}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-code text-[11px] text-[#B8C5E0]">
                      {progress.student.classes.map((c) => (
                        <span key={c.id}>
                          {c.name} ({c.join_code})
                        </span>
                      ))}
                      {progress.student.other_teacher_class_count > 0 && (
                        <span className="text-[#FFD452]">
                          +他師 {progress.student.other_teacher_class_count} 班
                        </span>
                      )}
                    </div>
                  </div>

                  {activeSummary && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(activeSummary)}
                        className="rail-btn inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold"
                      >
                        <KeyRound className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>編輯／重設密碼</span>
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => handleDeleteStudent(activeSummary)}
                        className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#FF7A85] disabled:opacity-45"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        <span>刪除</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 4-Column Telemetry Strip */}
                <div className="rail-well grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/12">
                  <div className="p-3">
                    <div className="font-display text-2xl font-extrabold text-[#4ADE80] tabular-nums">
                      {progress.stats.uniqueSolved}/{progress.stats.totalQuestions}
                    </div>
                    <div className="font-code text-[11px] text-[#7E91B8]">已破關題數</div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-2xl font-extrabold text-white tabular-nums">
                      {progress.stats.totalAttempts}
                    </div>
                    <div className="font-code text-[11px] text-[#7E91B8]">累計作答次數</div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-2xl font-extrabold text-[#7AA4FF] tabular-nums">
                      {progress.stats.accuracy !== null ? `${progress.stats.accuracy}%` : "—"}
                    </div>
                    <div className="font-code text-[11px] text-[#7E91B8]">作答正確率</div>
                  </div>
                  <div className="p-3">
                    <div className="font-display text-2xl font-extrabold text-[#FFD452] tabular-nums">
                      {progress.stats.avgDurationSec > 0
                        ? `${progress.stats.avgDurationSec}s`
                        : "—"}
                    </div>
                    <div className="font-code text-[11px] text-[#7E91B8]">平均耗時</div>
                  </div>
                </div>

                {/* 5-Line Progress & Reset */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-extrabold text-white">
                      路線進度
                    </h3>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={actionBusy || progress.stats.totalAttempts === 0}
                        onClick={() =>
                          runProgressAction(
                            { action: "reset_wrong" },
                            `清除「${progress.student.display_name}」所有錯題紀錄？`,
                            "已清除錯題紀錄"
                          )
                        }
                        className="rail-btn px-2.5 py-1 text-[11px] font-bold disabled:opacity-40"
                      >
                        清錯題
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy || progress.stats.totalAttempts === 0}
                        onClick={() =>
                          runProgressAction(
                            { action: "reset_all" },
                            `歸零「${progress.student.display_name}」全部進度？無法復原。`,
                            "已歸零全部進度"
                          )
                        }
                        className="rail-btn px-2.5 py-1 text-[11px] font-bold text-[#FF7A85] disabled:opacity-40"
                      >
                        全歸零
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {progress.topicMastery.map((t, idx) => {
                      const theme = getTopicTheme(t.slug, idx);
                      const pct =
                        t.totalQuestions > 0
                          ? Math.round((t.solvedCorrect / t.totalQuestions) * 100)
                          : 0;
                      const hasData = t.attemptedDistinct > 0 || t.solvedCorrect > 0;
                      return (
                        <div key={t.topicId} className="py-2 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-2 font-bold text-white">
                              <span
                                className="rounded px-1.5 py-0.5 font-code text-[10px] font-bold"
                                style={{
                                  backgroundColor: theme.hex,
                                  color: theme.buttonText,
                                }}
                              >
                                {theme.code}
                              </span>
                              <span>{t.title}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-code text-[#B8C5E0] tabular-nums">
                                {t.solvedCorrect}/{t.totalQuestions}
                                {t.accuracy !== null ? ` · ${t.accuracy}%` : ""}
                              </span>
                              <button
                                type="button"
                                disabled={actionBusy || !hasData}
                                onClick={() =>
                                  runProgressAction(
                                    { action: "reset_topic", topicId: t.topicId },
                                    `重設「${t.title}」？`,
                                    `已重設「${t.title}」`
                                  )
                                }
                                className="rail-btn inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold disabled:opacity-35"
                              >
                                <RotateCcw className="h-3 w-3" strokeWidth={2} />
                                <span>重設</span>
                              </button>
                            </div>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#070C22]">
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

                {/* Manual Single-Question Mark / Clear */}
                <div className="rail-well p-3 space-y-2">
                  <div className="font-code text-[11px] font-bold text-[#7E91B8]">
                    單題手動調校
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="選擇題目進行手動標記"
                      value={manualQId}
                      onChange={(e) => setManualQId(Number(e.target.value))}
                      className="rail-input flex-1 min-w-[180px] px-2.5 py-1.5 text-xs font-medium"
                    >
                      {progress.availableQuestions.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.official_ref ?? `#${q.id}`}] {q.title}（
                          {q.is_solved ? "過" : `未 · ${q.attempt_count}次`}）
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={actionBusy || !manualQId}
                      onClick={() =>
                        runProgressAction(
                          { action: "mark_question", questionId: manualQId, status: "passed" },
                          undefined,
                          "已標記通過"
                        )
                      }
                      className="rail-btn-green px-3 py-1.5 text-xs font-bold disabled:opacity-45"
                    >
                      標記通過
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy || !manualQId}
                      onClick={() =>
                        runProgressAction(
                          { action: "mark_question", questionId: manualQId, status: "clear" },
                          undefined,
                          "已清除此題"
                        )
                      }
                      className="rail-btn px-3 py-1.5 text-xs font-bold disabled:opacity-45"
                    >
                      清除
                    </button>
                  </div>
                </div>

                {/* Assignments */}
                {progress.assignments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-display text-sm font-extrabold text-white">
                      班級作業
                    </h3>
                    <div className="divide-y divide-white/10 rail-well px-3">
                      {progress.assignments.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-2 py-2 text-xs"
                        >
                          <div className="truncate">
                            <span className="font-bold text-[#4ADE80] mr-2">
                              {a.class_name}
                            </span>
                            <span className="font-bold text-white">{a.title}</span>
                          </div>
                          <span className="font-code text-[#B8C5E0] tabular-nums shrink-0">
                            {a.completed_count}/{a.question_count}（對 {a.correct_count}）
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Attempts Timetable */}
                <div className="space-y-2">
                  <h3 className="font-display text-sm font-extrabold text-white">
                    最近作答歷史紀錄（最新 {progress.recentAttempts.length} 筆）
                  </h3>

                  {progress.recentAttempts.length === 0 ? (
                    <div className="rail-well p-3 text-xs text-[#7E91B8]">無作答紀錄</div>
                  ) : (
                    <div className="overflow-x-auto rounded border border-white/15">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#070C22] text-[#7E91B8]">
                            <th className="px-3 py-2 text-left font-bold">題目</th>
                            <th className="px-2 py-2 text-left font-bold">題型</th>
                            <th className="px-2 py-2 text-center font-bold">作答/解</th>
                            <th className="px-2 py-2 text-center font-bold">結果</th>
                            <th className="px-3 py-2 text-right font-bold">刪除</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {progress.recentAttempts.map((att) => (
                            <tr key={att.id}>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  {att.official_ref && (
                                    <span className="rounded bg-white px-1.5 py-0.5 font-code text-[10px] font-bold text-[#0B1230]">
                                      {att.official_ref}
                                    </span>
                                  )}
                                  <span className="font-bold text-white">{att.title}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2 text-[#B8C5E0]">
                                {QUESTION_TYPE_LABELS[att.question_type]}
                              </td>
                              <td className="px-2 py-2 text-center font-code text-white tabular-nums">
                                {att.selected_option} / {att.correct_option}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span
                                  className={`font-bold ${
                                    att.is_correct ? "text-[#4ADE80]" : "text-[#FF7A85]"
                                  }`}
                                >
                                  {att.is_correct ? "通過" : "錯"}
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
                                      "已刪除紀錄"
                                    )
                                  }
                                  className="rail-btn px-2 py-0.5 text-[11px] font-bold text-[#FF7A85] disabled:opacity-45"
                                >
                                  刪
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

      {/* Create / Edit Modal */}
      {(formMode === "create" || formMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040817]/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveStudent}
            className="rail-frame w-full max-w-2xl bg-[#0B1230] p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h2 className="text-base font-black text-[#4ADE80]">
                {formMode === "create"
                  ? "建立學生帳號"
                  : `編輯：${formDisplayName || formUsername}`}
              </h2>
              <button
                type="button"
                onClick={() => setFormMode("none")}
                className="rail-btn p-1"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">登入帳號</span>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="stu_chen01"
                  className="rail-input w-full px-3 py-2 font-code text-xs"
                />
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">姓名</span>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="陳同學"
                  className="rail-input w-full px-3 py-2 text-xs"
                />
              </label>

              <label className="text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">
                  {formMode === "create" ? "初始密碼" : "重設密碼 (選填)"}
                </span>
                <input
                  type="text"
                  required={formMode === "create"}
                  minLength={formMode === "create" ? 6 : undefined}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={formMode === "create" ? "至少 6 碼" : "留空保留原密碼"}
                  className="rail-input w-full px-3 py-2 font-code text-xs"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-[#B8C5E0]">所屬班級</span>
              <div className="rail-well p-3 flex flex-wrap gap-2">
                {classes.map((cls) => {
                  const checked = formClassIds.includes(Number(cls.id));
                  return (
                    <label
                      key={cls.id}
                      className={`flex cursor-pointer items-center gap-2 rounded border px-2.5 py-1 text-xs font-bold ${
                        checked
                          ? "border-[#22B14C] bg-[#22B14C]/18 text-[#4ADE80]"
                          : "border-white/20 text-[#B8C5E0]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFormClass(Number(cls.id))}
                        className="accent-[#22B14C]"
                      />
                      <span>{cls.name}</span>
                      <span className="font-code text-[10px] opacity-75">
                        ({cls.join_code})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-[#FF7A85]">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-2 border-t border-white/15 pt-3">
              <button
                type="button"
                onClick={() => setFormMode("none")}
                className="rail-btn px-4 py-1.5 text-xs font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rail-btn-green inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>{submitting ? "儲存中" : "確認儲存"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Import Modal */}
      {formMode === "batch" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040817]/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleBatchCreate}
            className="rail-frame w-full max-w-2xl bg-[#0B1230] p-5 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <h2 className="text-base font-black text-[#4ADE80]">
                批次匯入建立學生帳號
              </h2>
              <button
                type="button"
                onClick={() => setFormMode("none")}
                className="rail-btn p-1"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-12">
              <label className="sm:col-span-4 text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">目標班級</span>
                <select
                  value={batchClassId}
                  onChange={(e) => setBatchClassId(Number(e.target.value))}
                  className="rail-input w-full px-3 py-2 text-xs font-bold"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.join_code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="sm:col-span-8 text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">
                  帳號,姓名,密碼（每行一筆）
                </span>
                <textarea
                  rows={5}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={"stu_lin01,林小華,apcs2025\nstu_chen02,陳大明,apcs2025"}
                  className="rail-input w-full p-3 font-code text-xs"
                />
              </label>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-[#FF7A85]">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-2 border-t border-white/15 pt-3">
              <button
                type="button"
                onClick={() => setFormMode("none")}
                className="rail-btn px-4 py-1.5 text-xs font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rail-btn-green inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>{submitting ? "匯入中" : "執行匯入"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
