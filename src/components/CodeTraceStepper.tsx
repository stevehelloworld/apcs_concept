"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import type { TraceStep } from "@/lib/types";
import { PythonCodeView } from "./PythonCodeView";

interface CodeTraceStepperProps {
  code: string;
  steps: TraceStep[];
  title?: string;
}

function formatVarValue(val: unknown): string {
  if (Array.isArray(val)) return `[${val.join(", ")}]`;
  if (typeof val === "boolean") return val ? "True" : "False";
  return String(val);
}

export function CodeTraceStepper({
  code,
  steps,
  title = "單步追蹤",
}: CodeTraceStepperProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setPlaying(false);
  }, [code, steps]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
    }, 1150);
    return () => clearTimeout(timer);
  }, [playing, stepIdx, steps.length]);

  if (!steps || steps.length === 0) {
    return (
      <div className="rail-well p-4 text-xs text-[#7E91B8]">
        此站尚無單步追蹤資料
      </div>
    );
  }

  const current = steps[stepIdx] ?? steps[0];
  const prev = stepIdx > 0 ? steps[stepIdx - 1] : null;
  const varEntries = Object.entries(current.vars ?? {});

  return (
    <div className="rail-frame p-4 space-y-3.5">
      {/* Transport Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/15 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              playing ? "bg-[#22B14C]" : "bg-[#E21D2D]"
            }`}
          />
          <h3 className="truncate text-sm font-bold text-white">{title}</h3>
          <span className="rounded bg-[#070C22] border border-white/20 px-2 py-0.5 font-code text-[11px] font-bold text-[#B8C5E0] tabular-nums shrink-0">
            {String(stepIdx + 1).padStart(2, "0")}/
            {String(steps.length).padStart(2, "0")} · L{current.line}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            disabled={stepIdx === 0 && !playing}
            className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            <span>重設</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((p) => Math.max(0, p - 1));
            }}
            disabled={stepIdx === 0}
            className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-40"
          >
            <SkipBack className="h-3.5 w-3.5" strokeWidth={2} />
            <span>上一步</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (stepIdx >= steps.length - 1) setStepIdx(0);
              setPlaying((p) => !p);
            }}
            className="rail-btn-primary inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>暫停</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                <span>播放</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((p) => Math.min(steps.length - 1, p + 1));
            }}
            disabled={stepIdx >= steps.length - 1}
            className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-40"
          >
            <span>下一步</span>
            <SkipForward className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Step Dots + Range Scrubber */}
      {steps.length > 1 && (
        <div className="rail-well px-3 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-1">
            {steps.map((_, i) => {
              const active = i === stepIdx;
              const passed = i < stepIdx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setStepIdx(i);
                  }}
                  aria-label={`跳至第 ${i + 1} 步`}
                  className={`h-6 min-w-[26px] rounded px-1.5 font-code text-[11px] font-bold tabular-nums ui-transition ${
                    active
                      ? "bg-[#E21D2D] text-white"
                      : passed
                      ? "bg-white text-[#0B1230]"
                      : "border border-white/20 text-[#B8C5E0] hover:text-white"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={stepIdx}
            onChange={(e) => {
              setPlaying(false);
              setStepIdx(Number(e.target.value));
            }}
            aria-label="單步執行進度滑桿"
            className="rail-slider flex-1"
          />
        </div>
      )}

      {/* Code & Registers Split */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PythonCodeView
            code={code}
            activeLine={current.line}
            caption={`LINE ${current.line}`}
            compact
          />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="rail-plate p-3">
            <p className="text-xs font-medium leading-relaxed text-white">
              {current.note}
            </p>
          </div>

          <div className="rail-well p-3 space-y-2">
            <div className="flex items-center justify-between font-code text-[11px] text-[#7E91B8]">
              <span>VARS</span>
              <span className="text-[#FFD452]">Δ 變動</span>
            </div>
            {varEntries.length === 0 ? (
              <p className="font-code text-xs text-[#7E91B8]">(無變數異動)</p>
            ) : (
              <div className="divide-y divide-white/10">
                {varEntries.map(([name, val]) => {
                  const formatted = formatVarValue(val);
                  const changed =
                    prev !== null &&
                    formatVarValue(prev.vars?.[name]) !== formatted;
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between py-1.5 px-1.5 font-code text-xs ${
                        changed ? "bg-[#FFC20E]/12 rounded" : ""
                      }`}
                    >
                      <span className="font-medium text-white">{name}</span>
                      <span
                        className={`inline-flex items-center gap-1 tabular-nums ${
                          changed ? "font-bold text-[#FFD452]" : "text-[#B8C5E0]"
                        }`}
                      >
                        {changed && <span className="text-[10px]">Δ</span>}
                        {formatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {current.stack && current.stack.length > 0 && (
            <div className="rail-well p-3 space-y-1.5">
              <div className="font-code text-[11px] font-bold text-[#7E91B8]">
                CALL STACK
              </div>
              <div className="flex flex-col-reverse gap-1">
                {current.stack.map((frame, i) => {
                  const isTop = i === current.stack!.length - 1;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded border px-2.5 py-1 font-code text-xs ${
                        isTop
                          ? "border-[#FFC20E]/60 bg-[#FFC20E]/15 font-bold text-[#FFD452]"
                          : "border-white/15 text-[#B8C5E0]"
                      }`}
                    >
                      <span>{frame}</span>
                      {isTop && <span className="text-[10px]">TOP</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {current.output !== undefined && (
            <div className="rail-well p-3">
              <div className="mb-1 font-code text-[11px] text-[#7E91B8]">
                STDOUT
              </div>
              <pre className="font-code text-xs font-semibold leading-relaxed text-[#4ADE80] whitespace-pre-wrap">
                {current.output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
