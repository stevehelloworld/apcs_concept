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
    <div className="synth-panel-hard overflow-hidden">
      <div className="h-2 w-full bg-[#2563EB]" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4DAE4] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[#11151C]">
              <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-xs font-bold text-[#60A5FA]">
                LAB-02
              </span>
              <span>range 尺規與迴圈畫布</span>
            </h3>
            <p className="mt-1 text-xs text-[#4B5565]">
              即時檢驗左閉右開邊界、負步長倒數序列與星號等差規律
            </p>
          </div>

          <div className="synth-recess flex gap-1 p-1">
            <button
              type="button"
              onClick={() => setTab("ruler")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "ruler"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Ruler className="h-3.5 w-3.5" strokeWidth={2} />
              <span>range 邊界尺規</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("pyramid")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "pyramid"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q5 星號畫布</span>
            </button>
          </div>
        </div>

        {tab === "ruler" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#4B5565]">載入經典考題預設：</span>
              <button
                type="button"
                onClick={() => {
                  setStart(0);
                  setStop(101);
                  setStep(5);
                }}
                className="synth-pad px-2.5 py-1 font-code text-xs font-bold"
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
                className="synth-pad px-2.5 py-1 font-code text-xs font-bold"
              >
                Q26 仍少 1 次 (5, 100, 5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStart(0);
                  setStop(100);
                  setStep(5);
                }}
                className="synth-pad px-2.5 py-1 font-code text-xs font-bold"
              >
                Q26 正解 20 次 (0, 100, 5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStart(6);
                  setStop(0);
                  setStep(-1);
                }}
                className="synth-pad px-2.5 py-1 font-code text-xs font-bold"
              >
                Q19 負步長 (6, 0, -1)
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="synth-recess p-3 text-xs">
                <span className="block font-bold text-[#11151C]">start（起點，含）</span>
                <input
                  type="number"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-1.5 font-code text-sm font-bold text-[#11151C]"
                />
              </label>
              <label className="synth-recess p-3 text-xs">
                <span className="block font-bold text-[#11151C]">stop（終點，永遠不含）</span>
                <input
                  type="number"
                  value={stop}
                  onChange={(e) => setStop(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-1.5 font-code text-sm font-bold text-[#11151C]"
                />
              </label>
              <label className="synth-recess p-3 text-xs">
                <span className="block font-bold text-[#11151C]">step（步長，不可為 0）</span>
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border-[1.5px] border-[#C4CBD6] bg-white px-2.5 py-1.5 font-code text-sm font-bold text-[#11151C]"
                />
              </label>
            </div>

            <div className="synth-oled p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-code text-sm font-bold text-[#38BDF8]">
                  list(range({start}, {stop}, {step}))
                </span>
                <span className="rounded bg-[#1D4ED8] px-3 py-0.5 font-code text-xs font-bold text-white tabular-nums">
                  共執行 {items.length} 次
                </span>
              </div>
              {step === 0 ? (
                <p className="font-code text-xs font-bold text-[#FF6B7B]">
                  ValueError: range() arg 3 must not be zero
                </p>
              ) : items.length === 0 ? (
                <p className="font-code text-xs text-[#A8B6CC]">[]（空序列：執行 0 次）</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((num, idx) => (
                    <span
                      key={`${num}-${idx}`}
                      className="rounded-md border border-[#2B3548] bg-[#161B24] px-2.5 py-0.5 font-code text-xs font-bold text-[#4ADE80] tabular-nums"
                    >
                      {num}
                    </span>
                  ))}
                  <span
                    className="rounded-md border border-dashed border-[#69778F] px-2.5 py-0.5 font-code text-xs text-[#94A3B8] line-through tabular-nums"
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
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseFixedPyramid(false)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      !useFixedPyramid
                        ? "border-[#161A22] bg-[#C62828] text-white"
                        : "border-[#C4CBD6] bg-white text-[#4B5565]"
                    }`}
                  >
                    原錯碼：m = m + 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseFixedPyramid(true)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      useFixedPyramid
                        ? "border-[#161A22] bg-[#007A57] text-white"
                        : "border-[#C4CBD6] bg-white text-[#4B5565]"
                    }`}
                  >
                    只改第 7 行：m = m + 2
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-[#11151C]">
                  <span>列數：</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={rowLimit}
                    onChange={(e) => setRowLimit(Number(e.target.value))}
                    className="synth-slider w-24"
                  />
                  <span className="font-code tabular-nums">{rowLimit}</span>
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
              <div className="synth-oled p-4">
                <div className="mb-2 font-code text-xs text-[#94A3B8]">
                  OLED CANVAS // 金字塔輸出預覽
                </div>
                <div className="space-y-1 font-code text-sm">
                  {pyramidRows.map((r) => (
                    <div key={r.i} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-[#7A8AA3] tabular-nums">
                        i={r.i} k={r.k} m={r.m}
                      </span>
                      <pre className="text-[#FFB800] font-bold whitespace-pre">{r.line}</pre>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#4B5565]">
                空白數 k 從 4 遞減到 0 完全正確，唯一誤差在第 7 行每次星號數只加 1 而非加 2，所以最少只需修改 1 行。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
