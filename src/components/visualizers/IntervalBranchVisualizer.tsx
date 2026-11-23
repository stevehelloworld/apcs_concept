"use client";

import { useState } from "react";
import { Sliders, Split, ShieldAlert } from "lucide-react";
import { PythonCodeView } from "../PythonCodeView";

type TabKey = "q17" | "q27" | "q29";

const SCORE_CODE = `if s >= 90:
    print('A')
elif s >= 80:
    print('B')
elif s > 60:
    print('D')
elif s > 70:
    print('C')
else:
    print('F')`;

const DEADCODE_CODE = `def F(a):
    while a < 10:
        a = a + 5
    if a < 12:
        a = a + 2
    if a < 11:
        a = 5`;

const ELIF_BUG_CODE = `M, N = -1, 101
for x in A:
    if x > M:
        M = x
    elif x < N:
        N = x`;

const ELIF_FIXED_CODE = `M, N = -1, 101
for x in A:
    if x > M:
        M = x
    if x < N:
        N = x`;

function evalWrongGrade(s: number): { grade: string; hitLine: number; expected: string } {
  const expected =
    s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";
  if (s >= 90) return { grade: "A", hitLine: 2, expected };
  if (s >= 80) return { grade: "B", hitLine: 4, expected };
  if (s > 60) return { grade: "D", hitLine: 6, expected };
  if (s > 70) return { grade: "C", hitLine: 8, expected };
  return { grade: "F", hitLine: 10, expected };
}

