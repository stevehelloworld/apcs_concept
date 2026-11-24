"use client";

import { useState } from "react";
import { Edit3, ExternalLink, Plus, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { getTopicTheme } from "@/lib/topic-theme";
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
        setMessage(`已儲存「${updated.title}」`);
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
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-wide text-white">
          路線講義 CMS
        </h1>
      </header>

      {message && (
        <div className="rounded border border-[#22B14C]/55 bg-[#22B14C]/15 px-3.5 py-2 text-xs font-bold text-[#4ADE80]">
          {message}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="rail-frame p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h2 className="text-base font-black text-[#4ADE80]">
              編輯：{editing.title}
            </h2>
            <button type="button" onClick={() => setEditing(null)} className="rail-btn p-1">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs sm:col-span-2">
              <span className="mb-1 block font-bold text-[#B8C5E0]">標題</span>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="rail-input w-full px-3 py-1.5 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">比重</span>
              <input
                type="text"
                value={editing.exam_weight}
                onChange={(e) => setEditing({ ...editing, exam_weight: e.target.value })}
                className="rail-input w-full px-3 py-1.5 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-bold text-[#B8C5E0]">分鐘</span>
              <input
                type="number"
                min={5}
                max={180}
                value={editing.study_minutes}
                onChange={(e) =>
                  setEditing({ ...editing, study_minutes: Number(e.target.value) })
                }
                className="rail-input w-full px-3 py-1.5 font-code text-xs"
              />
            </label>
          </div>

          <label className="block text-xs">
            <span className="mb-1 block font-bold text-[#B8C5E0]">副標</span>
            <input
              type="text"
              value={editing.subtitle}
              onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              className="rail-input w-full px-3 py-1.5 text-xs"
            />
          </label>

          <label className="block text-xs">
            <span className="mb-1 block font-bold text-[#B8C5E0]">摘要</span>
            <textarea
              rows={2}
              value={editing.summary}
              onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
              className="rail-input w-full p-2.5 text-xs"
            />
          </label>

          {/* Core Concepts Editor */}
          <div className="space-y-2.5 border-t border-white/15 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">核心觀念</span>
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
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#4ADE80]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>新增觀念</span>
              </button>
            </div>

            {editing.core_concepts.map((c, idx) => (
              <div key={idx} className="rail-well p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => updateConcept(idx, { title: e.target.value })}
                    placeholder="標題"
                    className="rail-input flex-1 px-2.5 py-1 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        core_concepts: editing.core_concepts.filter((_, i) => i !== idx),
                      })
                    }
                    className="rail-btn p-1 text-[#FF7A85]"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={c.summary}
                  onChange={(e) => updateConcept(idx, { summary: e.target.value })}
                  placeholder="說明"
                  className="rail-input w-full p-2 text-xs"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <textarea
                    rows={3}
                    value={c.code}
                    onChange={(e) => updateConcept(idx, { code: e.target.value })}
                    placeholder="程式碼"
                    className="rail-input p-2 font-code text-xs"
                  />
                  <textarea
                    rows={3}
                    value={c.note}
                    onChange={(e) => updateConcept(idx, { note: e.target.value })}
                    placeholder="提醒"
                    className="rail-input p-2 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pitfalls Editor */}
          <div className="space-y-2.5 border-t border-white/15 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">高頻地雷</span>
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
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#4ADE80]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                <span>新增地雷</span>
              </button>
            </div>

            {editing.pitfalls.map((p, idx) => (
              <div key={idx} className="rail-well p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => updatePitfall(idx, { title: e.target.value })}
                    placeholder="地雷標題"
                    className="rail-input flex-1 px-2.5 py-1 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={p.triggerInput}
                    onChange={(e) => updatePitfall(idx, { triggerInput: e.target.value })}
                    placeholder="觸發測資"
                    className="rail-input flex-1 px-2.5 py-1 font-code text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        pitfalls: editing.pitfalls.filter((_, i) => i !== idx),
                      })
                    }
                    className="rail-btn p-1 text-[#FF7A85]"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={p.explanation}
                  onChange={(e) => updatePitfall(idx, { explanation: e.target.value })}
                  placeholder="原因解析"
                  className="rail-input w-full p-2 text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-3">
            <label className="flex items-center gap-2 text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                className="accent-[#22B14C]"
              />
              <span>公開發佈</span>
            </label>

            <div className="flex gap-2">
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
          </div>
        </form>
      )}

      {/* Concourse List */}
      <div className="rail-frame divide-y divide-white/12">
        {topics.map((t, idx) => {
          const theme = getTopicTheme(t.slug, idx);
          return (
            <div
              key={t.id}
              className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-white/[0.03]"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="rounded px-2 py-0.5 font-code font-bold"
                    style={{
                      backgroundColor: theme.hex,
                      color: theme.buttonText,
                    }}
                  >
                    {theme.code}
                  </span>
                  <span className="text-sm font-black text-white">{t.title}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                      t.is_published
                        ? "bg-[#22B14C]/18 text-[#4ADE80]"
                        : "bg-white/10 text-[#7E91B8]"
                    }`}
                  >
                    {t.is_published ? "公開" : "草稿"}
                  </span>
                </div>
                <div className="font-code text-[11px] text-[#7E91B8] tabular-nums">
                  {t.exam_weight} · 觀念 {t.core_concepts.length} · 地雷 {t.pitfalls.length}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/topics/${t.slug}`}
                  className="rail-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>檢視</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setEditing(t)}
                  className="rail-btn-green inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>編輯</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
