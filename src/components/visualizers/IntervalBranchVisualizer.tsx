"use client";

import { useState } from "react";
import { ShieldAlert, Sliders, Split } from "lucide-react";
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

function evalWrongGrade(s: number): {
  grade: string;
  hitLine: number;
  expected: string;
} {
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

  const datasets: Record<"inc" | "mix" | "dec", { label: string; arr: number[] }> = {
    inc: { label: "[80, 90, 100]", arr: [80, 90, 100] },
    mix: { label: "[90, 80, 100]", arr: [90, 80, 100] },
    dec: { label: "[100, 90, 80]", arr: [100, 90, 80] },
  };
  const arr = datasets[datasetKey].arr;

  let bugM = -1;
  let bugN = 101;
  const bugTrace = arr.map((x) => {
    let branch = "";
    if (x > bugM) {
      bugM = x;
      branch = "if x > M (跳過 elif)";
    } else if (x < bugN) {
      bugN = x;
      branch = "elif x < N";
    } else {
      branch = "未觸發";
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
    <div className="rail-frame overflow-hidden">
      <div className="h-1 w-full bg-[#E21D2D]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#E21D2D] px-2 py-0.5 font-code text-xs font-bold text-white">
              L1
            </span>
            <h3 className="text-sm font-black text-white">分支示波器</h3>
          </div>

          <div className="rail-well flex flex-wrap gap-1 p-0.5">
            <button
              type="button"
              onClick={() => setTab("q17")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q17"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q17 遮蔽</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q27")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q27"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q27 死碼</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q29")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "q29"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Split className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q29 elif</span>
            </button>
          </div>
        </div>

        {tab === "q17" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-3.5">
              <div className="rail-well p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="score-slider" className="text-xs font-bold text-white">
                    s = <span className="font-code text-[#FF7A85]">{score}</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[59, 60, 65, 70, 75, 85, 95].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setScore(preset)}
                        className={`rounded px-2 py-0.5 font-code text-xs font-bold tabular-nums ui-transition ${
                          score === preset
                            ? "bg-[#E21D2D] text-white"
                            : "border border-white/20 text-[#B8C5E0] hover:text-white"
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
                  className="rail-slider w-full"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-code text-[11px] font-bold">
                {[
                  { range: "0..59", out: "F", active: score <= 59, err: false },
                  { range: "60", out: "誤 F", active: score === 60, err: true },
                  { range: "61..69", out: "D", active: score >= 61 && score <= 69, err: false },
                  { range: "70..79", out: "誤 D", active: score >= 70 && score <= 79, err: true },
                  { range: "80..89", out: "B", active: score >= 80 && score <= 89, err: false },
                  { range: "90..100", out: "A", active: score >= 90, err: false },
                ].map((zone) => (
                  <div
                    key={zone.range}
                    className={`rounded border px-2 py-2 text-center ui-transition ${
                      zone.err
                        ? "border-[#E21D2D]/55 bg-[#E21D2D]/18 text-[#FF7A85]"
                        : "border-white/20 bg-[#070C22] text-[#B8C5E0]"
                    } ${zone.active ? "ring-2 ring-white" : ""}`}
                  >
                    <div>{zone.range}</div>
                    <div className="mt-0.5 text-[10px]">{zone.out}</div>
                  </div>
                ))}
              </div>

              <div
                className={`rounded border p-3 text-xs ${
                  isScoreWrong
                    ? "border-[#E21D2D]/55 bg-[#E21D2D]/15 text-[#FF7A85]"
                    : "border-[#22B14C]/55 bg-[#22B14C]/15 text-[#4ADE80]"
                }`}
              >
                <div className="font-bold">
                  輸出「{scoreEval.grade}」／ 應為「{scoreEval.expected}」
                  {isScoreWrong ? "（誤判）" : "（正確）"}
                </div>
                <p className="mt-1 text-[#B8C5E0]">
                  {score === 60
                    ? "s == 60 漏掉 >= 落入 else。"
                    : score >= 70 && score <= 79
                    ? "第 5 行 elif s > 60 先命中並跳過第 7 行。"
                    : "此分數命中正確分支。"}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <PythonCodeView
                code={SCORE_CODE}
                activeLine={scoreEval.hitLine}
                deadLines={[7, 8]}
                caption="第 7-8 行永遠被遮蔽"
                compact
              />
            </div>
          </div>
        )}

        {tab === "q27" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-3.5">
              <div className="rail-well p-3.5 space-y-2">
                <label htmlFor="init-a-slider" className="block text-xs font-bold text-white">
                  初始值 a = <span className="font-code text-[#FF7A85]">{initA}</span>
                </label>
                <input
                  id="init-a-slider"
                  type="range"
                  min={-5}
                  max={15}
                  value={initA}
                  onChange={(e) => setInitA(Number(e.target.value))}
                  className="rail-slider w-full"
                />
              </div>

              <div className="rail-well divide-y divide-white/10 text-xs">
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-[#7E91B8]">while a &lt; 10</span>
                  <span className="font-code font-bold text-white">
                    {loopSteps.length > 0 ? `${initA} → ${loopSteps.join(" → ")}` : `${initA}`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-[#7E91B8]">跳出後 (≥ 10)</span>
                  <span className="font-code font-bold text-[#7AA4FF]">{afterWhile}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-[#7E91B8]">if a &lt; 12 (+2)</span>
                  <span className="font-code font-bold text-[#FFD452]">
                    {afterStep2} {entersIf12 ? "(+2)" : "(未觸發)"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5">
                  <span className="text-[#7E91B8]">if a &lt; 11</span>
                  <span
                    className={`font-code font-bold ${
                      entersIf11 ? "text-[#FF7A85]" : "text-[#4ADE80]"
                    }`}
                  >
                    {entersIf11 ? "True" : `False (${afterStep2} ≥ 12)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <PythonCodeView
                code={DEADCODE_CODE}
                deadLines={[7]}
                caption="第 7 行 a = 5 永遠不可達"
                compact
              />
            </div>
          </div>
        )}

        {tab === "q29" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-code text-xs text-[#7E91B8]">測資 A:</span>
              {(Object.keys(datasets) as Array<"inc" | "mix" | "dec">).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDatasetKey(key)}
                  className={`rounded px-2.5 py-1 font-code text-xs font-bold ui-transition ${
                    datasetKey === key
                      ? "bg-[#E21D2D] text-white"
                      : "border border-white/20 text-[#B8C5E0] hover:text-white"
                  }`}
                >
                  {datasets[key].label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rail-well p-3.5 space-y-2.5">
                <div className="flex items-center justify-between font-code text-xs">
                  <span className="font-bold text-[#FF7A85]">錯碼：elif</span>
                  <span className="font-bold text-white">
                    M={bugM}, N={bugN}
                  </span>
                </div>
                <PythonCodeView code={ELIF_BUG_CODE} bugLines={[5]} compact />
                <div className="divide-y divide-white/10 font-code text-xs">
                  {bugTrace.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <span className="font-bold text-white">x={step.x}</span>
                      <span className="text-[#B8C5E0]">{step.branch}</span>
                      <span className="font-bold text-[#FF7A85] tabular-nums">
                        {step.bugM}/{step.bugN}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rail-well p-3.5 space-y-2.5">
                <div className="flex items-center justify-between font-code text-xs">
                  <span className="font-bold text-[#4ADE80]">正解：雙 if</span>
                  <span className="font-bold text-[#4ADE80]">
                    M={fixM}, N={fixN}
                  </span>
                </div>
                <PythonCodeView code={ELIF_FIXED_CODE} compact />
                <div
                  className={`rounded border p-3 text-xs ${
                    bugN !== fixN
                      ? "border-[#E21D2D]/50 bg-[#E21D2D]/15 text-[#FF7A85]"
                      : "border-[#22B14C]/50 bg-[#22B14C]/15 text-[#4ADE80]"
                  }`}
                >
                  {bugN !== fixN
                    ? "嚴格遞增時每次都只進 if x > M，N 卡死在 101。"
                    : "有較小值進入 elif 更新 N，無法測出該錯。"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
