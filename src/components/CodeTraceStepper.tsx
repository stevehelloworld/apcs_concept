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
      <div className="rounded-lg border border-[#E2E0D8] bg-[#F7F6F2] p-4 text-sm text-[#525866]">
        此題尚未建立單步追蹤快照，請參考上方完整解題步驟。
      </div>
    );
  }

  const current = steps[stepIdx] ?? steps[0];
  const prev = stepIdx > 0 ? steps[stepIdx - 1] : null;
  const varEntries = Object.entries(current.vars ?? {});

  return (
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#17191C]">{title}</h4>
          <p className="text-xs text-[#525866] tabular-nums">
            步驟 {stepIdx + 1} / {steps.length} · 第 {current.line} 行
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx(0);
            }}
            disabled={stepIdx === 0 && !playing}
            title="重設到第 1 步"
            className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#525866] ui-transition hover:bg-[#F0EFEA] disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>重設</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIdx((p) => Math.max(0, p - 1));
            }}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#17191C] ui-transition hover:bg-[#F0EFEA] disabled:opacity-40"
          >
            <SkipBack className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>上一步</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (stepIdx >= steps.length - 1) setStepIdx(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1 rounded bg-[#1E4E8C] px-3 py-1.5 text-xs font-medium text-white ui-transition hover:bg-[#163C6E]"
          >
            {playing ? (
              <>
                <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>暫停</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
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
            className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#17191C] ui-transition hover:bg-[#F0EFEA] disabled:opacity-40"
          >
            <span>下一步</span>
            <SkipForward className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PythonCodeView
            code={code}
            activeLine={current.line}
            caption={`執行中：第 ${current.line} 行`}
            compact
          />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5">
          {/* Step Annotation */}
          <div className="rounded-md border border-[#C7DAEE] bg-[#EAF1FA] p-3">
            <div className="mb-1 text-xs font-semibold text-[#1E4E8C]">執行解說</div>
            <p className="text-sm leading-relaxed text-[#17191C]">{current.note}</p>
          </div>

          {/* Variables Table */}
          <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3">
            <div className="mb-2 text-xs font-semibold text-[#525866]">變數狀態追蹤表</div>
            {varEntries.length === 0 ? (
              <p className="text-xs text-[#6C7382]">此步驟無變數異動</p>
            ) : (
              <div className="divide-y divide-[#E2E0D8] rounded border border-[#E2E0D8] bg-white">
                {varEntries.map(([name, val]) => {
                  const formatted = formatVarValue(val);
                  const changed =
                    prev !== null &&
                    formatVarValue(prev.vars?.[name]) !== formatted;
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between px-3 py-1.5 text-xs ${
                        changed ? "bg-[#FDF4E6]" : ""
                      }`}
                    >
                      <span className="font-code font-medium text-[#17191C]">
                        {name}
                      </span>
                      <span
                        className={`font-code tabular-nums ${
                          changed ? "font-semibold text-[#B4690E]" : "text-[#525866]"
                        }`}
                      >
                        {formatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Stack if present */}
          {current.stack && current.stack.length > 0 && (
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3">
              <div className="mb-2 text-xs font-semibold text-[#525866]">
                Call Stack（呼叫堆疊）
              </div>
              <div className="flex flex-col-reverse gap-1">
                {current.stack.map((frame, i) => (
                  <div
                    key={i}
                    className={`rounded border px-2.5 py-1 font-code text-xs ${
                      i === current.stack!.length - 1
                        ? "border-[#1E4E8C] bg-[#EAF1FA] font-semibold text-[#1E4E8C]"
                        : "border-[#E2E0D8] bg-white text-[#525866]"
                    }`}
                  >
                    {frame}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output if present */}
          {current.output !== undefined && (
            <div className="rounded-md border border-[#252C3A] bg-[#141820] p-3">
              <div className="mb-1 font-code text-[11px] text-[#7F8CA3]">
                標準輸出 (stdout)
              </div>
              <pre className="font-code text-xs leading-relaxed text-[#73DACA] whitespace-pre-wrap">
                {current.output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
