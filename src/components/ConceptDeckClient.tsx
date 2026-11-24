"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type { ConceptLesson } from "@/lib/concept-lessons";
import type { TopicChannelTheme } from "@/lib/topic-theme";
import type { CoreConcept } from "@/lib/types";
import { PythonCodeView } from "./PythonCodeView";

interface ConceptDeckClientProps {
  theme: TopicChannelTheme;
  lessons: ConceptLesson[];
  cmsConcepts: CoreConcept[];
}

function formatVarVal(v: unknown): string {
  if (Array.isArray(v)) return `[${v.join(", ")}]`;
  if (typeof v === "boolean") return v ? "True" : "False";
  return String(v);
}

export function ConceptDeckClient({
  theme,
  lessons,
  cmsConcepts,
}: ConceptDeckClientProps) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [traceStarted, setTraceStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [pickedOptionIdx, setPickedOptionIdx] = useState<number | null>(null);
  const [showRule, setShowRule] = useState(false);
  const [showCmsNotes, setShowCmsNotes] = useState(false);

  const activeLesson = lessons[lessonIdx] ?? lessons[0];
  const steps = activeLesson?.steps ?? [];
  const currentStep = steps[stepIdx] ?? steps[0];
  const varEntries = Object.entries(currentStep?.vars ?? {});
  const pickedOption =
    activeLesson && pickedOptionIdx !== null
      ? activeLesson.predictOptions[pickedOptionIdx]
      : null;

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
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!traceStarted) {
          setTraceStarted(true);
          setStepIdx(0);
        } else {
          setStepIdx((p) => Math.min(Math.max(0, steps.length - 1), p + 1));
        }
      } else if (e.key === "ArrowLeft" && traceStarted) {
        e.preventDefault();
        setStepIdx((p) => Math.max(0, p - 1));
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        setShowRule((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [traceStarted, steps.length]);

  if (!activeLesson) return null;

  function handleSelectLesson(nextIdx: number) {
    setLessonIdx(nextIdx);
    setTraceStarted(false);
    setStepIdx(0);
    setPickedOptionIdx(null);
    setShowRule(false);
  }

  return (
    <div className="rail-frame p-4 sm:p-5 space-y-4">
      {/* Lesson Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {lessons.map((lesson, idx) => {
            const active = idx === lessonIdx;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(idx)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs sm:text-sm font-bold ui-transition ${
                  active
                    ? "text-white"
                    : "border border-white/20 text-[#B8C5E0] hover:text-white hover:border-white/45"
                }`}
                style={
                  active
                    ? { backgroundColor: theme.buttonBg, color: theme.buttonText }
                    : undefined
                }
              >
                <span className="font-code text-xs opacity-80">0{idx + 1}</span>
                <span>{lesson.title}</span>
              </button>
            );
          })}
        </div>

        <span className="rounded border border-white/20 bg-[#070C22] px-2.5 py-0.5 font-code text-xs font-bold text-[#B8C5E0]">
          {activeLesson.syllabusTag}
        </span>
      </div>

      {/* 820px+ Side-by-Side Projection Cockpit */}
      <div className="cockpit-2col">
        {/* Left: Code & Progressive Stepper */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!traceStarted ? (
              <button
                type="button"
                onClick={() => {
                  setTraceStarted(true);
                  setStepIdx(0);
                }}
                className="rail-btn-primary inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-bold"
              >
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
                <span>開始單步追蹤 (→)</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 w-full justify-between">
                <div className="flex items-center gap-1">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStepIdx(i)}
                      className={`h-7 min-w-[28px] rounded px-1.5 font-code text-xs font-bold tabular-nums ui-transition ${
                        stepIdx === i
                          ? "bg-[#E21D2D] text-white"
                          : "border border-white/20 text-[#B8C5E0] hover:text-white"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={stepIdx === 0}
                    onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
                    className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
                  >
                    <SkipBack className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>上一步</span>
                  </button>
                  <button
                    type="button"
                    disabled={stepIdx >= steps.length - 1}
                    onClick={() =>
                      setStepIdx((p) => Math.min(steps.length - 1, p + 1))
                    }
                    className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-35"
                  >
                    <span>下一步</span>
                    <SkipForward className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTraceStarted(false);
                      setStepIdx(0);
                    }}
                    aria-label="收合單步追蹤"
                    title="收合追蹤"
                    className="rail-btn inline-flex items-center gap-1 px-2 py-1 text-xs font-bold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <PythonCodeView
            code={activeLesson.code}
            activeLine={traceStarted ? currentStep?.line ?? null : null}
            caption={
              traceStarted
                ? `STEP ${stepIdx + 1}/${steps.length} · L${currentStep?.line ?? 1}`
                : "PYTHON 3 · 先讓學生預測結果"
            }
          />

          {/* Hide trace readout completely until tracing starts */}
          {traceStarted && (
            <div className="rail-plate p-3.5 space-y-2">
              <p className="text-sm font-bold text-white">{currentStep?.note}</p>

              {(varEntries.length > 0 ||
                (currentStep?.stack && currentStep.stack.length > 0) ||
                currentStep?.output !== undefined) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 font-code text-xs">
                  {varEntries.map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded border border-white/15 bg-[#070C22] px-2.5 py-0.5 text-[#FFD452] tabular-nums font-bold"
                    >
                      {k}={formatVarVal(v)}
                    </span>
                  ))}
                  {currentStep?.stack && currentStep.stack.length > 0 && (
                    <span className="rounded border border-[#1E5BFF]/45 bg-[#1E5BFF]/15 px-2.5 py-0.5 text-[#7AA4FF] font-bold">
                      stack: {currentStep.stack.join(" › ")}
                    </span>
                  )}
                  {currentStep?.output !== undefined && (
                    <span className="rounded border border-[#22B14C]/45 bg-[#22B14C]/15 px-2.5 py-0.5 font-bold text-[#4ADE80]">
                      out: {currentStep.output}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Predict-Before-Run Challenge + Deferred Rule/Mental Model */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="rail-well p-4 space-y-3">
            <div className="font-code text-xs font-bold text-[#FFD452]">
              隨堂快問（先猜再追蹤）
            </div>
            <div className="text-sm sm:text-base font-black text-white leading-relaxed">
              {activeLesson.predictQuestion}
            </div>

            <div className="space-y-2 pt-1">
              {activeLesson.predictOptions.map((opt, idx) => {
                const picked = pickedOptionIdx === idx;
                let cls =
                  "border-white/20 bg-[#0B1230] text-[#B8C5E0] hover:border-white/55 hover:text-white";
                if (pickedOptionIdx !== null) {
                  if (opt.isCorrect) {
                    cls =
                      "border-[#22B14C] bg-[#22B14C]/18 text-[#4ADE80] font-bold";
                  } else if (picked && !opt.isCorrect) {
                    cls = "border-[#E21D2D] bg-[#E21D2D]/18 text-[#FF7A85]";
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPickedOptionIdx(idx)}
                    className={`w-full rounded border px-3.5 py-2.5 text-left font-code text-sm ui-transition ${cls}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {pickedOption && (
              <div
                className={`rounded border p-3 text-xs sm:text-sm leading-relaxed ${
                  pickedOption.isCorrect
                    ? "border-[#22B14C]/55 bg-[#22B14C]/12 text-[#4ADE80]"
                    : "border-[#E21D2D]/55 bg-[#E21D2D]/12 text-[#FF7A85]"
                }`}
              >
                {pickedOption.why}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setShowRule((v) => !v)}
              className="rail-btn w-full inline-flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-bold"
            >
              {showRule ? (
                <>
                  <EyeOff className="h-4 w-4" strokeWidth={2} />
                  <span>收合心法與口訣 [R]</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-[#FFC20E]" strokeWidth={2} />
                  <span>揭曉心法與口訣 [R]</span>
                </>
              )}
            </button>

            {showRule && (
              <div className="rail-well p-3.5 space-y-2.5">
                <div className="space-y-1.5">
                  {activeLesson.mentalModel.map((stepText, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white"
                    >
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-code text-[11px]"
                        style={{
                          backgroundColor: theme.hex,
                          color: theme.buttonText,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span>{stepText}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-2 text-xs sm:text-sm">
                  <span className="font-bold mr-1.5" style={{ color: theme.text }}>
                    判讀口訣：
                  </span>
                  <span className="text-white font-medium">{activeLesson.rule}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapsed Teacher CMS Notes Drawer */}
      {cmsConcepts.length > 0 && (
        <div className="border-t border-white/15 pt-3">
          <button
            type="button"
            onClick={() => setShowCmsNotes((v) => !v)}
            className="inline-flex items-center gap-1.5 font-code text-xs font-bold text-[#B8C5E0] hover:text-white"
          >
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
            <span>講義備忘筆記 ({cmsConcepts.length})</span>
            {showCmsNotes ? (
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>

          {showCmsNotes && (
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {cmsConcepts.map((c, i) => (
                <div key={i} className="rail-well p-3 space-y-2">
                  <div className="text-xs font-black text-white">{c.title}</div>
                  {c.code && <PythonCodeView code={c.code} compact />}
                  <div className="text-xs leading-relaxed text-[#B8C5E0]">
                    {c.note}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
