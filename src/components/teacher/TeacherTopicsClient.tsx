"use client";

import { useState } from "react";
import { Edit3, ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import type { CoreConcept, PitfallItem, TopicRecord } from "@/lib/types";

export function TeacherTopicsClient({
  initialTopics,
}: {
  initialTopics: TopicRecord[];
}) {
  const [topics, setTopics] = useState<TopicRecord[]>(initialTopics);
  const [editing, setEditing] = useState<TopicRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/teacher/topics/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          subtitle: editing.subtitle,
          summary: editing.summary,
          exam_weight: editing.exam_weight,
          study_minutes: editing.study_minutes,
          core_concepts: editing.core_concepts,
          pitfalls: editing.pitfalls,
          is_published: editing.is_published,
        }),
      });
      const json = await res.json();
      if (res.ok && json.topic) {
        const updated = json.topic as TopicRecord;
        setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditing(null);
        setMessage(`已儲存「${updated.title}」的教學頁面內容，學生端將同步更新。`);
      }
    } finally {
      setSaving(false);
    }
  }

  function updateConcept(idx: number, patch: Partial<CoreConcept>) {
    if (!editing) return;
    const next = [...editing.core_concepts];
    next[idx] = { ...next[idx], ...patch };
    setEditing({ ...editing, core_concepts: next });
  }

  function updatePitfall(idx: number, patch: Partial<PitfallItem>) {
    if (!editing) return;
    const next = [...editing.pitfalls];
    next[idx] = { ...next[idx], ...patch };
    setEditing({ ...editing, pitfalls: next });
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E0D8] pb-4">
        <h1 className="text-2xl font-bold text-[#17191C]">五大主題教學內容 CMS</h1>
        <p className="mt-1 text-sm text-[#525866]">
          直接編修學生端各主題教學頁的核心觀念卡片、高頻地雷對照與上下架狀態。
        </p>
      </div>

      {message && (
        <div className="rounded-md border border-[#157F4B]/30 bg-[#EAF6EF] px-4 py-2.5 text-xs font-medium text-[#157F4B]">
          {message}
        </div>
      )}

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-lg border-2 border-[#0F6B5E] bg-white p-5 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-3">
            <h2 className="text-base font-bold text-[#0F6B5E]">
              編輯主題：{editing.title}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded p-1 text-[#525866] hover:bg-[#F0EFEA]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs sm:col-span-2">
              <span className="mb-1 block font-semibold text-[#525866]">主題標題</span>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">命題比重標籤</span>
              <input
                type="text"
                value={editing.exam_weight}
                onChange={(e) => setEditing({ ...editing, exam_weight: e.target.value })}
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold text-[#525866]">建議分鐘數</span>
              <input
                type="number"
                min={5}
                max={180}
                value={editing.study_minutes}
                onChange={(e) =>
                  setEditing({ ...editing, study_minutes: Number(e.target.value) })
                }
                className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 font-code text-sm"
              />
            </label>
          </div>

          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-[#525866]">副標題</span>
            <input
              type="text"
              value={editing.subtitle}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs">
            <span className="mb-1 block font-semibold text-[#525866]">單元導讀摘要</span>
            <textarea
              rows={2}
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              className="w-full rounded border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-sm"
            />
          </label>

          {/* Core Concepts Editor */}
          <div className="space-y-3 border-t border-[#E2E0D8] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#17191C]">核心觀念與 Python 備忘</span>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    core_concepts: [
                      ...editing.core_concepts,
                      { title: "", summary: "", code: "", note: "" },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 rounded border border-[#0F6B5E] px-2.5 py-1 text-xs font-medium text-[#0F6B5E]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>新增觀念卡片</span>
              </button>
            </div>

            {editing.core_concepts.map((c, idx) => (
              <div
                key={idx}
                className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => updateConcept(idx, { title: e.target.value })}
                    placeholder="觀念標題"
                    className="flex-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        core_concepts: editing.core_concepts.filter((_, i) => i !== idx),
                      })
                    }
                    className="rounded p-1 text-[#C23535] hover:bg-[#FCEEEE]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={c.summary}
                  onChange={(e) => updateConcept(idx, { summary: e.target.value })}
                  placeholder="說明內容"
                  className="w-full rounded border border-[#E2E0D8] bg-white p-2 text-xs"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea
                    rows={3}
                    value={c.code}
                    onChange={(e) => updateConcept(idx, { code: e.target.value })}
                    placeholder="示範程式碼"
                    className="rounded border border-[#E2E0D8] bg-[#141820] p-2 font-code text-xs text-[#E4E9F2]"
                  />
                  <textarea
                    rows={3}
                    value={c.note}
                    onChange={(e) => updateConcept(idx, { note: e.target.value })}
                    placeholder="考場識讀提示"
                    className="rounded border border-[#E2E0D8] bg-white p-2 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pitfalls Editor */}
          <div className="space-y-3 border-t border-[#E2E0D8] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#17191C]">高頻地雷對照項目</span>
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    pitfalls: [
                      ...editing.pitfalls,
                      {
                        title: "",
                        wrongCode: "",
                        triggerInput: "",
                        fixedCode: "",
                        explanation: "",
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 rounded border border-[#0F6B5E] px-2.5 py-1 text-xs font-medium text-[#0F6B5E]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>新增地雷案例</span>
              </button>
            </div>

            {editing.pitfalls.map((p, idx) => (
              <div
                key={idx}
                className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => updatePitfall(idx, { title: e.target.value })}
                    placeholder="地雷標題"
                    className="flex-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={p.triggerInput}
                    onChange={(e) => updatePitfall(idx, { triggerInput: e.target.value })}
                    placeholder="觸發測資"
                    className="flex-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        pitfalls: editing.pitfalls.filter((_, i) => i !== idx),
                      })
                    }
                    className="rounded p-1 text-[#C23535] hover:bg-[#FCEEEE]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={p.explanation}
                  onChange={(e) => updatePitfall(idx, { explanation: e.target.value })}
                  placeholder="原因解析"
                  className="w-full rounded border border-[#E2E0D8] bg-white p-2 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#E2E0D8] pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-[#17191C]">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                className="accent-[#0F6B5E]"
              />
              <span>公開發佈至學生端主題導覽</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border border-[#E2E0D8] px-4 py-2 text-xs font-medium text-[#525866]"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0F6B5E] px-4 py-2 text-xs font-medium text-white hover:bg-[#0B5349] disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{saving ? "儲存中..." : "儲存主題內容"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((t, idx) => (
          <div
            key={t.id}
            className="rounded-lg border border-[#E2E0D8] bg-white p-5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-code font-semibold text-[#0F6B5E]">
                  主題 {idx + 1}
                </span>
                <span className="text-[#6C7382]">{t.exam_weight}</span>
                <span
                  className={`rounded px-2 py-0.5 font-medium ${
                    t.is_published
                      ? "bg-[#EAF6EF] text-[#157F4B]"
                      : "bg-[#F0EFEA] text-[#6C7382]"
                  }`}
                >
                  {t.is_published ? "已發佈" : "草稿"}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#17191C]">{t.title}</h2>
              <p className="text-xs text-[#525866]">
                核心觀念 {t.core_concepts.length} 則 · 高頻地雷 {t.pitfalls.length} 則
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/topics/${t.slug}`}
                className="inline-flex items-center gap-1 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-medium text-[#17191C] hover:bg-[#F0EFEA]"
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>檢視頁面</span>
              </Link>
              <button
                type="button"
                onClick={() => setEditing(t)}
                className="inline-flex items-center gap-1 rounded-md bg-[#0F6B5E] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0B5349]"
              >
                <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>編輯內容</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
