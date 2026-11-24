"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Presentation,
} from "lucide-react";
import { getTopicTheme, QUESTION_TYPE_PAD_CODES } from "@/lib/topic-theme";
import type { PublicQuestionRecord, QuestionType, TopicSummary } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

interface TransitNetworkMapProps {
  topics: TopicSummary[];
  questions: PublicQuestionRecord[];
  isLoggedIn: boolean;
}

interface Pt {
  x: number;
  y: number;
}

interface LineGeometry {
  points: Pt[];
  skipRange?: [number, number];
  minStartDist?: number;
  maxEndDist?: number;
  labelPos: Pt;
  labelAnchor: "start" | "middle" | "end";
}

const LINE_GEOMETRIES: Record<string, LineGeometry> = {
  "control-flow": {
    points: [
      { x: 410, y: 210 },
      { x: 310, y: 110 },
      { x: 180, y: 110 },
      { x: 105, y: 35 },
    ],
    minStartDist: 68,
    maxEndDist: 348,
    labelPos: { x: 105, y: 20 },
    labelAnchor: "middle",
  },
  "loops-range": {
    points: [
      { x: 410, y: 210 },
      { x: 505, y: 115 },
      { x: 630, y: 115 },
      { x: 710, y: 35 },
    ],
    minStartDist: 64,
    maxEndDist: 352,
    labelPos: { x: 710, y: 20 },
    labelAnchor: "middle",
  },
  "lists-grid": {
    points: [
      { x: 410, y: 210 },
      { x: 495, y: 295 },
      { x: 615, y: 295 },
      { x: 695, y: 375 },
    ],
    minStartDist: 70,
    maxEndDist: 334,
    labelPos: { x: 710, y: 396 },
    labelAnchor: "middle",
  },
  "functions-recursion": {
    points: [
      { x: 60, y: 210 },
      { x: 240, y: 210 },
      { x: 280, y: 250 },
      { x: 370, y: 250 },
      { x: 410, y: 210 },
      { x: 560, y: 210 },
      { x: 610, y: 160 },
      { x: 750, y: 160 },
    ],
    minStartDist: 28,
    maxEndDist: 726,
    skipRange: [345, 435],
    labelPos: { x: 752, y: 184 },
    labelAnchor: "end",
  },
  "algorithms-complexity": {
    points: [
      { x: 410, y: 210 },
      { x: 410, y: 290 },
      { x: 325, y: 375 },
      { x: 110, y: 375 },
    ],
    minStartDist: 92,
    maxEndDist: 396,
    labelPos: { x: 110, y: 398 },
    labelAnchor: "middle",
  },
};

function computePolylineSegments(points: Pt[]) {
  const segs: Array<{ a: Pt; b: Pt; len: number; cumStart: number }> = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len, cumStart: total });
    total += len;
  }
  return { segs, total };
}

function pointAtDistance(
  segs: Array<{ a: Pt; b: Pt; len: number; cumStart: number }>,
  dist: number
): { x: number; y: number; nx: number; ny: number } {
  const target =
    segs.find((s) => dist <= s.cumStart + s.len) ?? segs[segs.length - 1];
  const local = Math.max(0, Math.min(target.len, dist - target.cumStart));
  const t = target.len > 0 ? local / target.len : 0;
  const x = target.a.x + (target.b.x - target.a.x) * t;
  const y = target.a.y + (target.b.y - target.a.y) * t;
  const dx = (target.b.x - target.a.x) / (target.len || 1);
  const dy = (target.b.y - target.a.y) / (target.len || 1);
  return { x, y, nx: -dy, ny: dx };
}

function sampleStations(geom: LineGeometry, count: number) {
  if (count <= 0) return [];
  const { segs, total } = computePolylineSegments(geom.points);
  const start = geom.minStartDist ?? 24;
  const end = Math.min(total - 12, geom.maxEndDist ?? total - 24);

  const usableSpans: Array<[number, number]> = geom.skipRange
    ? [
        [start, Math.max(start, geom.skipRange[0])],
        [Math.min(end, geom.skipRange[1]), end],
      ]
    : [[start, end]];

  const spanLengths = usableSpans.map(([s, e]) => Math.max(0, e - s));
  const usableTotal = spanLengths.reduce((acc, v) => acc + v, 0);

  const distances: number[] = [];
  if (geom.skipRange && usableTotal > 0) {
    const leftRatio = spanLengths[0] / usableTotal;
    const leftCount = Math.max(1, Math.round(count * leftRatio));
    const rightCount = count - leftCount;

    for (let i = 0; i < leftCount; i++) {
      const f = leftCount === 1 ? 0.5 : i / (leftCount - 1);
      distances.push(usableSpans[0][0] + spanLengths[0] * f);
    }
    for (let i = 0; i < rightCount; i++) {
      const f = rightCount === 1 ? 0.5 : i / (rightCount - 1);
      distances.push(usableSpans[1][0] + spanLengths[1] * f);
    }
  } else {
    for (let i = 0; i < count; i++) {
      const f = count === 1 ? 0.5 : i / (count - 1);
      distances.push(start + (end - start) * f);
    }
  }

  return distances.map((d) => pointAtDistance(segs, d));
}

