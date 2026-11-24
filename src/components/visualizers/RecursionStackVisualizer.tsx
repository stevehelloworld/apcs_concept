"use client";

import { useState } from "react";
import { AlertTriangle, GitBranch, Layers } from "lucide-react";

type RecTab = "q8" | "q11" | "q16";

const Q8_EVENTS = [
  { stack: ["f1(1)"], phase: "去程", action: "f1(1) 印出 1，呼叫 f2(3)", output: ["1"] },
  { stack: ["f1(1)", "f2(3)"], phase: "去程", action: "f2(3) 印出 3，呼叫 f1(2)", output: ["1", "3"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)"], phase: "去程", action: "f1(2) 印出 2，呼叫 f2(4)", output: ["1", "3", "2"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)", "f2(4)"], phase: "觸底", action: "f2(4) 滿足 n>3，印出 4 並 return", output: ["1", "3", "2", "4"] },
  { stack: ["f1(1)", "f2(3)", "f1(2)"], phase: "回程", action: "回到 f1(2) 印出 2 後結束", output: ["1", "3", "2", "4", "2"] },
  { stack: ["f1(1)", "f2(3)"], phase: "回程", action: "回到 f2(3) 印出 3 後結束", output: ["1", "3", "2", "4", "2", "3"] },
  { stack: ["f1(1)"], phase: "回程", action: "回到 f1(1) 印出 1 後全部完成", output: ["1", "3", "2", "4", "2", "3", "1"] },
];

