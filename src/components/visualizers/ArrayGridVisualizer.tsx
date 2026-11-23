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
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#17191C]">
            互動視覺化實驗室：陣列反轉、二維迷宮與前綴和
          </h3>
          <p className="text-xs text-[#525866]">
            透過空間格位模擬追蹤對稱交換、四方向位移向量與前綴和端點差異
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTab("reverse")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "reverse"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q15 反轉還原陷阱</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("maze")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "maze"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Grid className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q18 迷宮四方向掃描</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("prefix")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "prefix"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q30 前綴和區間相減</span>
          </button>
        </div>
      </div>

      {tab === "reverse" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRevLimit("n");
                  setSwapStep(0);
                }}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  revLimit === "n"
                    ? "bg-[#1E4E8C] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                原題：for i in range(9)（會翻回原狀）
              </button>
              <button
                type="button"
                onClick={() => {
                  setRevLimit("half");
                  setSwapStep(0);
                }}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  revLimit === "half"
                    ? "bg-[#157F4B] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                正確反轉：for i in range(9 // 2)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSwapStep((s) => Math.max(0, s - 1))}
                disabled={clampedStep === 0}
                className="rounded border border-[#E2E0D8] px-2.5 py-1 text-xs disabled:opacity-40"
              >
                上一步
              </button>
              <span className="font-code text-xs tabular-nums text-[#525866]">
                已執行 {clampedStep} / {maxStep} 次交換
              </span>
              <button
                type="button"
                onClick={() => setSwapStep((s) => Math.min(maxStep, s + 1))}
                disabled={clampedStep >= maxStep}
                className="rounded bg-[#1E4E8C] px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
              >
                下一步交換
              </button>
            </div>
          </div>

          <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
            {simArr.map((val, idx) => {
              const activePair =
                clampedStep > 0 &&
                (idx === clampedStep - 1 || idx === 9 - clampedStep);
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center rounded-md border py-2.5 ui-transition ${
                    activePair
                      ? "border-[#1E4E8C] bg-[#EAF1FA] text-[#1E4E8C]"
                      : "border-[#E2E0D8] bg-[#F7F6F2] text-[#17191C]"
                  }`}
                >
                  <span className="font-code text-[10px] text-[#6C7382]">a[{idx}]</span>
                  <span className="mt-0.5 font-code text-base font-bold tabular-nums">
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-[#525866]">
            {clampedStep === 9
              ? "全部 9 次執行完畢：i=5..8 把前 4 次換過去的數值全部又換回去了！列表恢復成 [1, 3, 5, 7, 9, 8, 6, 4, 2]。"
              : clampedStep >= 4
              ? "過了中點 i=4 之後，繼續對稱交換會把已經反轉好的元素再換回原本位置。"
              : "點擊「下一步交換」觀察 i 與 n-i-1 兩個指標如何先反轉、再還原。"}
          </p>
        </div>
      )}

      {tab === "maze" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="mb-2 text-xs text-[#525866]">
              點擊白色內圈格子 <span className="font-code">range(1, 4)</span> 查看它的四方向鄰居：
            </div>
            <div className="inline-grid grid-cols-5 gap-1.5 rounded-md border border-[#E2E0D8] bg-[#F0EFEA] p-3">
              {MAZE.map((row, r) =>
                row.map((val, c) => {
                  const isInner = r >= 1 && r <= 3 && c >= 1 && c <= 3;
                  const isSelected = r === sr && c === sc;
                  const isNeighbor = neighborHits.some((h) => h.nr === r && h.nc === c);
                  const neighborIsOne = isNeighbor && val === 1;

                  let cellClass = "border-[#E2E0D8] bg-[#E5E3DC] text-[#6C7382]";
                  if (isSelected) {
                    cellClass = "border-[#1E4E8C] bg-[#1E4E8C] text-white";
                  } else if (neighborIsOne) {
                    cellClass = "border-[#157F4B] bg-[#EAF6EF] text-[#157F4B] font-bold";
                  } else if (isNeighbor) {
                    cellClass = "border-[#C9C6BB] bg-white text-[#525866]";
                  } else if (isInner) {
                    cellClass = "border-[#C9C6BB] bg-white text-[#17191C] hover:border-[#1E4E8C]";
                  }

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      disabled={!isInner}
                      onClick={() => setSelectedCell([r, c])}
                      className={`flex h-12 w-12 flex-col items-center justify-center rounded border font-code text-xs ui-transition ${cellClass}`}
                    >
                      <span className="text-[10px] opacity-75">
                        ({r},{c})
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{val}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3.5">
              <div className="mb-2 text-xs font-semibold text-[#17191C]">
                中心格 ({sr}, {sc}) 四方向探測結果（命中{" "}
                {neighborHits.filter((h) => h.val === 1).length} 個 1）
              </div>
              <div className="grid grid-cols-2 gap-2">
                {neighborHits.map((h) => (
                  <div
                    key={h.label}
                    className={`rounded border px-2.5 py-2 text-xs ${
                      h.val === 1
                        ? "border-[#157F4B]/40 bg-[#EAF6EF] text-[#157F4B]"
                        : "border-[#E2E0D8] bg-white text-[#525866]"
                    }`}
                  >
                    <div className="font-semibold">{h.label}</div>
                    <div className="font-code tabular-nums">
                      maze[{h.nr}][{h.nc}] = {h.val} {h.val === 1 ? "(+1)" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-[#E2E0D8] bg-white p-3.5">
              <div className="mb-1.5 text-xs font-semibold text-[#525866]">
                內圈 3×3 各格命中次數總表（考場手算這樣寫最快）
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-code text-xs text-center tabular-nums">
                {cellCounts.flatMap((row, rIdx) =>
                  row.map((cnt, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="rounded border border-[#E2E0D8] bg-[#F7F6F2] py-1.5"
                    >
                      ({rIdx + 1},{cIdx + 1}) → <strong>{cnt}</strong>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 text-right font-code text-xs font-semibold text-[#1E4E8C]">
                總和 = {cellCounts.map((row) => row.reduce((a, b) => a + b, 0)).join(" + ")} ={" "}
                {cellCounts.flat().reduce((a, b) => a + b, 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "prefix" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs">
              <span className="font-semibold text-[#525866]">
                左端點 a[L]（會整段被減去）：L = <span className="font-code text-[#1E4E8C]">{leftIdx}</span>
              </span>
              <input
                type="range"
                min={0}
                max={rightIdx - 1}
                value={leftIdx}
                onChange={(e) => setLeftIdx(Number(e.target.value))}
                className="mt-2 w-full accent-[#1E4E8C]"
              />
            </label>
            <label className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs">
              <span className="font-semibold text-[#525866]">
                右端點 a[R]：R = <span className="font-code text-[#1E4E8C]">{rightIdx}</span>
              </span>
              <input
                type="range"
                min={leftIdx + 1}
                max={100}
                value={rightIdx}
                onChange={(e) => setRightIdx(Number(e.target.value))}
                className="mt-2 w-full accent-[#1E4E8C]"
              />
            </label>
          </div>

          <div className="space-y-2 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
            <div className="flex items-center justify-between font-code text-xs">
              <span>a[{rightIdx}] = 1 + ... + {rightIdx}</span>
              <span className="font-semibold tabular-nums">{sumR}</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded bg-[#E2E0D8]">
              <div className="flex h-full" style={{ width: `${rightIdx}%` }}>
                <div
                  style={{ width: `${(leftIdx / rightIdx) * 100}%` }}
                  className="bg-[#9E9B90]/50 text-[10px] font-code text-[#17191C] flex items-center justify-center truncate"
                >
                  扣掉 1..{leftIdx}
                </div>
                <div className="flex-1 bg-[#1E4E8C] text-[10px] font-code text-white flex items-center justify-center truncate">
                  留下 {leftIdx + 1}..{rightIdx}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between pt-2 text-sm">
              <span className="text-[#525866]">
                <code className="font-code">
                  a[{rightIdx}] - a[{leftIdx}]
                </code>{" "}
                = 從 <strong>{leftIdx + 1}</strong> 加到 <strong>{rightIdx}</strong>（共{" "}
                {rightIdx - leftIdx} 項，不含 {leftIdx}）
              </span>
              <span className="font-code text-base font-bold text-[#1E4E8C] tabular-nums">
                {sumR} - {sumL} = {sumR - sumL}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
