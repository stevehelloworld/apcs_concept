"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
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
  const [stepIdx, setStepIdx] = useState(0);
  const [pickedOptionIdx, setPickedOptionIdx] = useState<number | null>(null);
  const [showCmsNotes, setShowCmsNotes] = useState(false);

  const activeLesson = lessons[lessonIdx] ?? lessons[0];
  if (!activeLesson) return null;

  const steps = activeLesson.steps;
  const currentStep = steps[stepIdx] ?? steps[0];
  const varEntries = Object.entries(currentStep?.vars ?? {});
  const pickedOption =
    pickedOptionIdx !== null ? activeLesson.predictOptions[pickedOptionIdx] : null;

  function handleSelectLesson(nextIdx: number) {
    setLessonIdx(nextIdx);
    setStepIdx(0);
    setPickedOptionIdx(null);
  }

  return (
    <div className="rail-frame p-4 sm:p-5 space-y-4">
      {/* Lesson Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/15 pb-3">
        {lessons.map((lesson, idx) => {
          const active = idx === lessonIdx;
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleSelectLesson(idx)}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold ui-transition ${
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
              <span className="font-code text-[11px] opacity-80">
                0{idx + 1}
              </span>
              <span>{lesson.title}</span>
            </button>
          );
        })}
      </div>

      {/* Header Row: Title + Syllabus Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-black text-white">{activeLesson.title}</h3>
        <span className="rounded border border-white/20 bg-[#070C22] px-2.5 py-0.5 font-code text-[11px] font-bold text-[#B8C5E0]">
          {activeLesson.syllabusTag}
        </span>
      </div>

      {/* 3-Step Mental Model Flow */}
      <div className="grid gap-2 sm:grid-cols-3">
        {activeLesson.mentalModel.map((stepText, idx) => (
          <div
            key={idx}
            className="rail-well px-3 py-2 flex items-center gap-2 text-xs font-bold text-white"
          >
            <span
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-code text-[11px]"
              style={{ backgroundColor: theme.hex, color: theme.buttonText }}
            >
              {idx + 1}
            </span>
            <span className="truncate">{stepText}</span>
          </div>
        ))}
      </div>

      {/* Interactive Split: Step-by-Step Micro Tracer (Left) + Predict-Before-Run (Right) */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Live Code + Step Controls + State */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStepIdx(i)}
                  className={`h-6 min-w-[26px] rounded px-1.5 font-code text-[11px] font-bold tabular-nums ui-transition ${
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
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold disabled:opacity-35"
              >
                <SkipBack className="h-3 w-3" strokeWidth={2} />
                <span>上一步</span>
              </button>
              <button
                type="button"
                disabled={stepIdx >= steps.length - 1}
                onClick={() => setStepIdx((p) => Math.min(steps.length - 1, p + 1))}
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold disabled:opacity-35"
              >
                <span>下一步</span>
                <SkipForward className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          </div>

          <PythonCodeView
            code={activeLesson.code}
            activeLine={currentStep?.line ?? null}
            caption={`STEP ${stepIdx + 1}/${steps.length} · L${currentStep?.line ?? 1}`}
            compact
          />

          <div className="rail-plate p-3 space-y-2">
            <p className="text-xs font-bold text-white">{currentStep?.note}</p>

            {(varEntries.length > 0 ||
              (currentStep?.stack && currentStep.stack.length > 0) ||
              currentStep?.output !== undefined) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 font-code text-[11px]">
                {varEntries.map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded border border-white/15 bg-[#070C22] px-2 py-0.5 text-[#FFD452] tabular-nums"
                  >
                    {k}={formatVarVal(v)}
                  </span>
                ))}
                {currentStep?.stack && currentStep.stack.length > 0 && (
                  <span className="rounded border border-[#1E5BFF]/45 bg-[#1E5BFF]/15 px-2 py-0.5 text-[#7AA4FF]">
                    stack: {currentStep.stack.join(" › ")}
                  </span>
                )}
                {currentStep?.output !== undefined && (
                  <span className="rounded border border-[#22B14C]/45 bg-[#22B14C]/15 px-2 py-0.5 font-bold text-[#4ADE80]">
                    out: {currentStep.output}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Predict-Before-Run Challenge + Core Rule */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="rail-well p-3.5 space-y-2.5 flex-1">
            <div className="font-code text-[11px] font-bold text-[#FFD452]">
              隨堂快問（先猜再跑）
            </div>
            <div className="text-xs font-black text-white leading-relaxed">
              {activeLesson.predictQuestion}
            </div>

            <div className="space-y-1.5 pt-1">
              {activeLesson.predictOptions.map((opt, idx) => {
                const picked = pickedOptionIdx === idx;
                let cls =
                  "border-white/20 bg-[#0B1230] text-[#B8C5E0] hover:border-white/55 hover:text-white";
                if (pickedOptionIdx !== null) {
                  if (opt.isCorrect) {
                    cls = "border-[#22B14C] bg-[#22B14C]/18 text-[#4ADE80] font-bold";
                  } else if (picked && !opt.isCorrect) {
                    cls = "border-[#E21D2D] bg-[#E21D2D]/18 text-[#FF7A85]";
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPickedOptionIdx(idx)}
                    className={`w-full rounded border px-3 py-2 text-left font-code text-xs ui-transition ${cls}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {pickedOption && (
              <div
                className={`rounded border p-2.5 text-xs leading-relaxed ${
                  pickedOption.isCorrect
                    ? "border-[#22B14C]/55 bg-[#22B14C]/12 text-[#4ADE80]"
                    : "border-[#E21D2D]/55 bg-[#E21D2D]/12 text-[#FF7A85]"
                }`}
              >
                {pickedOption.why}
              </div>
            )}
          </div>

          <div className="rail-well px-3.5 py-2.5 text-xs">
            <span className="font-bold mr-1.5" style={{ color: theme.text }}>
              判讀口訣：
            </span>
            <span className="text-white font-medium">{activeLesson.rule}</span>
          </div>
        </div>
      </div>

      {/* Teacher CMS Notes Toggle (keeps page concise while honoring teacher CMS edits) */}
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
                  <div className="text-[11px] leading-relaxed text-[#B8C5E0]">
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