export function IntervalBranchVisualizer() {
  const [tab, setTab] = useState<TabKey>("q17");
  const [score, setScore] = useState(74);
  const [initA, setInitA] = useState(5);
  const [datasetKey, setDatasetKey] = useState<"inc" | "mix" | "dec">("inc");

  const scoreEval = evalWrongGrade(score);
  const isScoreWrong = scoreEval.grade !== scoreEval.expected;

  // Q27 full simulation across [-5, 15]
  const loopSteps: number[] = [];
  let curA = initA;
  while (curA < 10) {
    curA += 5;
    loopSteps.push(curA);
  }
  const afterWhile = curA;
  const entersIf12 = afterWhile < 12;
  const afterStep2 = entersIf12 ? afterWhile + 2 : afterWhile;
  const entersIf11 = afterStep2 < 11;

  // Q29 simulation
  const datasets: Record<"inc" | "mix" | "dec", { label: string; arr: number[] }> = {
    inc: { label: "[80, 90, 100]（嚴格遞增）", arr: [80, 90, 100] },
    mix: { label: "[90, 80, 100]（先降後升）", arr: [90, 80, 100] },
    dec: { label: "[100, 90, 80]（嚴格遞減）", arr: [100, 90, 80] },
  };
  const arr = datasets[datasetKey].arr;

  // Compute buggy vs fixed trace
  let bugM = -1;
  let bugN = 101;
  const bugTrace = arr.map((x) => {
    let branch = "";
    if (x > bugM) {
      bugM = x;
      branch = "命中 if x > M（跳過 elif）";
    } else if (x < bugN) {
      bugN = x;
      branch = "進入 elif x < N";
    } else {
      branch = "兩者皆未觸發";
    }
    return { x, bugM, bugN, branch };
  });

  let fixM = -1;
  let fixN = 101;
  for (const x of arr) {
    if (x > fixM) fixM = x;
    if (x < fixN) fixN = x;
  }

  return (
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#17191C]">
            互動視覺化實驗室：分支覆蓋與區間推理
          </h3>
          <p className="text-xs text-[#525866]">
            切換三個交互實驗，直接觀察條件順序錯置、區間平移死碼與 elif 互斥的真實行為
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTab("q17")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
              tab === "q17"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866] hover:text-[#17191C]"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q17 數線區間遮蔽</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("q27")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
              tab === "q27"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866] hover:text-[#17191C]"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q27 區間平移死碼</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("q29")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
              tab === "q29"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866] hover:text-[#17191C]"
            }`}
          >
            <Split className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q29 if vs elif 對照</span>
          </button>
        </div>
      </div>

      {tab === "q17" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="score-slider" className="text-sm font-semibold text-[#17191C]">
                  拖動測試分數 <span className="font-code text-[#1E4E8C]">s = {score}</span>
                </label>
                <div className="flex gap-1.5">
                  {[59, 60, 65, 70, 75, 85, 95].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setScore(preset)}
                      className={`rounded px-2 py-0.5 font-code text-xs tabular-nums ${
                        score === preset
                          ? "bg-[#1E4E8C] text-white"
                          : "border border-[#E2E0D8] bg-white text-[#525866] hover:bg-[#EAF1FA]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="score-slider"
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full accent-[#1E4E8C]"
              />
            </div>

            {/* 0~100 Coverage Map */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#525866]">
                0 ~ 100 實際數線命中區域（紅色為錯判的 11 個分數：60 與 70~79）
              </div>
              <div className="flex h-10 w-full overflow-hidden rounded-md border border-[#E2E0D8] font-code text-xs font-medium">
                <div
                  style={{ width: "60%" }}
                  className="flex items-center justify-center bg-[#F0EFEA] text-[#525866] border-r border-[#E2E0D8]"
                  title="0~59 -> F (正確)"
                >
                  0..59 (F)
                </div>
                <div
                  style={{ width: "3%" }}
                  className="flex items-center justify-center bg-[#FCEEEE] text-[#C23535] border-r border-[#E2E0D8]"
                  title="60 -> 誤判 F (錯 1 個)"
                >
                  60
                </div>
                <div
                  style={{ width: "9%" }}
                  className="flex items-center justify-center bg-[#EAF6EF] text-[#157F4B] border-r border-[#E2E0D8]"
                  title="61~69 -> D (正確)"
                >
                  61..69
                </div>
                <div
                  style={{ width: "10%" }}
                  className="flex items-center justify-center bg-[#FCEEEE] text-[#C23535] border-r border-[#E2E0D8]"
                  title="70~79 -> 被 s>60 攔截誤判 D (錯 10 個)"
                >
                  70..79!
                </div>
                <div
                  style={{ width: "9%" }}
                  className="flex items-center justify-center bg-[#EAF1FA] text-[#1E4E8C] border-r border-[#E2E0D8]"
                  title="80~89 -> B (正確)"
                >
                  80..89
                </div>
                <div
                  style={{ width: "9%" }}
                  className="flex items-center justify-center bg-[#EAF1FA] text-[#1E4E8C]"
                  title="90~100 -> A (正確)"
                >
                  90..100
                </div>
              </div>

              <div
                className={`rounded-md border p-3 text-sm ${
                  isScoreWrong
                    ? "border-[#C23535]/40 bg-[#FCEEEE] text-[#C23535]"
                    : "border-[#157F4B]/30 bg-[#EAF6EF] text-[#157F4B]"
                }`}
              >
                <div className="font-semibold">
                  當 s = {score}：程式輸出「{scoreEval.grade}」／ 正確應為「{scoreEval.expected}」
                  {isScoreWrong ? "（判錯！）" : "（正確）"}
                </div>
                <p className="mt-1 text-xs text-[#17191C]">
                  {score === 60
                    ? "s == 60 不滿足 s > 60（缺少等號 >=），直接掉進 else 輸出 F。"
                    : score >= 70 && score <= 79
                    ? "s 在 70~79 之間時，上方第 5 行 elif s > 60 先成立，直接輸出 D 並跳過底下的 elif s > 70。"
                    : "此分數未受到上方條件錯置與嚴格大於號的影響。"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <PythonCodeView
              code={SCORE_CODE}
              activeLine={scoreEval.hitLine}
              deadLines={[7, 8]}
              caption="第 7-8 行 elif s > 70 永遠被第 5 行遮蔽"
              compact
            />
          </div>
        </div>
      )}

      {tab === "q27" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="init-a-slider" className="text-sm font-semibold text-[#17191C]">
                  測試任意初始整數（-5 .. 15）：
                  <span className="ml-1 font-code text-[#1E4E8C]">a = {initA}</span>
                </label>
              </div>
              <input
                id="init-a-slider"
                type="range"
                min={-5}
                max={15}
                value={initA}
                onChange={(e) => setInitA(Number(e.target.value))}
                className="w-full accent-[#1E4E8C]"
              />
              <p className="mt-2 text-xs text-[#525866]">
                注意兩個 <code className="font-code">if</code> 都在 <code className="font-code">while</code> 外層！跳出迴圈時必落入 <code className="font-code">a &gt;= 10</code>，經 <code className="font-code">+2</code> 平移後恆落入 <code className="font-code">[12, ∞)</code>。
              </p>
            </div>

            <div className="space-y-2 rounded-md border border-[#E2E0D8] bg-white p-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
                <span className="text-[#525866]">1. while a &lt; 10 執行歷程：</span>
                <span className="font-code font-semibold text-[#17191C]">
                  {loopSteps.length > 0 ? `${initA} → ${loopSteps.join(" → ")}` : `直接跳出（${initA} >= 10）`}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
                <span className="text-[#525866]">2. 離開 while 後（保證 ≥ 10）：</span>
                <span className="font-code font-semibold text-[#1E4E8C]">{afterWhile}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E2E0D8] pb-2">
                <span className="text-[#525866]">3. if a &lt; 12（加 2）後：</span>
                <span className="font-code font-semibold text-[#1E4E8C]">
                  {afterStep2} {entersIf12 ? "（觸發 +2）" : "（未觸發，因已 >= 12）"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#525866]">4. 到達 if a &lt; 11 時：</span>
                <span
                  className={`font-code font-semibold ${
                    entersIf11 ? "text-[#C23535]" : "text-[#157F4B]"
                  }`}
                >
                  {entersIf11 ? "True -> 執行 a = 5" : `False（${afterStep2} >= 12 > 11，永遠跳過）`}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <PythonCodeView
              code={DEADCODE_CODE}
              deadLines={[7]}
              caption="靜態區間推導目標：第 7 行 a = 5"
              compact
            />
          </div>
        </div>
      )}

      {tab === "q29" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#525866]">挑選測試列表 A：</span>
            {(Object.keys(datasets) as Array<"inc" | "mix" | "dec">).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDatasetKey(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ui-transition ${
                  datasetKey === key
                    ? "bg-[#1E4E8C] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866] hover:text-[#17191C]"
                }`}
              >
                {datasets[key].label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C23535]">
                  錯誤寫法：使用 elif（互斥跳過）
                </span>
                <span className="font-code text-xs font-semibold text-[#17191C]">
                  輸出：M = {bugM}, N = {bugN}
                </span>
              </div>
              <PythonCodeView code={ELIF_BUG_CODE} bugLines={[5]} compact />
              <div className="mt-2.5 space-y-1">
                {bugTrace.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded border border-[#E2E0D8] bg-white px-2.5 py-1 text-xs"
                  >
                    <span className="font-code text-[#17191C]">x={step.x}</span>
                    <span className="text-[#525866]">{step.branch}</span>
                    <span className="font-code tabular-nums text-[#1E4E8C]">
                      M={step.bugM}, N={step.bugN}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#157F4B]">
                  正確寫法：兩個獨立 if
                </span>
                <span className="font-code text-xs font-semibold text-[#157F4B]">
                  輸出：M = {fixM}, N = {fixN}
                </span>
              </div>
              <PythonCodeView code={ELIF_FIXED_CODE} compact />
              <div className="mt-3 rounded border border-[#157F4B]/30 bg-[#EAF6EF] p-3 text-xs leading-relaxed text-[#17191C]">
                {bugN !== fixN ? (
                  <>
                    <strong className="text-[#C23535]">成功抓到 Bug！</strong> 在嚴格遞增測資下，每輪都滿足{" "}
                    <code className="font-code">x &gt; M</code> 導致{" "}
                    <code className="font-code">elif x &lt; N</code> 一次也沒執行，N 停留在錯誤的初始值{" "}
                    <code className="font-code">101</code>。
                  </>
                ) : (
                  <>
                    這組測資在第一筆以後有出現比 M 小的數值，因此湊巧進到過{" "}
                    <code className="font-code">elif</code> 更新 N，這正是它能躲過一般測試的原因！
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
