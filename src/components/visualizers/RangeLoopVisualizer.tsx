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
    <div className="rail-frame overflow-hidden">
      <div className="h-1 w-full bg-[#1E5BFF]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#1E5BFF] px-2 py-0.5 font-code text-xs font-bold text-white">
              L2
            </span>
            <h3 className="text-sm font-black text-white">range 尺規</h3>
          </div>

          <div className="rail-well flex gap-1 p-0.5">
            <button
              type="button"
              onClick={() => setTab("ruler")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "ruler"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Ruler className="h-3.5 w-3.5" strokeWidth={2} />
              <span>邊界尺規</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("pyramid")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "pyramid"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q5 星號</span>
            </button>
          </div>
        </div>

        {tab === "ruler" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStart(0);
                  setStop(101);
                  setStep(5);
                }}
                className="rail-btn px-2.5 py-1 font-code text-xs font-bold"
              >
                Q26 (0,101,5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStart(5);
                  setStop(100);
                  setStep(5);
                }}
                className="rail-btn px-2.5 py-1 font-code text-xs font-bold"
              >
                Q26 (5,100,5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStart(0);
                  setStop(100);
                  setStep(5);
                }}
                className="rail-btn px-2.5 py-1 font-code text-xs font-bold"
              >
                Q26 正解 (0,100,5)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStart(6);
                  setStop(0);
                  setStep(-1);
                }}
                className="rail-btn px-2.5 py-1 font-code text-xs font-bold"
              >
                Q19 (6,0,-1)
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="rail-well p-3 text-xs">
                <span className="block font-code font-bold text-[#B8C5E0]">start</span>
                <input
                  type="number"
                  value={start}
                  onChange={(e) => setStart(Number(e.target.value))}
                  className="rail-input mt-1.5 w-full px-2.5 py-1.5 font-code text-sm font-bold"
                />
              </label>
              <label className="rail-well p-3 text-xs">
                <span className="block font-code font-bold text-[#B8C5E0]">stop (不含)</span>
                <input
                  type="number"
                  value={stop}
                  onChange={(e) => setStop(Number(e.target.value))}
                  className="rail-input mt-1.5 w-full px-2.5 py-1.5 font-code text-sm font-bold"
                />
              </label>
              <label className="rail-well p-3 text-xs">
                <span className="block font-code font-bold text-[#B8C5E0]">step</span>
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                  className="rail-input mt-1.5 w-full px-2.5 py-1.5 font-code text-sm font-bold"
                />
              </label>
            </div>

            <div className="rail-well p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-code text-xs font-bold text-[#7AA4FF]">
                  range({start}, {stop}, {step})
                </span>
                <span className="rounded bg-[#1E5BFF] px-2.5 py-0.5 font-code text-xs font-bold text-white tabular-nums">
                  {items.length} 次
                </span>
              </div>
              {step === 0 ? (
                <p className="font-code text-xs font-bold text-[#FF7A85]">
                  ValueError: step 不能為 0
                </p>
              ) : items.length === 0 ? (
                <p className="font-code text-xs text-[#7E91B8]">[] (0 次)</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((num, idx) => (
                    <span
                      key={`${num}-${idx}`}
                      className="rounded border border-white/20 bg-[#111B45] px-2 py-0.5 font-code text-xs font-bold text-[#4ADE80] tabular-nums"
                    >
                      {num}
                    </span>
                  ))}
                  <span className="rounded border border-dashed border-white/25 px-2 py-0.5 font-code text-xs text-[#7E91B8] line-through tabular-nums">
                    {stop}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "pyramid" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUseFixedPyramid(false)}
                    className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                      !useFixedPyramid
                        ? "bg-[#E21D2D] text-white"
                        : "border border-white/20 text-[#B8C5E0]"
                    }`}
                  >
                    m = m + 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseFixedPyramid(true)}
                    className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                      useFixedPyramid
                        ? "bg-[#168A3B] text-white"
                        : "border border-white/20 text-[#B8C5E0]"
                    }`}
                  >
                    m = m + 2 (正解)
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-white">
                  <span>列</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={rowLimit}
                    onChange={(e) => setRowLimit(Number(e.target.value))}
                    className="rail-slider w-24"
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

            <div className="lg:col-span-6 space-y-2.5">
              <div className="rail-well p-3.5 space-y-1 font-code text-sm">
                <div className="mb-1.5 text-[11px] text-[#7E91B8]">STDOUT</div>
                {pyramidRows.map((r) => (
                  <div key={r.i} className="flex items-center gap-3">
                    <span className="w-24 text-[11px] text-[#7E91B8] tabular-nums">
                      i={r.i} k={r.k} m={r.m}
                    </span>
                    <pre className="text-[#FFD452] font-bold whitespace-pre">{r.line}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
