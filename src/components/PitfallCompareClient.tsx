"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { PitfallItem } from "@/lib/types";
import { PythonCodeView } from "./PythonCodeView";

interface PitfallCompareClientProps {
  pitfalls: PitfallItem[];
}

export function PitfallCompareClient({ pitfalls }: PitfallCompareClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [revealWhy, setRevealWhy] = useState(false);

  const active = pitfalls[activeIdx] ?? pitfalls[0];
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
                  setRevealWhy(false);
                }}
                className={`rounded px-2.5 py-1 text-xs font-bold ui-transition ${
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

        <span className="rounded border border-[#FFC20E]/45 bg-[#FFC20E]/12 px-2.5 py-0.5 font-code text-[11px] font-bold text-[#FFD452]">
          測資：{active.triggerInput}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-1">
          <div className="font-code text-[11px] font-bold text-[#FF7A85]">WRONG</div>
          <PythonCodeView code={active.wrongCode} compact />
        </div>
        <div className="space-y-1">
          <div className="font-code text-[11px] font-bold text-[#4ADE80]">FIXED</div>
          <PythonCodeView code={active.fixedCode} compact />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setRevealWhy((v) => !v)}
          className="rail-btn inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
        >
          {revealWhy ? (
            <>
              <EyeOff className="h-3.5 w-3.5" strokeWidth={2} />
              <span>收合原因</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" strokeWidth={2} />
              <span>點我看原因</span>
            </>
          )}
        </button>

        {revealWhy && (
          <p className="w-full rail-well p-3 text-xs leading-relaxed text-[#B8C5E0]">
            {active.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
