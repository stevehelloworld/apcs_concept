"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Maximize2,
  Minimize2,
  Moon,
  Search,
  Sun,
  Type,
  X,
} from "lucide-react";
import { getTopicTheme } from "@/lib/topic-theme";
import type { PublicQuestionRecord } from "@/lib/types";

interface ClassroomQuickJumpProps {
  open: boolean;
  onClose: () => void;
  themeMode: "dark" | "bright";
  onToggleTheme: () => void;
  scaleMode: "standard" | "large";
  onToggleScale: () => void;
}

const ROUTES = [
  { slug: "control-flow", title: "流程控制與邏輯運算" },
  { slug: "loops-range", title: "迴圈追蹤與執行次數" },
  { slug: "lists-grid", title: "串列結構與二維矩陣" },
  { slug: "functions-recursion", title: "函式模組與遞迴思維" },
  { slug: "algorithms-complexity", title: "演算法設計與效能分析" },
];

const STAGES = [
  { key: "recon", label: "1勘查" },
  { key: "concepts", label: "2觀念" },
  { key: "pitfalls", label: "3地雷" },
  { key: "practice", label: "4實戰" },
];

export function ClassroomQuickJump({
  open,
  onClose,
  themeMode,
  onToggleTheme,
  scaleMode,
  onToggleScale,
}: ClassroomQuickJumpProps) {
  const [questions, setQuestions] = useState<PublicQuestionRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    let active = true;
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setQuestions((d.questions ?? []) as PublicQuestionRecord[]);
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [open, loaded]);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const matchedQuestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return questions.slice(0, 10);
    return questions
      .filter(
        (item) =>
          (item.official_ref ?? "").toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          (item.topic_title ?? "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [questions, query]);

  async function handleToggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen browser restrictions
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex justify-end bg-black/55 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="課堂速跳控制台"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rail-frame h-full w-full max-w-md rounded-none border-l border-white/25 bg-[#0B1230] p-4 sm:p-5 overflow-y-auto space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#1E5BFF] px-2 py-0.5 font-code text-[11px] font-bold text-white">
              Shift+G
            </span>
            <h2 className="text-base font-black text-white">課堂投影速跳台</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉速跳台"
            className="rail-btn p-1.5"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Display Controls */}
        <section className="space-y-2">
          <div className="font-code text-xs font-bold text-[#7E91B8]">
            投影顯示設定
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="rail-btn flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-bold"
            >
              {themeMode === "bright" ? (
                <Moon className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Sun className="h-4 w-4 text-[#FFC20E]" strokeWidth={2} />
              )}
              <span>{themeMode === "bright" ? "切換深藍" : "明亮白底"}</span>
            </button>

            <button
              type="button"
              onClick={onToggleScale}
              data-scale-toggle="true"
              className="rail-btn flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-bold"
            >
              <Type className="h-4 w-4" strokeWidth={2} />
              <span>{scaleMode === "large" ? "標準字體" : "投影大字"}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="rail-btn flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-bold"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Maximize2 className="h-4 w-4" strokeWidth={2} />
              )}
              <span>{isFullscreen ? "退出全螢幕" : "全螢幕"}</span>
            </button>
          </div>
        </section>

        {/* 5 Routes × 4 Stage Direct Teleport */}
        <section className="space-y-2">
          <div className="font-code text-xs font-bold text-[#7E91B8]">
            五大路線直達階段
          </div>
          <div className="space-y-2">
            {ROUTES.map((r, idx) => {
              const theme = getTopicTheme(r.slug, idx);
              return (
                <div key={r.slug} className="rail-well p-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 font-code text-[11px] font-bold shrink-0"
                      style={{
                        backgroundColor: theme.hex,
                        color: theme.buttonText,
                      }}
                    >
                      {theme.code}
                    </span>
                    <span className="truncate text-xs font-bold text-white">
                      {r.title}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {STAGES.map((st) => (
                      <Link
                        key={st.key}
                        href={`/topics/${r.slug}?stage=${st.key}`}
                        onClick={onClose}
                        className="rail-btn py-1 text-center font-code text-[11px] font-bold"
                      >
                        {st.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Question Quick Search */}
        <section className="space-y-2">
          <div className="font-code text-xs font-bold text-[#7E91B8]">
            題號速跳（官方 Q1–Q30 / 模擬 SIM-01–20）
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#7E91B8]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="輸入 Q8、SIM-14 或關鍵字..."
              className="rail-input w-full pl-8 pr-3 py-1.5 text-xs font-bold"
            />
          </div>

          <div className="divide-y divide-white/10 rail-well max-h-60 overflow-y-auto">
            {!loaded ? (
              <div className="p-3 text-center text-xs text-[#7E91B8]">
                載入題庫中...
              </div>
            ) : matchedQuestions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#7E91B8]">
                找不到相符題目
              </div>
            ) : (
              matchedQuestions.map((q) => {
                const isSim = q.official_ref?.startsWith("SIM-");
                return (
                  <Link
                    key={q.id}
                    href={`/practice?qid=${q.id}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] ui-transition"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 font-code text-[11px] font-bold shrink-0 ${
                        isSim
                          ? "bg-[#1E5BFF] text-white"
                          : "bg-white text-[#0B1230]"
                      }`}
                    >
                      {q.official_ref ?? `#${q.id}`}
                    </span>
                    <span className="truncate text-xs font-bold text-white">
                      {q.title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
