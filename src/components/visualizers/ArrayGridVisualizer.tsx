"use client";

import { useState } from "react";
import { ArrowLeftRight, Grid, Layers } from "lucide-react";

const MAZE = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1],
];

const DIRS = [
  { dr: -1, dc: 0, label: "上 (-1,0)" },
  { dr: 0, dc: 1, label: "右 (0,+1)" },
  { dr: 1, dc: 0, label: "下 (+1,0)" },
  { dr: 0, dc: -1, label: "左 (0,-1)" },
];

export function ArrayGridVisualizer() {
  const [tab, setTab] = useState<"reverse" | "maze" | "prefix">("reverse");
  const [revLimit, setRevLimit] = useState<"n" | "half">("n");
  const [swapStep, setSwapStep] = useState(0);

  const initialArr = [1, 3, 5, 7, 9, 8, 6, 4, 2];
  const maxStep = revLimit === "n" ? 9 : 4;
  const clampedStep = Math.min(swapStep, maxStep);
  const simArr = [...initialArr];
  for (let i = 0; i < clampedStep; i++) {
    const j = 8 - i;
    const tmp = simArr[i];
    simArr[i] = simArr[j];
    simArr[j] = tmp;
  }

  const [selectedCell, setSelectedCell] = useState<[number, number]>([1, 1]);
  const [sr, sc] = selectedCell;
  const neighborHits = DIRS.map((d) => {
    const nr = sr + d.dr;
    const nc = sc + d.dc;
    return { ...d, nr, nc, val: MAZE[nr]?.[nc] ?? 0 };
  });

  const cellCounts = [1, 2, 3].map((r) =>
    [1, 2, 3].map((c) => DIRS.filter((d) => MAZE[r + d.dr][c + d.dc] === 1).length)
  );

  const [leftIdx, setLeftIdx] = useState(30);
  const [rightIdx, setRightIdx] = useState(50);
  const sumR = (rightIdx * (rightIdx + 1)) / 2;
  const sumL = (leftIdx * (leftIdx + 1)) / 2;

  return (
    <div className="rail-frame overflow-hidden">
      <div className="h-1 w-full bg-[#22B14C]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#168A3B] px-2 py-0.5 font-code text-xs font-bold text-white">
              L3
            </span>
            <h3 className="text-sm font-black text-white">網格與陣列掃描</h3>
          </div>

          <div className="rail-well flex flex-wrap gap-1 p-0.5">
            <button
              type="button"
              onClick={() => setTab("reverse")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "reverse"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q15 反轉</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("maze")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "maze"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Grid className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q18 迷宮</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("prefix")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "prefix"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q30 前綴和</span>
            </button>
          </div>
        </div>

        {tab === "reverse" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRevLimit("n");
                    setSwapStep(0);
                  }}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    revLimit === "n"
                      ? "bg-[#E21D2D] text-white"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  range(9) 翻回原狀
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRevLimit("half");
                    setSwapStep(0);
                  }}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    revLimit === "half"
                      ? "bg-[#168A3B] text-white"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  range(9//2) 正解
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSwapStep((s) => Math.max(0, s - 1))}
                  disabled={clampedStep === 0}
                  className="rail-btn px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                >
                  上一步
                </button>
                <span className="font-code text-xs font-bold text-[#4ADE80] tabular-nums">
                  {clampedStep}/{maxStep}
                </span>
                <button
                  type="button"
                  onClick={() => setSwapStep((s) => Math.min(maxStep, s + 1))}
                  disabled={clampedStep >= maxStep}
                  className="rail-btn-green px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                >
                  交換
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
              {simArr.map((val, idx) => {
                const activePair =
                  clampedStep > 0 &&
                  (idx === clampedStep - 1 || idx === 9 - clampedStep);
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center rounded border py-2 ui-transition ${
                      activePair
                        ? "border-[#22B14C] bg-[#22B14C]/18 text-[#4ADE80]"
                        : "border-white/20 bg-[#070C22] text-white"
                    }`}
                  >
                    <span className="font-code text-[10px] text-[#7E91B8]">
                      a[{idx}]
                    </span>
                    <span className="mt-0.5 font-display text-lg font-extrabold tabular-nums">
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "maze" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-2">
              <div className="rail-well inline-grid grid-cols-5 gap-1.5 p-2.5">
                {MAZE.map((row, r) =>
                  row.map((val, c) => {
                    const isInner = r >= 1 && r <= 3 && c >= 1 && c <= 3;
                    const isSelected = r === sr && c === sc;
                    const isNeighbor = neighborHits.some(
                      (h) => h.nr === r && h.nc === c
                    );
                    const neighborIsOne = isNeighbor && val === 1;

                    let cellClass = "border-white/10 bg-[#070C22] text-[#7E91B8]";
                    if (isSelected) {
                      cellClass = "border-white bg-[#1E5BFF] text-white";
                    } else if (neighborIsOne) {
                      cellClass =
                        "border-[#22B14C] bg-[#22B14C]/22 text-[#4ADE80] font-bold";
                    } else if (isNeighbor) {
                      cellClass = "border-white/50 bg-[#111B45] text-[#B8C5E0]";
                    } else if (isInner) {
                      cellClass =
                        "border-white/25 bg-[#111B45] text-white hover:border-white";
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        disabled={!isInner}
                        onClick={() => setSelectedCell([r, c])}
                        className={`flex h-11 w-11 flex-col items-center justify-center rounded border font-code text-xs ui-transition ${cellClass}`}
                      >
                        <span className="text-[9px] opacity-75">
                          {r},{c}
                        </span>
                        <span className="text-xs font-bold tabular-nums">{val}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="rail-well p-3 space-y-2">
                <div className="text-xs font-bold text-white">
                  ({sr},{sc}) 命中：
                  <span className="ml-1 font-code text-[#4ADE80]">
                    {neighborHits.filter((h) => h.val === 1).length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {neighborHits.map((h) => (
                    <div
                      key={h.label}
                      className={`rounded border px-2.5 py-1.5 text-xs ${
                        h.val === 1
                          ? "border-[#22B14C]/55 bg-[#22B14C]/15 text-[#4ADE80]"
                          : "border-white/15 bg-[#0B1230] text-[#B8C5E0]"
                      }`}
                    >
                      <div className="font-bold">{h.label}</div>
                      <div className="font-code tabular-nums">
                        [{h.nr}][{h.nc}] = {h.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rail-well p-3">
                <div className="grid grid-cols-3 gap-1.5 font-code text-xs text-center tabular-nums">
                  {cellCounts.flatMap((row, rIdx) =>
                    row.map((cnt, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="rounded border border-white/15 bg-[#0B1230] py-1 text-[#B8C5E0]"
                      >
                        ({rIdx + 1},{cIdx + 1}): <strong className="text-white">{cnt}</strong>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-2 text-right font-code text-xs font-bold text-[#4ADE80]">
                  總和 = {cellCounts.flat().reduce((a, b) => a + b, 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "prefix" && (
          <div className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rail-well p-3 text-xs">
                <span className="font-code font-bold text-white">L = {leftIdx}</span>
                <input
                  type="range"
                  min={0}
                  max={rightIdx - 1}
                  value={leftIdx}
                  onChange={(e) => setLeftIdx(Number(e.target.value))}
                  className="rail-slider mt-2.5 w-full"
                />
              </label>
              <label className="rail-well p-3 text-xs">
                <span className="font-code font-bold text-[#4ADE80]">R = {rightIdx}</span>
                <input
                  type="range"
                  min={leftIdx + 1}
                  max={100}
                  value={rightIdx}
                  onChange={(e) => setRightIdx(Number(e.target.value))}
                  className="rail-slider mt-2.5 w-full"
                />
              </label>
            </div>

            <div className="rail-well p-3.5 space-y-2.5">
              <div className="h-6 w-full overflow-hidden rounded border border-white/15 bg-[#0B1230]">
                <div className="flex h-full" style={{ width: `${rightIdx}%` }}>
                  <div
                    style={{ width: `${(leftIdx / rightIdx) * 100}%` }}
                    className="bg-[#1E2A5E] text-[10px] font-code font-bold text-[#B8C5E0] flex items-center justify-center truncate"
                  >
                    扣 1..{leftIdx}
                  </div>
                  <div className="flex-1 bg-[#22B14C] text-[10px] font-code font-bold text-[#0B1230] flex items-center justify-center truncate">
                    留 {leftIdx + 1}..{rightIdx}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-code">
                <span className="text-[#B8C5E0]">
                  a[{rightIdx}] - a[{leftIdx}] ({rightIdx - leftIdx} 項)
                </span>
                <span className="font-display text-base font-extrabold text-[#4ADE80] tabular-nums">
                  {sumR} - {sumL} = {sumR - sumL}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