export function RecursionStackVisualizer() {
  const [tab, setTab] = useState<RecTab>("q8");
  const [q8Step, setQ8Step] = useState(0);
  const [q11Fix, setQ11Fix] = useState(false);
  const [q11N, setQ11N] = useState(4);
  const [q16Cond, setQ16Cond] = useState<3 | 2 | 1 | 0>(0);

  const q11Chain: string[] = [];
  for (let k = q11N; k >= 1; k--) {
    q11Chain.push(`${k} * fun(${k - 1})`);
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
    <div className="synth-panel-hard overflow-hidden">
      <div className="h-2 w-full bg-[#7C3AED]" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4DAE4] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[#11151C]">
              <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-xs font-bold text-[#C084FC]">
                LAB-04
              </span>
              <span>Call Stack 堆疊與建表儀器</span>
            </h3>
            <p className="mt-1 text-xs text-[#4B5565]">
              看懂遞迴去程／回程折返順序、Base Case 乘零陷阱與由小到大建表法
            </p>
          </div>

          <div className="synth-recess flex flex-wrap gap-1 p-1">
            <button
              type="button"
              onClick={() => setTab("q8")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q8"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q8 相互遞迴</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q11")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q11"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q11 乘零陷阱</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q16")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q16"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q16 自底建表</span>
            </button>
          </div>
        </div>

        {tab === "q8" && (
          <div className="space-y-4">
            <div className="synth-recess flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#161A22] px-2.5 py-0.5 font-code text-xs font-bold text-[#C084FC] tabular-nums">
                  STEP {q8Step + 1} / {Q8_EVENTS.length}
                </span>
                <span className="text-xs font-bold text-[#11151C]">{evt.phase}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Q8_EVENTS.length - 1}
                value={q8Step}
                onChange={(e) => setQ8Step(Number(e.target.value))}
                aria-label="遞迴堆疊步驟滑桿"
                className="synth-slider w-40 sm:w-56"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setQ8Step((s) => Math.max(0, s - 1))}
                  disabled={q8Step === 0}
                  className="synth-pad px-3 py-1 text-xs font-bold disabled:opacity-40"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={() => setQ8Step((s) => Math.min(Q8_EVENTS.length - 1, s + 1))}
                  disabled={q8Step >= Q8_EVENTS.length - 1}
                  className="rounded-lg border-[1.5px] border-[#161A22] bg-[#6D28D9] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
                >
                  下一步
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="synth-recess p-4">
                <div className="mb-2.5 font-code text-xs font-bold text-[#4B5565]">
                  CALL STACK // 頂端為正在執行的函式
                </div>
                <div className="flex flex-col-reverse gap-1.5">
                  {evt.stack.map((frame, i) => {
                    const isTop = i === evt.stack.length - 1;
                    return (
                      <div
                        key={frame}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 font-code text-xs ${
                          isTop
                            ? "border-[#161A22] bg-[#6D28D9] font-bold text-white"
                            : "border-[#C4CBD6] bg-white text-[#4B5565]"
                        }`}
                      >
                        <span>{frame}</span>
                        {isTop && (
                          <span className="rounded bg-[#161A22] px-1.5 py-0.5 text-[10px] text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[#D2BCFF] bg-[#F4EEFF] p-3.5">
                  <div className="mb-1 text-xs font-bold text-[#6D28D9]">當前步驟解說</div>
                  <p className="text-sm font-medium text-[#11151C]">{evt.action}</p>
                </div>
                <div className="synth-oled p-4">
                  <div className="mb-2.5 font-code text-xs text-[#94A3B8]">
                    對稱輸出軌跡（f1 共 2 次，f2 共 2 次）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {evt.output.map((val, idx) => (
                      <span
                        key={idx}
                        className={`rounded-lg px-3 py-1 font-display text-sm font-bold ${
                          idx < 3
                            ? "bg-[#2563EB] text-white"
                            : idx === 3
                            ? "bg-[#007A57] text-white"
                            : "bg-[#D93B09] text-white"
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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQ11Fix(false)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    !q11Fix
                      ? "border-[#161A22] bg-[#C62828] text-white"
                      : "border-[#C4CBD6] bg-white text-[#4B5565]"
                  }`}
                >
                  原碼：if n &gt;= 0:
                </button>
                <button
                  type="button"
                  onClick={() => setQ11Fix(true)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    q11Fix
                      ? "border-[#161A22] bg-[#007A57] text-white"
                      : "border-[#C4CBD6] bg-white text-[#4B5565]"
                  }`}
                >
                  修正：if n &gt; 0:
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#11151C]">
                <span>fun(n) 中 n =</span>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={q11N}
                  onChange={(e) => setQ11N(Number(e.target.value))}
                  className="synth-slider w-28"
                />
                <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-white tabular-nums">
                  {q11N}
                </span>
              </label>
            </div>

            <div className="synth-oled p-4 space-y-2.5">
              <div className="font-code text-xs text-[#94A3B8]">
                TRACE // 完整乘積展開鏈
              </div>
              <div className="flex flex-wrap items-center gap-2 font-code text-xs">
                {q11Chain.map((item, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-[#2B3548] bg-[#161B24] px-2.5 py-1 text-[#EEF2F8]"
                  >
                    {item}
                  </span>
                ))}
                {!q11Fix ? (
                  <>
                    <span className="rounded-lg border border-[#FF4757] bg-[#FF4757]/20 px-2.5 py-1 font-bold text-[#FF8A8A]">
                      fun(0) = 0 * fun(-1)
                    </span>
                    <span className="rounded-lg border border-[#2B3548] bg-[#161B24] px-2.5 py-1 text-[#94A3B8]">
                      fun(-1) = 1
                    </span>
                  </>
                ) : (
                  <span className="rounded-lg border border-[#00C48C] bg-[#00C48C]/20 px-2.5 py-1 font-bold text-[#00E5A0]">
                    fun(0) 直接回傳 1
                  </span>
                )}
                <span className="ml-1 font-display text-lg font-bold text-[#FFB800]">
                  = {q11Result}
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === "q16" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#4B5565]">
                切換 &lt;condition&gt; 讓 F(7) 命中目標 12：
              </span>
              {([3, 2, 1, 0] as const).map((condVal) => (
                <button
                  key={condVal}
                  type="button"
                  onClick={() => setQ16Cond(condVal)}
                  className={`rounded-lg border px-3 py-1.5 font-code text-xs font-bold ${
                    q16Cond === condVal
                      ? "border-[#161A22] bg-[#6D28D9] text-white"
                      : "border-[#C4CBD6] bg-white text-[#11151C]"
                  }`}
                >
                  a &lt; {condVal}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#C4CBD6]">
              <table className="w-full border-collapse text-center font-code text-xs tabular-nums">
                <thead>
                  <tr className="bg-[#161A22] text-white">
                    <th className="border-r border-[#2B3548] px-2.5 py-2">a</th>
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => (
                      <th key={a} className="border-r border-[#2B3548] last:border-r-0 px-2 py-2">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-r border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-2.5 font-bold">
                      F(a)
                    </td>
                    {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => {
                      const isBase = a < q16Cond;
                      const isTarget = a === 7;
                      return (
                        <td
                          key={a}
                          className={`border-r border-[#C4CBD6] last:border-r-0 px-2 py-2.5 font-bold ${
                            isTarget
                              ? dp[a] === 12
                                ? "bg-[#E6FAF3] text-[#007A57]"
                                : "bg-[#FDECEC] text-[#C62828]"
                              : isBase
                              ? "bg-[#F4EEFF] text-[#6D28D9]"
                              : "bg-white text-[#11151C]"
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

            <p className="text-xs text-[#4B5565]">
              紫底為 Base Case（直接回傳 1）；其餘皆等於{" "}
              <code className="font-code font-bold">F(a-2) + F(a-3)</code>。只有{" "}
              <code className="font-code font-bold">a &lt; 0</code> 會得到{" "}
              <strong className="text-[#007A57]">F(7) = 12</strong>。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
