"use client";

import { useState } from "react";
import { CopyPlus, Edit3, Eye, EyeOff, Plus, Save, Trash2, X } from "lucide-react";
import type {
  ClassRecord,
  Difficulty,
  OptionItem,
  QuestionRecord,
  QuestionType,
  TopicRecord,
} from "@/lib/types";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";
import { PythonCodeView } from "../PythonCodeView";

interface TeacherQuestionsClientProps {
  initialQuestions: QuestionRecord[];
  topics: TopicRecord[];
  classes: ClassRecord[];
}

function makeEmptyQuestion(defaultTopicId: number) {
  return {
    id: null as number | null,
    topic_id: defaultTopicId,
    official_ref: "",
    title: "",
    prompt: "",
    code: "x = 0\nfor i in range(5):\n    x += i\nprint(x)",
    question_type: "trace" as QuestionType,
    difficulty: "basic" as Difficulty,
    correct_option: "A" as "A" | "B" | "C" | "D",
    options: [
      { key: "A" as const, text: "", misconception: "" },
      { key: "B" as const, text: "", misconception: "" },
      { key: "C" as const, text: "", misconception: "" },
      { key: "D" as const, text: "", misconception: "" },
    ] as OptionItem[],
    explanation: "",
    class_id: "" as string,
    is_published: true,
    isOfficialSeed: false,
  };
}

