"use client";

import { useState } from "react";
import { Grid3X3, Ruler } from "lucide-react";
import { PythonCodeView } from "../PythonCodeView";

export function RangeLoopVisualizer() {
  const [tab, setTab] = useState<"ruler" | "pyramid">("ruler");
  const [start, setStart] = useState(0);
  const [stop, setStop] = useState(100);
  const [step, setStep] = useState(5);

  const [useFixedPyramid, setUseFixedPyramid] = useState(false);
  const [rowLimit, setRowLimit] = useState(5);

  // Compute range sequence safely (cap display at 60 items)
  const items: number[] = [];
  if (step !== 0) {
    if (step > 0) {
      for (let x = start; x < stop && items.length < 100; x += step) {
        items.push(x);
      }
    } else {
      for (let x = start; x > stop && items.length < 100; x += step) {
        items.push(x);
      }
    }
  }

  const pyramidRows = Array.from({ length: rowLimit }, (_, i) => {
    const spaces = 4 - i;
    const stars = useFixedPyramid ? 1 + i * 2 : 1 + i;
    return { i, k: spaces, m: stars, line: " ".repeat(spaces) + "*".repeat(stars) };
  });

  return (
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#17191C]">
            互動視覺化實驗室：range 尺規與迴圈畫布
          </h3>
          <p className="text-xs text-[#525866]">
            即時檢驗左閉右開邊界、負步長序列與巢狀星號等差規律
          </p>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setTab("ruler")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
              tab === "ruler"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>range(start, stop, step) 尺規</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("pyramid")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
              tab === "pyramid"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q5 星號金字塔對照畫布</span>
          </button>
        </div>
      </div>

      {tab === "ruler" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#525866]">快速載入考題設定：</span>
            <button
              type="button"
              onClick={() => {
                setStart(0);
                setStop(101);
                setStep(5);
              }}
              className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 font-code text-xs hover:bg-[#EAF1FA]"
            >
              Q26 原錯碼 (0, 101, 5)
            </button>
            <button
              type="button"
              onClick={() => {
                setStart(5);
                setStop(100);
                setStep(5);
              }}
              className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 font-code text-xs hover:bg-[#EAF1FA]"
            >
              Q26 仍錯誤 (5, 100, 5)
            </button>
            <button
              type="button"
              onClick={() => {
                setStart(0);
                setStop(100);
                setStep(5);
              }}
              className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 font-code text-xs hover:bg-[#EAF1FA]"
            >
              Q26 正確 20 次 (0, 100, 5)
            </button>
            <button
              type="button"
              onClick={() => {
                setStart(6);
                setStop(0);
                setStep(-1);
              }}
              className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 font-code text-xs hover:bg-[#EAF1FA]"
            >
              Q19 負步長 (6, 0, -1)
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs">
              <span className="block font-semibold text-[#525866]">start（起點，包含）</span>
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="mt-1.5 w-full rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 font-code text-sm text-[#17191C]"
              />
            </label>
            <label className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs">
              <span className="block font-semibold text-[#525866]">stop（終點，永遠不含）</span>
              <input
                type="number"
                value={stop}
                onChange={(e) => setStop(Number(e.target.value))}
                className="mt-1.5 w-full rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 font-code text-sm text-[#17191C]"
              />
            </label>
            <label className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3 text-xs">
              <span className="block font-semibold text-[#525866]">step（步長，不可為 0）</span>
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(Number(e.target.value))}
                className="mt-1.5 w-full rounded border border-[#E2E0D8] bg-white px-2.5 py-1.5 font-code text-sm text-[#17191C]"
              />
            </label>
          </div>

          <div className="rounded-md border border-[#252C3A] bg-[#141820] p-4 text-white">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-code text-sm text-[#7DCFFF]">
                list(range({start}, {stop}, {step}))
              </span>
              <span className="rounded bg-[#1E4E8C] px-2.5 py-0.5 font-code text-xs font-semibold tabular-nums">
                共執行 {items.length} 次
              </span>
            </div>
            {step === 0 ? (
              <p className="font-code text-xs text-[#F7768E]">
                ValueError: range() arg 3 must not be zero
              </p>
            ) : items.length === 0 ? (
              <p className="font-code text-xs text-[#9AA5CE]">[]（空序列：執行 0 次）</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {items.map((num, idx) => (
                  <span
                    key={`${num}-${idx}`}
                    className="rounded border border-[#2F3A4D] bg-[#1B202B] px-2 py-0.5 font-code text-xs text-[#9ECE6A] tabular-nums"
                  >
                    {num}
                  </span>
                ))}
                <span
                  className="rounded border border-dashed border-[#647087] px-2 py-0.5 font-code text-xs text-[#647087] line-through tabular-nums"
                  title="stop 邊界值永遠不被包含"
                >
                  {stop} (不含)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "pyramid" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setUseFixedPyramid(false)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    !useFixedPyramid
                      ? "bg-[#C23535] text-white"
                      : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                  }`}
                >
                  原錯碼：m = m + 1
                </button>
                <button
                  type="button"
                  onClick={() => setUseFixedPyramid(true)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    useFixedPyramid
                      ? "bg-[#157F4B] text-white"
                      : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                  }`}
                >
                  只改第 7 行：m = m + 2
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs text-[#525866]">
                <span>列數：</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={rowLimit}
                  onChange={(e) => setRowLimit(Number(e.target.value))}
                  className="w-24 accent-[#1E4E8C]"
                />
                <span className="font-code font-semibold tabular-nums">{rowLimit}</span>
              </label>
            </div>

            <PythonCodeView
              code={`k = 4\nm = 1\nfor i in range(5):\n    print(' ' * k, end = '')\n    print('*' * m)\n    k = k - 1\n    m = m + ${useFixedPyramid ? "2" : "1"}`}
              bugLines={useFixedPyramid ? [] : [7]}
              activeLine={7}
              compact
            />
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="rounded-md border border-[#252C3A] bg-[#141820] p-4">
              <div className="mb-2 font-code text-xs text-[#9AA5CE]">輸出畫布預覽</div>
              <div className="space-y-1 font-code text-sm">
                {pyramidRows.map((r) => (
                  <div key={r.i} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-[#647087] tabular-nums">
                      i={r.i} k={r.k} m={r.m}
                    </span>
                    <pre className="text-[#F6C177] whitespace-pre">{r.line}</pre>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#525866]">
              觀察每列空白數 k 從 4 遞減到 0 完全正確，唯一誤差在第 7 行星號數只加 1 而非加 2，故最少只要改 1 行程式碼。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
