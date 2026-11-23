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

  // Q11 computation
  const q11Chain: string[] = [];
  for (let k = q11N; k >= 1; k--) {
    q11Chain.push(`${k} * fun(${k - 1})`);
  }
  const q11Result = (() => {
    let ans = 1;
    for (let k = 1; k <= q11N; k++) ans *= k;
    return q11Fix ? ans : 0;
  })();

  // Q16 bottom-up DP table from a = -3..7
  const dp: Record<number, number> = {};
  for (let a = -3; a <= 7; a++) {
    dp[a] = a < q16Cond ? 1 : dp[a - 2] + dp[a - 3];
  }

  const evt = Q8_EVENTS[q8Step];

  return (
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#17191C]">
            互動視覺化實驗室：呼叫堆疊、Base Case 與自底向上建表
          </h3>
          <p className="text-xs text-[#525866]">
            區分遞迴展開與折返順序，並練習將分支遞迴轉換為零失誤的考場表格
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTab("q8")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "q8"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q8 相互遞迴堆疊</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("q11")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "q11"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q11 Base Case 乘零實驗</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("q16")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "q16"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q16 自底向上建表</span>
          </button>
        </div>
      </div>

      {tab === "q8" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-[#525866] tabular-nums">
              步驟 {q8Step + 1} / {Q8_EVENTS.length}（{evt.phase}）
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setQ8Step((s) => Math.max(0, s - 1))}
                disabled={q8Step === 0}
                className="rounded border border-[#E2E0D8] px-3 py-1 text-xs disabled:opacity-40"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={() => setQ8Step((s) => Math.min(Q8_EVENTS.length - 1, s + 1))}
                disabled={q8Step >= Q8_EVENTS.length - 1}
                className="rounded bg-[#1E4E8C] px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
              >
                下一步
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
              <div className="mb-2 text-xs font-semibold text-[#525866]">
                目前 Call Stack（頂端為正在執行的函式）
              </div>
              <div className="flex flex-col-reverse gap-1.5">
                {evt.stack.map((frame, i) => (
                  <div
                    key={frame}
                    className={`rounded border px-3 py-2 font-code text-xs ${
                      i === evt.stack.length - 1
                        ? "border-[#1E4E8C] bg-[#EAF1FA] font-semibold text-[#1E4E8C]"
                        : "border-[#E2E0D8] bg-white text-[#525866]"
                    }`}
                  >
                    {frame}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-[#E2E0D8] bg-white p-3.5">
                <div className="mb-1 text-xs font-semibold text-[#1E4E8C]">當前動作</div>
                <p className="text-sm text-[#17191C]">{evt.action}</p>
              </div>
              <div className="rounded-md border border-[#252C3A] bg-[#141820] p-3.5">
                <div className="mb-2 font-code text-xs text-[#9AA5CE]">
                  對稱輸出軌跡（f1 共 2 次，f2 共 2 次）
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {evt.output.map((val, idx) => (
                    <span
                      key={idx}
                      className={`rounded px-2.5 py-1 font-code text-xs font-semibold ${
                        idx < 3
                          ? "bg-[#1E4E8C] text-white"
                          : idx === 3
                          ? "bg-[#157F4B] text-white"
                          : "bg-[#B4690E] text-white"
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setQ11Fix(false)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  !q11Fix
                    ? "bg-[#C23535] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                原碼：if n &gt;= 0:
              </button>
              <button
                type="button"
                onClick={() => setQ11Fix(true)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  q11Fix
                    ? "bg-[#157F4B] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                修正：if n &gt; 0:
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#525866]">
              <span>計算 fun(n)：n =</span>
              <input
                type="range"
                min={1}
                max={6}
                value={q11N}
                onChange={(e) => setQ11N(Number(e.target.value))}
                className="w-24 accent-[#1E4E8C]"
              />
              <span className="font-code font-semibold tabular-nums">{q11N}</span>
            </label>
          </div>

          <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
            <div className="mb-2 text-xs font-semibold text-[#525866]">完整乘積展開鏈</div>
            <div className="flex flex-wrap items-center gap-2 font-code text-xs">
              {q11Chain.map((item, idx) => (
                <span key={idx} className="rounded border border-[#E2E0D8] bg-white px-2 py-1">
                  {item}
                </span>
              ))}
              {!q11Fix ? (
                <>
                  <span className="rounded border border-[#C23535] bg-[#FCEEEE] px-2 py-1 font-semibold text-[#C23535]">
                    fun(0) = 0 * fun(-1)
                  </span>
                  <span className="rounded border border-[#E2E0D8] bg-white px-2 py-1">
                    fun(-1) = 1
                  </span>
                </>
              ) : (
                <span className="rounded border border-[#157F4B] bg-[#EAF6EF] px-2 py-1 font-semibold text-[#157F4B]">
                  fun(0) 直接回傳 1
                </span>
              )}
              <span className="text-sm font-bold text-[#17191C]">= {q11Result}</span>
            </div>
          </div>
        </div>
      )}

      {tab === "q16" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#525866]">
              套用選項到 &lt;condition&gt; 觀察 F(7) 結果（題目目標 = 12）：
            </span>
            {([3, 2, 1, 0] as const).map((condVal) => (
              <button
                key={condVal}
                type="button"
                onClick={() => setQ16Cond(condVal)}
                className={`rounded-md px-3 py-1.5 font-code text-xs font-medium ${
                  q16Cond === condVal
                    ? "bg-[#1E4E8C] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                a &lt; {condVal}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center font-code text-xs tabular-nums">
              <thead>
                <tr className="bg-[#F0EFEA] text-[#525866]">
                  <th className="border border-[#E2E0D8] px-2 py-1.5">a</th>
                  {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => (
                    <th key={a} className="border border-[#E2E0D8] px-2 py-1.5">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#E2E0D8] bg-[#F7F6F2] px-2 py-2 font-semibold">
                    F(a)
                  </td>
                  {[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((a) => {
                    const isBase = a < q16Cond;
                    const isTarget = a === 7;
                    return (
                      <td
                        key={a}
                        className={`border border-[#E2E0D8] px-2 py-2 font-semibold ${
                          isTarget
                            ? dp[a] === 12
                              ? "bg-[#EAF6EF] text-[#157F4B]"
                              : "bg-[#FCEEEE] text-[#C23535]"
                            : isBase
                            ? "bg-[#EAF1FA] text-[#1E4E8C]"
                            : "bg-white text-[#17191C]"
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
          <p className="text-xs text-[#525866]">
            藍底為 Base Case（直接回傳 1）；其餘每格皆等於前第 2 格與前第 3 格相加（
            <code className="font-code">F(a) = F(a-2) + F(a-3)</code>）。只有{" "}
            <code className="font-code">a &lt; 0</code> 會算出 <strong className="text-[#157F4B]">F(7) = 12</strong>。
          </p>
        </div>
      )}
    </div>
  );
}