export function TeacherQuestionsClient({
  initialQuestions,
  topics,
  classes,
}: TeacherQuestionsClientProps) {
  const [questions, setQuestions] = useState<QuestionRecord[]>(initialQuestions);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<
    "all" | "official" | "mock" | "custom"
  >("all");
  const [editing, setEditing] = useState<ReturnType<typeof makeEmptyQuestion> | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = questions.filter((q) => {
    if (topicFilter !== "all" && String(q.topic_id) !== topicFilter) return false;
    const isMock = q.created_by === null && Boolean(q.official_ref?.startsWith("SIM-"));
    const isOfficial = q.created_by === null && !isMock;
    if (scopeFilter === "official" && !isOfficial) return false;
    if (scopeFilter === "mock" && !isMock) return false;
    if (scopeFilter === "custom" && q.created_by === null) return false;
    return true;
  });

  function startEdit(q: QuestionRecord) {
    setError(null);
    setFeedback(null);
    setEditing({
      id: q.id,
      topic_id: q.topic_id,
      official_ref: q.official_ref ?? "",
      title: q.title,
      prompt: q.prompt,
      code: q.code,
      question_type: q.question_type,
      difficulty: q.difficulty,
      correct_option: q.correct_option,
      options: q.options.map((o) => ({ ...o })),
      explanation: q.explanation,
      class_id: q.class_id ? String(q.class_id) : "",
      is_published: q.is_published,
      isOfficialSeed: q.created_by === null,
    });
  }

  function startClone(q: QuestionRecord) {
    setError(null);
    setFeedback(null);
    setEditing({
      id: null,
      topic_id: q.topic_id,
      official_ref: q.official_ref ? `${q.official_ref}-變體` : "",
      title: `${q.title}（改編）`,
      prompt: q.prompt,
      code: q.code,
      question_type: q.question_type,
      difficulty: q.difficulty,
      correct_option: q.correct_option,
      options: q.options.map((o) => ({ ...o })),
      explanation: q.explanation,
      class_id: classes[0] ? String(classes[0].id) : "",
      is_published: true,
      isOfficialSeed: false,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    setFeedback(null);

    const payload = {
      topic_id: editing.topic_id,
      official_ref: editing.official_ref.trim() || null,
      title: editing.title,
      prompt: editing.prompt,
      code: editing.code,
      question_type: editing.question_type,
      difficulty: editing.difficulty,
      options: editing.options,
      correct_option: editing.correct_option,
      explanation: editing.explanation,
      class_id: editing.class_id ? Number(editing.class_id) : null,
      is_published: editing.is_published,
    };

    try {
      const isNew = editing.id === null;
      const res = await fetch(
        isNew ? "/api/teacher/questions" : `/api/teacher/questions/${editing.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "儲存失敗");
        return;
      }

      const saved = json.question as QuestionRecord;
      if (isNew) {
        setQuestions((prev) => [...prev, saved]);
        setFeedback("已新增題目");
      } else {
        setQuestions((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
        setFeedback("已更新題目");
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublish(q: QuestionRecord) {
    const res = await fetch(`/api/teacher/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !q.is_published }),
    });
    if (res.ok) {
      const json = await res.json();
      setQuestions((prev) => prev.map((x) => (x.id === q.id ? json.question : x)));
    }
  }

  async function handleDelete(q: QuestionRecord) {
    if (!confirm(`確定刪除「${q.title}」？`)) return;
    const res = await fetch(`/api/teacher/questions/${q.id}`, { method: "DELETE" });
    if (res.ok) {
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
    } else {
      const json = await res.json();
      setError(json.error ?? "無法刪除題目");
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
            題庫管理
          </h1>
          <span className="font-code text-xs text-[#7E91B8] tabular-nums">
            {filtered.length} 題
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(makeEmptyQuestion(topics[0]?.id ?? 1));
          }}
          className="rail-btn-green inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span>新增自訂題</span>
        </button>
      </header>

      {feedback && (
        <div className="rounded border border-[#22B14C]/55 bg-[#22B14C]/15 px-3.5 py-2 text-xs font-bold text-[#4ADE80]">
          {feedback}
        </div>
      )}
      {error && !editing && (
        <div className="rounded border border-[#E21D2D]/55 bg-[#E21D2D]/15 px-3.5 py-2 text-xs font-bold text-[#FF7A85]">
          {error}
        </div>
      )}

      {/* Editor Panel */}
      {editing && (
        <form onSubmit={handleSave} className="rail-frame p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h2 className="text-base font-black text-[#4ADE80]">
              {editing.id ? `編輯題目 #${editing.id}` : "新增題目"}
            </h2>
            <button type="button" onClick={() => setEditing(null)} className="rail-btn p-1">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">路線</span>
              <select
                value={editing.topic_id}
                onChange={(e) =>
                  setEditing({ ...editing, topic_id: Number(e.target.value) })
                }
                className="rail-input w-full px-2.5 py-1.5 text-xs"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">題型</span>
              <select
                value={editing.question_type}
                onChange={(e) =>
                  setEditing({ ...editing, question_type: e.target.value as QuestionType })
                }
                className="rail-input w-full px-2.5 py-1.5 text-xs"
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((qt) => (
                  <option key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">難度</span>
              <select
                value={editing.difficulty}
                onChange={(e) =>
                  setEditing({ ...editing, difficulty: e.target.value as Difficulty })
                }
                className="rail-input w-full px-2.5 py-1.5 text-xs"
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">可見範圍</span>
              <select
                value={editing.class_id}
                onChange={(e) => setEditing({ ...editing, class_id: e.target.value })}
                className="rail-input w-full px-2.5 py-1.5 text-xs"
              >
                <option value="">全體公開</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    班級專屬：{c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="text-xs sm:col-span-3">
              <span className="mb-1 block font-bold text-[#B8C5E0]">標題</span>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="題目標題"
                className="rail-input w-full px-3 py-1.5 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">編號</span>
              <input
                type="text"
                value={editing.official_ref}
                onChange={(e) => setEditing({ ...editing, official_ref: e.target.value })}
                placeholder="CUSTOM-01"
                className="rail-input w-full px-3 py-1.5 font-code text-xs"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">題幹</span>
                <textarea
                  required
                  rows={4}
                  value={editing.prompt}
                  onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
                  className="rail-input w-full p-2.5 text-xs"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-bold text-[#B8C5E0]">Python 程式碼</span>
                <textarea
                  required
                  rows={7}
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="rail-input w-full p-2.5 font-code text-xs"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="font-code text-[11px] font-bold text-[#7E91B8]">預覽</div>
              <PythonCodeView code={editing.code} compact />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#B8C5E0]">選項與迷思診斷</span>
              <label className="font-bold text-[#4ADE80]">
                正解：
                <select
                  value={editing.correct_option}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      correct_option: e.target.value as "A" | "B" | "C" | "D",
                    })
                  }
                  className="rail-input ml-1.5 px-2 py-0.5 font-code text-xs"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </label>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2">
              {editing.options.map((opt, idx) => (
                <div
                  key={opt.key}
                  className={`rounded border p-2.5 space-y-1.5 ${
                    editing.correct_option === opt.key
                      ? "border-[#22B14C] bg-[#22B14C]/12"
                      : "border-white/15 bg-[#070C22]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-code text-xs font-bold text-white">
                      ({opt.key})
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const next = [...editing.options];
                        next[idx] = { ...opt, text: e.target.value };
                        setEditing({ ...editing, options: next });
                      }}
                      placeholder={`選項 ${opt.key}`}
                      className="rail-input flex-1 px-2 py-1 font-code text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={opt.misconception}
                    onChange={(e) => {
                      const next = [...editing.options];
                      next[idx] = { ...opt, misconception: e.target.value };
                      setEditing({ ...editing, options: next });
                    }}
                    placeholder="迷思診斷回饋"
                    className="rail-input w-full px-2 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="block text-xs">
            <span className="mb-1 block font-bold text-[#B8C5E0]">詳解</span>
            <textarea
              required
              rows={3}
              value={editing.explanation}
              onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
              className="rail-input w-full p-2.5 text-xs"
            />
          </label>

          {error && <p className="text-xs font-bold text-[#FF7A85]">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-white/15 pt-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rail-btn px-3.5 py-1.5 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rail-btn-green inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{saving ? "儲存中" : "儲存"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <select
          aria-label="篩選路線"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="rail-input px-3 py-1.5 font-bold"
        >
          <option value="all">全部路線 ({questions.length})</option>
          {topics.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.title}
            </option>
          ))}
        </select>

        <div className="rail-well flex flex-wrap gap-1 p-0.5">
          {[
            { key: "all", label: "全部" },
            { key: "official", label: "官方 0915" },
            { key: "mock", label: "原創模擬" },
            { key: "custom", label: "自建題" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setScopeFilter(
                  item.key as "all" | "official" | "mock" | "custom"
                )
              }
              className={`rounded px-2.5 py-1 font-bold ui-transition ${
                scopeFilter === item.key
                  ? item.key === "mock"
                    ? "bg-[#1E5BFF] text-white"
                    : "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable */}
      <div className="rail-frame overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/15 bg-[#070C22] text-[#B8C5E0]">
              <th className="px-3.5 py-2.5 text-left font-bold">編號 / 標題</th>
              <th className="px-3 py-2.5 text-left font-bold">路線</th>
              <th className="px-3 py-2.5 text-left font-bold">題型</th>
              <th className="px-3 py-2.5 text-left font-bold">範圍</th>
              <th className="px-3 py-2.5 text-center font-bold">正解</th>
              <th className="px-3 py-2.5 text-center font-bold">狀態</th>
              <th className="px-3.5 py-2.5 text-right font-bold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((q) => (
              <tr key={q.id} className="hover:bg-white/[0.03]">
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-code text-[11px] font-bold ${
                        q.official_ref?.startsWith("SIM-")
                          ? "border border-[#1E5BFF]/50 bg-[#1E5BFF]/22 text-[#7AA4FF]"
                          : "bg-white text-[#0B1230]"
                      }`}
                    >
                      {q.official_ref ?? `#${q.id}`}
                    </span>
                    <span className="font-bold text-white">{q.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[#B8C5E0]">{q.topic_title}</td>
                <td className="px-3 py-2.5 text-[#B8C5E0]">
                  {QUESTION_TYPE_LABELS[q.question_type]}
                </td>
                <td className="px-3 py-2.5">
                  {q.class_name ? (
                    <span className="font-bold text-[#4ADE80]">{q.class_name}</span>
                  ) : (
                    <span className="text-[#7E91B8]">公開</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center font-code font-bold text-white">
                  {q.correct_option}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(q)}
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-bold ${
                      q.is_published
                        ? "bg-[#22B14C]/18 text-[#4ADE80]"
                        : "bg-white/10 text-[#7E91B8]"
                    }`}
                  >
                    {q.is_published ? (
                      <>
                        <Eye className="h-3 w-3" strokeWidth={2} />
                        <span>公開</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" strokeWidth={2} />
                        <span>草稿</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startClone(q)}
                      title="複製改編"
                      className="rail-btn p-1 text-[#B8C5E0] hover:text-white"
                    >
                      <CopyPlus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      title="編輯"
                      className="rail-btn p-1 text-[#B8C5E0] hover:text-[#4ADE80]"
                    >
                      <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    {q.created_by !== null && (
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        title="刪除"
                        className="rail-btn p-1 text-[#FF7A85]"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
