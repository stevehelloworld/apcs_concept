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
  const [scopeFilter, setScopeFilter] = useState<"all" | "global" | "custom">("all");
  const [editing, setEditing] = useState<ReturnType<typeof makeEmptyQuestion> | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = questions.filter((q) => {
    if (topicFilter !== "all" && String(q.topic_id) !== topicFilter) return false;
    if (scopeFilter === "global" && q.created_by !== null) return false;
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
      title: `${q.title}（改編題）`,
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
        setFeedback("已新增自訂題目。");
      } else {
        setQuestions((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
        setFeedback("已更新題目內容。");
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
    if (!confirm(`確定要刪除自訂題目「${q.title}」嗎？`)) return;
    const res = await fetch(`/api/teacher/questions/${q.id}`, { method: "DELETE" });
    if (res.ok) {
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
    } else {
      const json = await res.json();
      setError(json.error ?? "無法刪除題目");
    }
  }

  return (
    <div className="space-y-6">
      <section className="synth-panel-hard p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#11151C]">題庫與迷思 CRUD 管理</h1>
          <p className="mt-1 text-sm text-[#4B5565]">
            新增班級專屬變體題、複製官方題微調選項，並為每個錯誤選項填寫迷思診斷。
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing(makeEmptyQuestion(topics[0]?.id ?? 1));
          }}
          className="synth-pad-emerald inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          <span>新增自訂題目</span>
        </button>
      </section>

      {feedback && (
        <div className="rounded-xl border border-[#9EE7D0] bg-[#E6FAF3] px-4 py-3 text-xs font-bold text-[#007A57]">
          {feedback}
        </div>
      )}
      {error && !editing && (
        <div className="rounded-xl border border-[#F9B4B4] bg-[#FDECEC] px-4 py-3 text-xs font-bold text-[#C62828]">
          {error}
        </div>
      )}

      {/* Editor Panel */}
      {editing && (
        <form onSubmit={handleSave} className="synth-panel-hard p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#D4DAE4] pb-3">
            <h2 className="text-base font-black text-[#007A5B]">
              {editing.id ? `編輯題目 #${editing.id}` : "新增題目"}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg p-1.5 text-[#4B5565] hover:bg-[#DDE2EA]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#4B5565]">所屬主題</span>
              <select
                value={editing.topic_id}
                onChange={(e) =>
                  setEditing({ ...editing, topic_id: Number(e.target.value) })
                }
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-2 text-sm text-[#11151C]"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#4B5565]">考法題型</span>
              <select
                value={editing.question_type}
                onChange={(e) =>
                  setEditing({ ...editing, question_type: e.target.value as QuestionType })
                }
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-2 text-sm text-[#11151C]"
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((qt) => (
                  <option key={qt} value={qt}>
                    {QUESTION_TYPE_LABELS[qt]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#4B5565]">難度</span>
              <select
                value={editing.difficulty}
                onChange={(e) =>
                  setEditing({ ...editing, difficulty: e.target.value as Difficulty })
                }
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-2 text-sm text-[#11151C]"
              >
                {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#4B5565]">可見範圍</span>
              <select
                value={editing.class_id}
                onChange={(e) => setEditing({ ...editing, class_id: e.target.value })}
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-2 text-sm text-[#11151C]"
              >
                <option value="">全體公開題庫</option>
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
              <span className="mb-1 block font-bold text-[#4B5565]">題目標題</span>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="例如：負步長 range 迴圈次數變體題"
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 text-sm text-[#11151C]"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#4B5565]">參考編號（選填）</span>
              <input
                type="text"
                value={editing.official_ref}
                onChange={(e) => setEditing({ ...editing, official_ref: e.target.value })}
                placeholder="如 CUSTOM-01"
                className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3 py-2 font-code text-sm text-[#11151C]"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-xs">
                <span className="mb-1 block font-bold text-[#4B5565]">題幹敘述</span>
                <textarea
                  required
                  rows={4}
                  value={editing.prompt}
                  onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
                  className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] p-3 text-sm text-[#11151C]"
                />
              </label>

              <label className="block text-xs">
                <span className="mb-1 block font-bold text-[#4B5565]">Python 程式碼</span>
                <textarea
                  required
                  rows={7}
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="w-full rounded-xl border border-[#262F3F] bg-[#0D1117] p-3 font-code text-xs text-[#EEF2F8]"
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#4B5565]">即時程式碼預覽</div>
              <PythonCodeView code={editing.code} compact />
            </div>
          </div>

          {/* 4 Options + Correct Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4B5565]">
                四個選項與對應迷思診斷說明
              </span>
              <label className="text-xs font-bold text-[#007A5B]">
                正確答案：
                <select
                  value={editing.correct_option}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      correct_option: e.target.value as "A" | "B" | "C" | "D",
                    })
                  }
                  className="ml-1.5 rounded-lg border border-[#007A5B] bg-[#E6F7F2] px-2.5 py-1 font-code text-xs"
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
                  className={`rounded-xl border p-3 space-y-2 ${
                    editing.correct_option === opt.key
                      ? "border-[#007A57] bg-[#E6FAF3]"
                      : "border-[#C4CBD6] bg-[#F8F9FB]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-code text-xs font-bold text-[#11151C]">
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
                      placeholder={`選項 ${opt.key} 內容`}
                      className="flex-1 rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 font-code text-xs"
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
                    placeholder="學生選此項時的迷思診斷回饋（建議填寫）"
                    className="w-full rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="block text-xs">
            <span className="mb-1 block font-bold text-[#4B5565]">完整考場詳解</span>
            <textarea
              required
              rows={3}
              value={editing.explanation}
              onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
              className="w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] p-3 text-sm text-[#11151C]"
            />
          </label>

          {error && <p className="text-xs font-bold text-[#C62828]">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-[#D4DAE4] pt-4">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="synth-pad px-4 py-2 text-xs font-bold"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="synth-pad-emerald inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{saving ? "儲存中..." : "儲存題目"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="synth-panel flex flex-wrap items-center gap-3 p-3.5 text-xs">
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-1.5 text-sm font-medium text-[#11151C]"
        >
          <option value="all">全部主題 ({questions.length})</option>
          {topics.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.title}
            </option>
          ))}
        </select>

        <div className="synth-recess flex gap-1 p-1">
          {[
            { key: "all", label: "全部來源" },
            { key: "global", label: "官方範例 30 題" },
            { key: "custom", label: "教師自建／改編題" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setScopeFilter(item.key as "all" | "global" | "custom")}
              className={`rounded-lg px-3 py-1 font-bold ui-transition ${
                scopeFilter === item.key
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Question Table */}
      <div className="synth-panel-hard overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#C4CBD6] bg-[#161A22] text-white">
              <th className="px-3.5 py-2.5 text-left font-bold">編號 / 標題</th>
              <th className="px-3.5 py-2.5 text-left font-bold">主題</th>
              <th className="px-3.5 py-2.5 text-left font-bold">題型</th>
              <th className="px-3.5 py-2.5 text-left font-bold">可見範圍</th>
              <th className="px-3.5 py-2.5 text-center font-bold">答案</th>
              <th className="px-3.5 py-2.5 text-center font-bold">狀態</th>
              <th className="px-3.5 py-2.5 text-right font-bold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D4DAE4] bg-white">
            {filtered.map((q) => (
              <tr key={q.id} className="hover:bg-[#F8F9FB]">
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#161A22] px-1.5 py-0.5 font-code text-[11px] font-bold text-white">
                      {q.official_ref ?? `#${q.id}`}
                    </span>
                    <span className="font-bold text-[#11151C]">{q.title}</span>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 text-[#4B5565]">{q.topic_title}</td>
                <td className="px-3.5 py-2.5 text-[#4B5565]">
                  {QUESTION_TYPE_LABELS[q.question_type]}
                </td>
                <td className="px-3.5 py-2.5">
                  {q.class_name ? (
                    <span className="rounded bg-[#E6F7F2] px-2 py-0.5 font-bold text-[#007A5B]">
                      {q.class_name}
                    </span>
                  ) : (
                    <span className="text-[#647082]">全體公開</span>
                  )}
                </td>
                <td className="px-3.5 py-2.5 text-center font-code font-bold text-[#11151C]">
                  {q.correct_option}
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(q)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                      q.is_published
                        ? "bg-[#E6FAF3] text-[#007A57]"
                        : "bg-[#DDE2EA] text-[#4B5565]"
                    }`}
                  >
                    {q.is_published ? (
                      <>
                        <Eye className="h-3 w-3" strokeWidth={2} />
                        <span>已發佈</span>
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
                      title="複製並改編為新題"
                      className="rounded-lg border border-[#C4CBD6] bg-white p-1.5 text-[#4B5565] hover:border-[#007A5B] hover:text-[#007A5B]"
                    >
                      <CopyPlus className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      title="編輯題目"
                      className="rounded-lg border border-[#C4CBD6] bg-white p-1.5 text-[#4B5565] hover:border-[#007A5B] hover:text-[#007A5B]"
                    >
                      <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    {q.created_by !== null && (
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
                        title="刪除自訂題目"
                        className="rounded-lg border border-[#C4CBD6] bg-white p-1.5 text-[#C62828] hover:bg-[#FDECEC]"
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
