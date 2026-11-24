"use client";

import { useState } from "react";
import { AlertTriangle, GitBranch, Layers } from "lucide-react";

type RecTab = "q8" | "q11" | "q16";

const Q8_EVENTS = [
  { stack: ["f1(1)"], phase: "去程", action: "f1(1) 印 1，呼叫 f2(3)", output: ["1"] },
  { stack: ["f1(1)", "f2(3)"], phase: "去程", action: "f2(3) 印 3，呼叫 f1(2)", output: ["1", "3"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)"], phase: "去程", action: "f1(2) 印 2，呼叫 f2(4)", output: ["1", "3", "2"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)", "f2(4)"], phase: "觸底", action: "f2(4) > 3，印 4 回傳", output: ["1", "3", "2", "4"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)"], phase: "回程", action: "回 f1(2) 印 2", output: ["1", "3", "2", "4", "2"] },
  { stack: ["f1(1)", "f2(3)"], phase: "回程", action: "回 f2(3) 印 3", output: ["1", "3", "2", "4", "2", "3"] },
  { stack: ["f1(1)"], phase: "回程", action: "回 f1(1) 印 1 完成", output: ["1", "3", "2", "4", "2", "3", "1"] },
];

export function RecursionStackVisualizer() {
  const [tab, setTab] = useState<RecTab>("q8");
  const [q8Step, setQ8Step] = useState(0);
  const [q11Fix, setQ11Fix] = useState(false);
  const [q11N, setQ11N] = useState(4);
  const [q16Cond, setQ16Cond] = useState<3 | 2 | 1 | 0>(0);

  const q11Chain: string[] = [];
  for (let k = q11N; k >= 1; k--) {
    q11Chain.push(`${k}*fun(${k - 1})`);
  }
  const q11Result = (() => {
    let ans = 1;
    for (let k = 1; k <= q11N; k++) ans *= k;
    return q11Fix ? ans : 0;
  })();

  const dp: Record<number, number> = {};
  for (let a = -3; a <= 7; a++) {
    dp[a] = a < q16Cond ? 1 : dp[a - 2] + dp[a - 3];
  }

  const evt = Q8_EVENTS[q8Step];

  return (
    <div className="rail-frame overflow-hidden">
      <div className="h-1 w-full bg-[#FFC20E]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#FFC20E] px-2 py-0.5 font-code text-xs font-bold text-[#0B1230]">
              L4
            </span>
            <h3 className="text-sm font-black text-white">遞迴堆疊與建表</h3>
          </div>

          <div className="rail-well flex flex-wrap gap-1 p-0.5">
            <button
              type="button"
              onClick={() => setTab("q8")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q8"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q8 堆疊</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q11")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q11"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q11 乘零</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q16")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q16"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q16 建表</span>
            </button>
          </div>
        </div>

        {tab === "q8" && (
          <div className="space-y-3.5">
            <div className="rail-well flex flex-wrap items-center justify-between gap-2.5 p-2.5">
              <div className="flex items-center gap-2 font-code text-xs">
                <span className="font-bold text-[#FFD452] tabular-nums">
                  {q8Step + 1}/{Q8_EVENTS.length}
                </span>
                <span className="font-bold text-white">{evt.phase}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Q8_EVENTS.length - 1}
                value={q8Step}
                onChange={(e) => setQ8Step(Number(e.target.value))}
                aria-label="遞迴步驟滑桿"
                className="rail-slider w-36 sm:w-52"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setQ8Step((s) => Math.max(0, s - 1))}
                  disabled={q8Step === 0}
                  className="rail-btn px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setQ8Step((s) => Math.min(Q8_EVENTS.length - 1, s + 1))}
                  disabled={q8Step >= Q8_EVENTS.length - 1}
                  className="rail-btn-cobalt px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                >
                  下一步
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rail-well p-3.5 space-y-2">
                <div className="font-code text-[11px] font-bold text-[#7E91B8]">
                  CALL STACK
                </div>
                <div className="flex flex-col-reverse gap-1.5">
                  {evt.stack.map((frame, i) => {
                    const isTop = i === evt.stack.length - 1;
                    return (
                      <div
                        key={frame}
                        className={`flex items-center justify-between rounded border px-3 py-1.5 font-code text-xs ${
                          isTop
                            ? "border-[#FFC20E] bg-[#FFC20E]/18 font-bold text-[#FFD452]"
                            : "border-white/15 bg-[#0B1230] text-[#B8C5E0]"
                        }`}
                      >
                        <span>{frame}</span>
                        {isTop && <span className="text-[10px]">ACTIVE</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rail-plate p-3">
                  <p className="text-xs font-bold text-white">{evt.action}</p>
                </div>
                <div className="rail-well p-3.5 space-y-2">
                  <div className="font-code text-[11px] text-[#7E91B8]">STDOUT</div>
                  <div className="flex flex-wrap gap-1.5">
                    {evt.output.map((val, idx) => (
                      <span
                        key={idx}
                        className={`rounded px-2.5 py-1 font-display text-sm font-bold ${
                          idx < 3
                            ? "bg-[#1E5BFF] text-white"
                            : idx === 3
                            ? "bg-[#168A3B] text-white"
                            : "bg-[#E21D2D] text-white"
                        }`}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "q11" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setQ11Fix(false)}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    !q11Fix
                      ? "bg-[#E21D2D] text-white"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  if n &gt;= 0 (錯)
                </button>
                <button
                  type="button"
                  onClick={() => setQ11Fix(true)}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    q11Fix
                      ? "bg-[#168A3B] text-white"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  if n &gt; 0 (正)
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="font-code">n =</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={q11N}
                  onChange={(e) => setQ11N(Number(e.target.value))}
                  className="rail-slider w-24"
                />
                <span className="font-code tabular-nums">{q11N}</span>
              </label>
            </div>

            <div className="rail-well p-3.5">
              <div className="flex flex-wrap items-center gap-1.5 font-code text-xs">
                {q11Chain.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded border border-white/20 bg-[#0B1230] px-2 py-1 text-white"
                  >
                    {item}
                  </span>
                ))}
                {!q11Fix ? (
                  <span className="rounded border border-[#E21D2D]/60 bg-[#E21D2D]/18 px-2 py-1 font-bold text-[#FF7A85]">
                    fun(0) = 0 * fun(-1)
                  </span>
                ) : (
                  <span className="rounded border border-[#22B14C]/60 bg-[#22B14C]/18 px-2 py-1 font-bold text-[#4ADE80]">
                    fun(0) = 1
                  </span>
                )}
                <span className="ml-1 font-display text-lg font-extrabold text-[#FFD452]">
                  = {q11Result}
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === "q16" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-code text-xs text-[#7E91B8]">條件:</span>
              {([3, 2, 1, 0] as const).map((condVal) => (
                <button
                  key={condVal}
                  type="button"
                  onClick={() => setQ16Cond(condVal)}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    q16Cond === condVal
                      ? "bg-[#FFC20E] text-[#0B1230]"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  a &lt; {condVal}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded border border-white/20">
              <table className="w-full border-collapse text-center font-code text-xs tabular-nums">
                <thead>
                  <tr className="bg-[#070C22] text-[#B8C5E0]">
                    <th className="border-r border-white/15 px-2 py-1.5">a</th>
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => (
                      <th
                        key={a}
                        className="border-r border-white/15 last:border-r-0 px-2 py-1.5"
                      >
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/15">
                    <td className="border-r border-white/15 bg-[#070C22] px-2 py-2 font-bold text-white">
                      F(a)
                    </td>
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => {
                      const isBase = a < q16Cond;
                      const isTarget = a === 7;
                      return (
                        <td
                          key={a}
                          className={`border-r border-white/15 last:border-r-0 px-2 py-2 font-bold ${
                            isTarget
                              ? dp[a] === 12
                                ? "bg-[#22B14C]/22 text-[#4ADE80]"
                                : "bg-[#E21D2D]/22 text-[#FF7A85]"
                              : isBase
                              ? "bg-[#FFC20E]/18 text-[#FFD452]"
                              : "bg-[#0B1230] text-white"
                          }`}
                        >
                          {dp[a]}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
