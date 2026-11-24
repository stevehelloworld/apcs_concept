"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Wrench } from "lucide-react";
import type { PitfallItem } from "@/lib/types";
import { PythonCodeView } from "./PythonCodeView";

interface PitfallCompareClientProps {
  pitfalls: PitfallItem[];
}

export function PitfallCompareClient({ pitfalls }: PitfallCompareClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealFix, setRevealFix] = useState(false);
  const [revealWhy, setRevealWhy] = useState(false);

  const active = pitfalls[activeIdx] ?? pitfalls[0];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (!revealFix) {
          setRevealFix(true);
        } else {
          setRevealWhy((v) => !v);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [revealFix]);

  if (!active) return null;

  return (
    <div className="rail-frame p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {pitfalls.map((p, idx) => {
            const selected = idx === activeIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveIdx(idx);
                  setRevealFix(false);
                  setRevealWhy(false);
                }}
                className={`rounded px-3 py-1.5 text-xs sm:text-sm font-bold ui-transition ${
                  selected
                    ? "bg-[#E21D2D] text-white"
                    : "border border-white/20 text-[#B8C5E0] hover:text-white"
                }`}
              >
                #{idx + 1} {p.title}
              </button>
            );
          })}
        </div>

        <span className="rounded border border-[#FFC20E]/45 bg-[#FFC20E]/12 px-2.5 py-1 font-code text-xs font-bold text-[#FFD452]">
          破功測資：{active.triggerInput}
        </span>
      </div>

      {/* 820px+ Split: WRONG left, Deferred FIXED right */}
      <div className="grid gap-4 min-[820px]:grid-cols-2">
        <div className="space-y-1.5 min-w-0">
          <div className="font-code text-xs font-bold text-[#FF7A85]">
            WRONG（錯誤寫法）
          </div>
          <PythonCodeView code={active.wrongCode} />
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-code text-xs font-bold text-[#4ADE80]">
              FIXED（正確修正）
            </span>
            {revealFix && (
              <button
                type="button"
                onClick={() => setRevealFix(false)}
                className="font-code text-xs text-[#7E91B8] hover:text-white"
              >
                隱藏
              </button>
            )}
          </div>

          {!revealFix ? (
            <div className="rail-plate flex min-h-[168px] flex-col items-center justify-center gap-3 p-5 text-center">
              <p className="text-sm font-bold text-[#B8C5E0]">
                先讓學生找出左側程式碼在哪一行出錯
              </p>
              <button
                type="button"
                onClick={() => setRevealFix(true)}
                className="rail-btn-green inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold"
              >
                <Wrench className="h-4 w-4" strokeWidth={2.2} />
                <span>揭曉修正寫法 [R]</span>
              </button>
            </div>
          ) : (
            <PythonCodeView code={active.fixedCode} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setRevealWhy((v) => !v)}
          className="rail-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold"
        >
          {revealWhy ? (
            <>
              <EyeOff className="h-4 w-4" strokeWidth={2} />
              <span>收合原因 [R]</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-[#FFC20E]" strokeWidth={2} />
              <span>點我看原因 [R]</span>
            </>
          )}
        </button>

        {revealWhy && (
          <p className="w-full rail-well p-3.5 text-sm leading-relaxed text-[#B8C5E0]">
            {active.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