function formatShortRef(ref: string | null, fallbackId: number): string {
  if (!ref) return `Q${fallbackId}`;
  const sim = ref.match(/^SIM-(\d+)/i);
  if (sim) return `S${sim[1].padStart(2, "0")}`;
  const m = ref.match(/Q\d+/i);
  return m ? m[0].toUpperCase() : ref.slice(0, 6);
}

export function TransitNetworkMap({
  topics,
  questions,
  isLoggedIn,
}: TransitNetworkMapProps) {
  const [sourceMode, setSourceMode] = useState<"official" | "mock">("official");
  const [focusedLine, setFocusedLine] = useState<string | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  const officialQuestions = useMemo(
    () => questions.filter((q) => !q.official_ref?.startsWith("SIM-")),
    [questions]
  );
  const mockQuestions = useMemo(
    () => questions.filter((q) => q.official_ref?.startsWith("SIM-")),
    [questions]
  );
  const visibleQuestions = useMemo(
    () => (sourceMode === "mock" ? mockQuestions : officialQuestions),
    [sourceMode, mockQuestions, officialQuestions]
  );

  const defaultStation = useMemo(() => {
    if (sourceMode === "mock") {
      return visibleQuestions[0] ?? null;
    }
    return (
      visibleQuestions.find((q) => q.official_ref?.includes("Q8")) ??
      visibleQuestions[0] ??
      null
    );
  }, [visibleQuestions, sourceMode]);

  const [selectedStationId, setSelectedStationId] = useState<number | null>(
    defaultStation?.id ?? null
  );

  function handleSourceChange(mode: "official" | "mock") {
    setSourceMode(mode);
    const nextList = mode === "mock" ? mockQuestions : officialQuestions;
    const nextDefault =
      mode === "mock"
        ? nextList[0] ?? null
        : nextList.find((q) => q.official_ref?.includes("Q8")) ??
          nextList[0] ??
          null;
    setSelectedStationId(nextDefault?.id ?? null);
  }

  const topicLines = useMemo(() => {
    return topics.map((topic, idx) => {
      const theme = getTopicTheme(topic.slug, idx);
      const geom = LINE_GEOMETRIES[topic.slug] ?? LINE_GEOMETRIES["control-flow"];
      const lineQuestions = visibleQuestions.filter(
        (q) => q.topic_slug === topic.slug
      );
      const coords = sampleStations(geom, lineQuestions.length);

      const stations = lineQuestions.map((q, sIdx) => ({
        question: q,
        pos: coords[sIdx] ?? { x: 410, y: 210, nx: 0, ny: -1 },
        shortRef: formatShortRef(q.official_ref, q.id),
      }));

      const solvedCount = lineQuestions.filter(
        (q) => q.user_last_attempt?.is_correct
      ).length;

      return {
        topic,
        theme,
        geom,
        stations,
        solvedCount,
      };
    });
  }, [topics, visibleQuestions]);

  const selectedStation =
    visibleQuestions.find((q) => q.id === selectedStationId) ?? defaultStation;

  const selectedTheme = selectedStation
    ? getTopicTheme(selectedStation.topic_slug)
    : getTopicTheme("control-flow");

  const allTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
  const typeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of questions) {
      map[q.question_type] = (map[q.question_type] ?? 0) + 1;
    }
    return map;
  }, [questions]);

  const solvedTotal = questions.filter((q) => q.user_last_attempt?.is_correct).length;

  return (
    <div className="space-y-3.5">
      {/* Compact Header Strip */}
      <header className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            APCS 程式識讀 50 站互動路網
          </h1>
          <span className="font-code text-xs font-bold text-[#7E91B8] tabular-nums">
            官方 {officialQuestions.length} · 原創模擬 {mockQuestions.length}
            {isLoggedIn && ` · ${solvedTotal}/${questions.length} 過關`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="rail-well inline-flex p-0.5 gap-0.5"
            role="tablist"
            aria-label="路線題庫來源切換"
          >
            <button
              type="button"
              role="tab"
              aria-selected={sourceMode === "official"}
              onClick={() => handleSourceChange("official")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                sourceMode === "official"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E21D2D]" />
              <span>官方 {officialQuestions.length} 站</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sourceMode === "mock"}
              onClick={() => handleSourceChange("mock")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                sourceMode === "mock"
                  ? "bg-[#1E5BFF] text-white"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFC20E]" />
              <span>原創模擬 {mockQuestions.length} 站</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setFocusedLine(null)}
              className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                focusedLine === null
                  ? "bg-white text-[#0B1230]"
                  : "border border-white/20 text-[#B8C5E0] hover:text-white"
              }`}
            >
              全路網
            </button>
            {topicLines.map(({ topic, theme }) => {
              const active = focusedLine === topic.slug;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    setFocusedLine((prev) =>
                      prev === topic.slug ? null : topic.slug
                    )
                  }
                  className="inline-flex items-center gap-1 rounded px-2 py-1 font-code text-xs font-bold ui-transition"
                  style={
                    active
                      ? { backgroundColor: theme.hex, color: theme.buttonText }
                      : {
                          border: "1px solid var(--hairline)",
                          color: "var(--porcelain-secondary)",
                        }
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: active ? theme.buttonText : theme.hex,
                    }}
                  />
                  <span>{theme.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Single-Viewport Transit Stage + Launch Dock */}
      <section className="rail-frame p-3 sm:p-4 space-y-3">
        <div
          className="w-full overflow-hidden rounded border border-white/15"
          style={{ backgroundColor: "var(--map-bg)" }}
        >
          <svg
            viewBox="0 0 820 420"
            className="w-full max-h-[60vh] mx-auto block select-none"
            role="img"
            aria-label={`APCS Python 五大主題與 ${questions.length} 題互動路線圖`}
          >
            {/* Underlay Grid */}
            <g stroke="var(--map-grid)" strokeWidth="1" fill="none">
              <path d="M0 105 H820 M0 210 H820 M0 315 H820" />
              <path d="M164 0 V420 M410 0 V420 M656 0 V420" />
              <path d="M60 40 L210 190 L210 380 M620 40 L620 180 L770 330" />
            </g>

            {/* 5 Rail Line Tracks */}
            {topicLines.map(({ topic, theme, geom }) => {
              const dimmed = focusedLine !== null && focusedLine !== topic.slug;
              const pathStr = geom.points
                .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ");

              return (
                <g
                  key={topic.slug}
                  opacity={dimmed ? 0.22 : 1}
                  style={{ transition: "opacity 180ms ease" }}
                >
                  <path
                    d={pathStr}
                    fill="none"
                    stroke={theme.hex}
                    strokeWidth={focusedLine === topic.slug ? 6.5 : 5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Central Interchange Hub */}
            <g>
              <circle
                cx="410"
                cy="210"
                r="14"
                fill="var(--enamel-ground)"
                stroke="var(--map-ring)"
                strokeWidth="4.5"
              />
              <text
                x="410"
                y="186"
                textAnchor="middle"
                fill="var(--map-label-active)"
                fontSize="11"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="1.5"
              >
                CENTRAL
              </text>
            </g>

            {/* Terminal Line Labels */}
            {topicLines.map(({ topic, theme, geom }) => {
              const dimmed = focusedLine !== null && focusedLine !== topic.slug;
              return (
                <g
                  key={`lbl-${topic.slug}`}
                  opacity={dimmed ? 0.3 : 1}
                  className="cursor-pointer"
                  onClick={() =>
                    setFocusedLine((prev) =>
                      prev === topic.slug ? null : topic.slug
                    )
                  }
                >
                  <text
                    x={geom.labelPos.x}
                    y={geom.labelPos.y}
                    textAnchor={geom.labelAnchor}
                    fill={theme.text}
                    fontSize="12.5"
                    fontWeight="800"
                    fontFamily="Noto Sans TC, sans-serif"
                  >
                    {theme.code} {theme.shortLabel}
                  </text>
                </g>
              );
            })}

            {/* Interactive Station Nodes */}
            {topicLines.map(({ topic, theme, stations }) => {
              const dimmed = focusedLine !== null && focusedLine !== topic.slug;
              return (
                <g
                  key={`stations-${topic.slug}`}
                  opacity={dimmed ? 0.22 : 1}
                  style={{ transition: "opacity 180ms ease" }}
                >
                  {stations.map(({ question, pos, shortRef }, sIdx) => {
                    const isSelected = selectedStation?.id === question.id;
                    const isSolved = Boolean(question.user_last_attempt?.is_correct);
                    const isWrong = Boolean(
                      question.user_last_attempt && !question.user_last_attempt.is_correct
                    );

                    const fill = isSolved
                      ? "#22B14C"
                      : isWrong
                      ? "#E21D2D"
                      : "#FFFFFF";
                    const stroke = isSolved || isWrong ? "var(--map-ring)" : theme.hex;

                    const sign = sIdx % 2 === 0 ? -1 : 1;
                    const labelX = pos.x + pos.nx * 14 * sign;
                    const labelY = pos.y + pos.ny * 14 * sign + 3.5;

                    return (
                      <g
                        key={question.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${shortRef} ${question.title}`}
                        onClick={() => setSelectedStationId(question.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedStationId(question.id);
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        <circle cx={pos.x} cy={pos.y} r="14" fill="transparent" />

                        {isSelected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r="11"
                            fill="none"
                            stroke="var(--map-ring)"
                            strokeWidth="2"
                          />
                        )}

                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isSelected ? 6.5 : 5}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={isSelected ? 2.5 : 2}
                        />

                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          fill={
                            isSelected ? "var(--map-label-active)" : "var(--map-label)"
                          }
                          fontSize={isSelected ? "11.5" : "10"}
                          fontWeight={isSelected ? "800" : "600"}
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {shortRef}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Single Floating Launch Dock */}
        {selectedStation && (
          <div className="rail-well flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2.5 min-w-0">
              <span
                className="rounded px-2 py-0.5 font-code text-xs font-bold shrink-0"
                style={{
                  backgroundColor: selectedTheme.hex,
                  color: selectedTheme.buttonText,
                }}
              >
                {selectedTheme.code}
              </span>
              <span
                className={`rounded px-2 py-0.5 font-code text-xs font-bold shrink-0 ${
                  selectedStation.official_ref?.startsWith("SIM-")
                    ? "border border-[#1E5BFF]/50 bg-[#1E5BFF]/22 text-[#7AA4FF]"
                    : "text-white"
                }`}
              >
                {selectedStation.official_ref?.startsWith("SIM-")
                  ? selectedStation.official_ref
                  : formatShortRef(selectedStation.official_ref, selectedStation.id)}
              </span>
              <span className="truncate text-sm sm:text-base font-black text-white max-w-[440px]">
                {selectedStation.title}
              </span>
              {selectedStation.user_last_attempt?.is_correct && (
                <span className="inline-flex items-center gap-1 font-code text-xs font-bold text-[#4ADE80]">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                  <span>已過關</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/topics/${selectedStation.topic_slug}`}
                className="rail-btn-cobalt inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold"
              >
                <Presentation className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>開始本課投影</span>
              </Link>
              <Link
                href={`/practice?qid=${selectedStation.id}`}
                className="rail-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold"
              >
                <span>開啟此題</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Collapsible Secondary Overview & Question Type Index */}
      <div>
        <button
          type="button"
          onClick={() => setShowOverview((v) => !v)}
          className="inline-flex items-center gap-1.5 font-code text-xs font-bold text-[#7E91B8] hover:text-white ui-transition"
        >
          <span>展開路線進度與題型分類 (T1–T6)</span>
          {showOverview ? (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
          )}
        </button>

        {showOverview && (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rail-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold tracking-wider text-white">
                  五大路線快速進入
                </h2>
                <Link
                  href="/topics"
                  className="font-code text-xs text-[#B8C5E0] hover:text-white"
                >
                  全部路線表 →
                </Link>
              </div>
              <div className="divide-y divide-white/10">
                {topicLines.map(({ topic, theme, stations, solvedCount }) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="flex items-center justify-between py-2 px-1 hover:bg-white/[0.04] rounded ui-transition"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className="font-code text-xs font-bold text-[#7E91B8]">
                        {theme.code}
                      </span>
                      <span className="truncate text-xs sm:text-sm font-bold text-white">
                        {topic.title}
                      </span>
                    </span>
                    <span className="font-code text-xs text-[#B8C5E0] tabular-nums shrink-0">
                      {isLoggedIn
                        ? `${solvedCount}/${stations.length}`
                        : `${stations.length} 站`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rail-frame p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold tracking-wider text-white">
                  六大題型直達刷題
                </h2>
                <Link
                  href="/practice"
                  className="font-code text-xs text-[#B8C5E0] hover:text-white"
                >
                  進入刷題台 →
                </Link>
              </div>
              <div className="divide-y divide-white/10">
                {allTypes.map((qt) => (
                  <Link
                    key={qt}
                    href={`/practice?type=${qt}`}
                    className="flex items-center justify-between py-2 px-1 hover:bg-white/[0.04] rounded ui-transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-code text-xs font-bold text-[#7E91B8] w-6">
                        {QUESTION_TYPE_PAD_CODES[qt]}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {QUESTION_TYPE_LABELS[qt]}
                      </span>
                    </span>
                    <span className="font-code text-xs text-[#B8C5E0] tabular-nums">
                      {typeCounts[qt] ?? 0} 題 →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
