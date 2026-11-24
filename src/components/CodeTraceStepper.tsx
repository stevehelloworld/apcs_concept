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
  title = "單步執行追蹤器",
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
      <div className="synth-panel p-4 text-sm text-[#4B5565]">
        此題尚未建立單步追蹤快照，請參考上方完整解題步驟。
      </div>
    );
  }

  const current = steps[stepIdx] ?? steps[0];
  const prev = stepIdx > 0 ? steps[stepIdx - 1] : null;
  const varEntries = Object.entries(current.vars ?? {});

  return (
    <div className="synth-panel-hard p-4 sm:p-5 space-y-4">
      {/* Instrument Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C4CBD6] pb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              playing ? "bg-[#00C48C]" : "bg-[#FF4F17]"
            }`}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-[#11151C]">{title}</h3>
            <div className="mt-0.5 flex items-center gap-2 font-code text-[11px] text-[#4B5565] tabular-nums">
              <span className="rounded bg-[#161A22] px-1.5 py-0.5 text-white">
                STEP {String(stepIdx + 1).padStart(2, "0")}/
                {String(steps.length).padStart(2, "0")}
              </span>
              <span>LINE {current.line}</span>
            </div>
          </div>
        </div>

        {/* Transport Keys */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            disabled={stepIdx === 0 && !playing}
            title="重設到第 1 步"
            className="synth-pad inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
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
            className="synth-pad inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
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
            className="synth-pad-orange inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>暫停</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                <span>自動播放</span>
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
            className="synth-pad inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
          >
            <span>下一步</span>
            <SkipForward className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Live Tactile Step Scrubber */}
      {steps.length > 1 && (
        <div className="synth-recess px-3.5 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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
                  className={`h-6 min-w-[28px] rounded-md px-1.5 font-code text-[11px] font-bold tabular-nums ui-transition ${
                    active
                      ? "bg-[#161A22] text-white ring-2 ring-[#FF4F17]"
                      : passed
                      ? "bg-white text-[#11151C] border border-[#161A22]"
                      : "bg-[#EEF1F5] text-[#4B5565] border border-[#B9C2D0] hover:bg-white"
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
            className="synth-slider flex-1"
          />
        </div>
      )}

      {/* Split OLED Monitor + Telemetry Bay */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PythonCodeView
            code={code}
            activeLine={current.line}
            caption={`ACTIVE // 第 ${current.line} 行`}
            compact
          />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5">
          {/* Step Signal Annotation */}
          <div className="rounded-xl border-[1.5px] border-[#FFBCA6] bg-[#FFF1EC] p-3.5">
            <div className="mb-1 flex items-center gap-1.5 font-display text-[11px] font-bold text-[#B83006]">
              <span className="h-2 w-2 rounded-full bg-[#FF4F17]" />
              <span>SIGNAL NOTE · 執行解說</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-[#11151C]">
              {current.note}
            </p>
          </div>

          {/* OLED Variable Registers */}
          <div className="synth-oled p-3.5">
            <div className="mb-2 flex items-center justify-between font-code text-[11px] text-[#94A3B8]">
              <span>VARS // 變數即時暫存器</span>
              <span className="text-[#FFB800]">Δ 標示本步變動</span>
            </div>
            {varEntries.length === 0 ? (
              <p className="font-code text-xs text-[#7A8AA3]">(此步驟無變數異動)</p>
            ) : (
              <div className="divide-y divide-[#1E2533] rounded-lg border border-[#262F3F] bg-[#121720]">
                {varEntries.map(([name, val]) => {
                  const formatted = formatVarValue(val);
                  const changed =
                    prev !== null &&
                    formatVarValue(prev.vars?.[name]) !== formatted;
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between px-3 py-1.5 font-code text-xs ${
                        changed ? "bg-[#FFB800]/12" : ""
                      }`}
                    >
                      <span className="font-medium text-[#E6EDF7]">{name}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 tabular-nums ${
                          changed
                            ? "font-bold text-[#FFB800]"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {changed && (
                          <span className="rounded bg-[#FFB800]/20 px-1 text-[10px]">
                            Δ
                          </span>
                        )}
                        {formatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Stack Bay if present */}
          {current.stack && current.stack.length > 0 && (
            <div className="synth-recess p-3">
              <div className="mb-2 font-code text-[11px] font-bold text-[#4B5565]">
                CALL STACK // 呼叫堆疊
              </div>
              <div className="flex flex-col-reverse gap-1.5">
                {current.stack.map((frame, i) => {
                  const isTop = i === current.stack!.length - 1;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 font-code text-xs ${
                        isTop
                          ? "border-[#161A22] bg-[#161A22] font-bold text-white"
                          : "border-[#C4CBD6] bg-white text-[#4B5565]"
                      }`}
                    >
                      <span>{frame}</span>
                      {isTop && (
                        <span className="rounded bg-[#FF4F17] px-1.5 py-0.5 text-[10px] text-white">
                          TOP
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Output Terminal if present */}
          {current.output !== undefined && (
            <div className="synth-oled p-3.5">
              <div className="mb-1 font-code text-[11px] text-[#7A8AA3]">
                STDOUT // 螢幕輸出監視器
              </div>
              <pre className="font-code text-xs font-semibold leading-relaxed text-[#00E5A0] whitespace-pre-wrap">
                {current.output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
