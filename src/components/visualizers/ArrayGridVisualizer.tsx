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
  { dr: -1, dc: 0, label: "上 (-1, 0)" },
  { dr: 0, dc: 1, label: "右 (0, +1)" },
  { dr: 1, dc: 0, label: "下 (+1, 0)" },
  { dr: 0, dc: -1, label: "左 (0, -1)" },
];

export function ArrayGridVisualizer() {
  const [tab, setTab] = useState<"reverse" | "maze" | "prefix">("reverse");

  // Q15 state
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

  // Q18 state
  const [selectedCell, setSelectedCell] = useState<[number, number]>([1, 1]);
  const [sr, sc] = selectedCell;
  const neighborHits = DIRS.map((d) => {
    const nr = sr + d.dr;
    const nc = sc + d.dc;
    return { ...d, nr, nc, val: MAZE[nr]?.[nc] ?? 0 };
  });

  // Compute total across 3x3
  const cellCounts = [1, 2, 3].map((r) =>
    [1, 2, 3].map((c) => DIRS.filter((d) => MAZE[r + d.dr][c + d.dc] === 1).length)
  );

  // Q30 state
  const [leftIdx, setLeftIdx] = useState(30);
  const [rightIdx, setRightIdx] = useState(50);
  const sumR = (rightIdx * (rightIdx + 1)) / 2;
  const sumL = (leftIdx * (leftIdx + 1)) / 2;

  return (
    <div className="synth-panel-hard overflow-hidden">
      <div className="h-2 w-full bg-[#00A878]" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4DAE4] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[#11151C]">
              <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-xs font-bold text-[#00E5A0]">
                LAB-03
              </span>
              <span>陣列與 2D 網格掃描儀</span>
            </h3>
            <p className="mt-1 text-xs text-[#4B5565]">
              空間格位模擬追蹤對稱反轉、四方向位移掃描與前綴和端點差異
            </p>
          </div>

          <div className="synth-recess flex flex-wrap gap-1 p-1">
            <button
              type="button"
              onClick={() => setTab("reverse")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "reverse"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q15 反轉還原</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("maze")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "maze"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Grid className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q18 迷宮四向</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("prefix")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "prefix"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q30 前綴和相減</span>
            </button>
          </div>
        </div>

        {tab === "reverse" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRevLimit("n");
                    setSwapStep(0);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    revLimit === "n"
                      ? "border-[#161A22] bg-[#161A22] text-white"
                      : "border-[#C4CBD6] bg-white text-[#4B5565]"
                  }`}
                >
                  原題：range(9)（會翻回原狀）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRevLimit("half");
                    setSwapStep(0);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    revLimit === "half"
                      ? "border-[#161A22] bg-[#007A57] text-white"
                      : "border-[#C4CBD6] bg-white text-[#4B5565]"
                  }`}
                >
                  正解：range(9 // 2)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSwapStep((s) => Math.max(0, s - 1))}
                  disabled={clampedStep === 0}
                  className="synth-pad px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  上一步
                </button>
                <span className="rounded bg-[#161A22] px-2.5 py-1 font-code text-xs font-bold text-[#00E5A0] tabular-nums">
                  {clampedStep} / {maxStep}
                </span>
                <button
                  type="button"
                  onClick={() => setSwapStep((s) => Math.min(maxStep, s + 1))}
                  disabled={clampedStep >= maxStep}
                  className="synth-pad-emerald px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  下一步交換
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
                    className={`flex flex-col items-center rounded-xl border-2 py-2.5 ui-transition ${
                      activePair
                        ? "border-[#007A57] bg-[#E6FAF3] text-[#007A57]"
                        : "border-[#C4CBD6] bg-[#F8F9FB] text-[#11151C]"
                    }`}
                  >
                    <span className="font-code text-[10px] text-[#647082]">
                      a[{idx}]
                    </span>
                    <span className="mt-0.5 font-display text-lg font-bold tabular-nums">
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs leading-relaxed text-[#4B5565]">
              {clampedStep === 9
                ? "9 次全部執行完畢：i=5..8 把前 4 次對換過去的數字全換回原本位置！列表回到 [1, 3, 5, 7, 9, 8, 6, 4, 2]。"
                : clampedStep >= 4
                ? "過了中點 i=4 後繼續交換，會把剛翻好的內容再次還原。"
                : "按下「下一步交換」觀察 i 與 n-i-1 如何先反轉、過半後再還原。"}
            </p>
          </div>
        )}

        {tab === "maze" && (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-2.5">
              <div className="text-xs font-bold text-[#4B5565]">
                點選白色內圈格子 <span className="font-code">range(1, 4)</span> 測試四方向掃描：
              </div>
              <div className="synth-recess inline-grid grid-cols-5 gap-1.5 p-3">
                {MAZE.map((row, r) =>
                  row.map((val, c) => {
                    const isInner = r >= 1 && r <= 3 && c >= 1 && c <= 3;
                    const isSelected = r === sr && c === sc;
                    const isNeighbor = neighborHits.some(
                      (h) => h.nr === r && h.nc === c
                    );
                    const neighborIsOne = isNeighbor && val === 1;

                    let cellClass = "border-[#B9C2D0] bg-[#D1D7E1] text-[#647082]";
                    if (isSelected) {
                      cellClass = "border-[#161A22] bg-[#161A22] text-[#00E5A0] shadow-xs";
                    } else if (neighborIsOne) {
                      cellClass =
                        "border-[#007A57] bg-[#E6FAF3] text-[#007A57] font-bold";
                    } else if (isNeighbor) {
                      cellClass = "border-[#161A22] bg-white text-[#4B5565]";
                    } else if (isInner) {
                      cellClass =
                        "border-[#9AA3B2] bg-white text-[#11151C] hover:border-[#007A57]";
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        disabled={!isInner}
                        onClick={() => setSelectedCell([r, c])}
                        className={`flex h-12 w-12 flex-col items-center justify-center rounded-lg border-[1.5px] font-code text-xs ui-transition ${cellClass}`}
                      >
                        <span className="text-[10px] opacity-75">
                          ({r},{c})
                        </span>
                        <span className="text-sm font-bold tabular-nums">{val}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              <div className="synth-recess p-3.5 space-y-2">
                <div className="text-xs font-bold text-[#11151C]">
                  中心 ({sr}, {sc}) 四方向命中：
                  <span className="ml-1 font-code text-[#007A57]">
                    {neighborHits.filter((h) => h.val === 1).length} 個 1
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {neighborHits.map((h) => (
                    <div
                      key={h.label}
                      className={`rounded-lg border px-2.5 py-2 text-xs ${
                        h.val === 1
                          ? "border-[#007A57] bg-[#E6FAF3] text-[#007A57]"
                          : "border-[#C4CBD6] bg-white text-[#4B5565]"
                      }`}
                    >
                      <div className="font-bold">{h.label}</div>
                      <div className="font-code tabular-nums">
                        maze[{h.nr}][{h.nc}] = {h.val} {h.val === 1 ? "(+1)" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-3.5">
                <div className="mb-2 text-xs font-bold text-[#4B5565]">
                  內圈 3×3 累計命中總表（手算對照）
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-code text-xs text-center tabular-nums">
                  {cellCounts.flatMap((row, rIdx) =>
                    row.map((cnt, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="rounded-lg border border-[#C4CBD6] bg-white py-1.5"
                      >
                        ({rIdx + 1},{cIdx + 1}) → <strong>{cnt}</strong>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-2 text-right font-code text-xs font-bold text-[#007A57]">
                  總和 ={" "}
                  {cellCounts
                    .map((row) => row.reduce((a, b) => a + b, 0))
                    .join(" + ")}{" "}
                  = {cellCounts.flat().reduce((a, b) => a + b, 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "prefix" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="synth-recess p-3.5 text-xs">
                <span className="font-bold text-[#11151C]">
                  左端點 a[L]（整段被扣掉）：
                  <span className="ml-1 rounded bg-[#161A22] px-2 py-0.5 font-code text-white">
                    L = {leftIdx}
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={rightIdx - 1}
                  value={leftIdx}
                  onChange={(e) => setLeftIdx(Number(e.target.value))}
                  className="synth-slider mt-3 w-full"
                />
              </label>
              <label className="synth-recess p-3.5 text-xs">
                <span className="font-bold text-[#11151C]">
                  右端點 a[R]：
                  <span className="ml-1 rounded bg-[#161A22] px-2 py-0.5 font-code text-[#00E5A0]">
                    R = {rightIdx}
                  </span>
                </span>
                <input
                  type="range"
                  min={leftIdx + 1}
                  max={100}
                  value={rightIdx}
                  onChange={(e) => setRightIdx(Number(e.target.value))}
                  className="synth-slider mt-3 w-full"
                />
              </label>
            </div>

            <div className="synth-oled p-4 space-y-2.5">
              <div className="flex items-center justify-between font-code text-xs">
                <span className="text-[#A8B6CC]">a[{rightIdx}] = 1 + ... + {rightIdx}</span>
                <span className="font-bold text-white tabular-nums">{sumR}</span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-lg border border-[#262F3F] bg-[#161B24]">
                <div className="flex h-full" style={{ width: `${rightIdx}%` }}>
                  <div
                    style={{ width: `${(leftIdx / rightIdx) * 100}%` }}
                    className="bg-[#4B5565] text-[10px] font-code font-bold text-white flex items-center justify-center truncate"
                  >
                    扣 1..{leftIdx}
                  </div>
                  <div className="flex-1 bg-[#00A878] text-[10px] font-code font-bold text-[#09120E] flex items-center justify-center truncate">
                    留 {leftIdx + 1}..{rightIdx}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
                <span className="text-xs text-[#CBD5E1]">
                  <code className="font-code text-[#38BDF8]">
                    a[{rightIdx}] - a[{leftIdx}]
                  </code>{" "}
                  = 從 <strong>{leftIdx + 1}</strong> 加到 <strong>{rightIdx}</strong>（共{" "}
                  {rightIdx - leftIdx} 項，不含 {leftIdx}）
                </span>
                <span className="font-display text-base font-bold text-[#00E5A0] tabular-nums">
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
