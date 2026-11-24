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
    <div className="synth-panel-hard overflow-hidden">
      <div className="h-2 w-full bg-[#FF4F17]" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4DAE4] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[#11151C]">
              <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-xs font-bold text-[#FF8A65]">
                LAB-01
              </span>
              <span>分支覆蓋與區間示波器</span>
            </h3>
            <p className="mt-1 text-xs text-[#4B5565]">
              拉動滑桿實測條件順序遮蔽、區間平移死碼與 elif 互斥陷阱
            </p>
          </div>

          <div className="synth-recess flex flex-wrap gap-1 p-1">
            <button
              type="button"
              onClick={() => setTab("q17")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q17"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q17 數線遮蔽</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q27")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q27"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q27 平移死碼</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("q29")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "q29"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Split className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q29 if vs elif</span>
            </button>
          </div>
        </div>

        {tab === "q17" && (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-4">
              <div className="synth-recess p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="score-slider" className="text-sm font-bold text-[#11151C]">
                    推桿測試分數{" "}
                    <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-xs text-[#FF8A65]">
                      s = {score}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[59, 60, 65, 70, 75, 85, 95].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setScore(preset)}
                        className={`rounded-md border px-2 py-0.5 font-code text-xs font-bold tabular-nums ui-transition ${
                          score === preset
                            ? "border-[#161A22] bg-[#D93B09] text-white"
                            : "border-[#C4CBD6] bg-white text-[#11151C] hover:border-[#161A22]"
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
                  className="synth-slider w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#4B5565]">
                  0 ~ 100 實際命中分區（紅框為判錯的 11 個分數：60 與 70~79）
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 font-code text-[11px] font-bold">
                  {[
                    {
                      range: "0..59",
                      out: "F 正確",
                      active: score <= 59,
                      cls: "bg-[#DDE2EA] text-[#11151C] border-[#B9C2D0]",
                    },
                    {
                      range: "60",
                      out: "誤F (錯)",
                      active: score === 60,
                      cls: "bg-[#FDECEC] text-[#C62828] border-[#F9B4B4]",
                    },
                    {
                      range: "61..69",
                      out: "D 正確",
                      active: score >= 61 && score <= 69,
                      cls: "bg-[#E6FAF3] text-[#007A57] border-[#9EE7D0]",
                    },
                    {
                      range: "70..79",
                      out: "誤D (錯)",
                      active: score >= 70 && score <= 79,
                      cls: "bg-[#FDECEC] text-[#C62828] border-[#F9B4B4]",
                    },
                    {
                      range: "80..89",
                      out: "B 正確",
                      active: score >= 80 && score <= 89,
                      cls: "bg-[#EDF3FF] text-[#1D4ED8] border-[#B3CEFF]",
                    },
                    {
                      range: "90..100",
                      out: "A 正確",
                      active: score >= 90,
                      cls: "bg-[#EDF3FF] text-[#1D4ED8] border-[#B3CEFF]",
                    },
                  ].map((zone) => (
                    <div
                      key={zone.range}
                      className={`rounded-lg border px-2 py-2 text-center ui-transition ${zone.cls} ${
                        zone.active ? "ring-2 ring-[#161A22]" : ""
                      }`}
                    >
                      <div className="font-bold">{zone.range}</div>
                      <div className="mt-0.5 text-[10px] opacity-90">{zone.out}</div>
                    </div>
                  ))}
                </div>

                <div
                  className={`rounded-xl border-2 p-3.5 text-sm ${
                    isScoreWrong
                      ? "border-[#C62828] bg-[#FDECEC] text-[#C62828]"
                      : "border-[#007A57] bg-[#E6FAF3] text-[#007A57]"
                  }`}
                >
                  <div className="font-bold">
                    當 s = {score}：程式輸出「{scoreEval.grade}」／ 正確應為「
                    {scoreEval.expected}」{isScoreWrong ? "（抓到判錯！）" : "（正確）"}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#11151C]">
                    {score === 60
                      ? "s == 60 不滿足 s > 60（漏掉等號 >=），直接掉進 else 輸出 F。"
                      : score >= 70 && score <= 79
                      ? "s 在 70~79 之間時，上方第 5 行 elif s > 60 先成立，直接輸出 D 並跳過第 7 行。"
                      : "此分數未受上方條件錯置與嚴格大於號影響。"}
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
              <div className="synth-recess p-4 space-y-2.5">
                <label htmlFor="init-a-slider" className="block text-sm font-bold text-[#11151C]">
                  測試任意初始整數（-5 .. 15）：
                  <span className="ml-2 rounded bg-[#161A22] px-2 py-0.5 font-code text-xs text-[#FF8A65]">
                    a = {initA}
                  </span>
                </label>
                <input
                  id="init-a-slider"
                  type="range"
                  min={-5}
                  max={15}
                  value={initA}
                  onChange={(e) => setInitA(Number(e.target.value))}
                  className="synth-slider w-full"
                />
                <p className="text-xs leading-relaxed text-[#4B5565]">
                  注意兩個 <code className="font-code font-bold">if</code> 都在{" "}
                  <code className="font-code font-bold">while</code> 外層！跳出迴圈必落入{" "}
                  <code className="font-code font-bold">a &gt;= 10</code>，經{" "}
                  <code className="font-code font-bold">+2</code> 平移後恆落入{" "}
                  <code className="font-code font-bold">[12, ∞)</code>。
                </p>
              </div>

              <div className="synth-oled divide-y divide-[#262F3F] text-xs">
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-[#94A3B8]">1. while a &lt; 10 歷程</span>
                  <span className="font-code font-bold text-[#EEF2F8]">
                    {loopSteps.length > 0
                      ? `${initA} → ${loopSteps.join(" → ")}`
                      : `直接跳出（${initA} >= 10）`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-[#94A3B8]">2. 離開 while 後（保證 ≥ 10）</span>
                  <span className="font-code font-bold text-[#38BDF8]">{afterWhile}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-[#94A3B8]">3. if a &lt; 12（加 2）後</span>
                  <span className="font-code font-bold text-[#FFB800]">
                    {afterStep2} {entersIf12 ? "（觸發 +2）" : "（未觸發，已 >= 12）"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-[#94A3B8]">4. 到達 if a &lt; 11 時</span>
                  <span
                    className={`font-code font-bold ${
                      entersIf11 ? "text-[#FF6B7B]" : "text-[#00E5A0]"
                    }`}
                  >
                    {entersIf11
                      ? "True -> 執行 a = 5"
                      : `False（${afterStep2} >= 12，永遠跳過）`}
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
              <span className="text-xs font-bold text-[#4B5565]">切換測資 A：</span>
              {(Object.keys(datasets) as Array<"inc" | "mix" | "dec">).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDatasetKey(key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ui-transition ${
                    datasetKey === key
                      ? "border-[#161A22] bg-[#D93B09] text-white"
                      : "border-[#C4CBD6] bg-white text-[#11151C] hover:border-[#161A22]"
                  }`}
                >
                  {datasets[key].label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C62828]">
                    錯誤寫法：使用 elif（互斥跳過）
                  </span>
                  <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-xs font-bold text-white">
                    M = {bugM}, N = {bugN}
                  </span>
                </div>
                <PythonCodeView code={ELIF_BUG_CODE} bugLines={[5]} compact />
                <div className="space-y-1.5">
                  {bugTrace.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-[#C4CBD6] bg-white px-3 py-1.5 text-xs"
                    >
                      <span className="font-code font-bold text-[#11151C]">x={step.x}</span>
                      <span className="text-[#4B5565]">{step.branch}</span>
                      <span className="font-code font-bold tabular-nums text-[#B83006]">
                        M={step.bugM}, N={step.bugN}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#C4CBD6] bg-[#F8F9FB] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#007A57]">
                    正確寫法：兩個獨立 if
                  </span>
                  <span className="rounded bg-[#007A57] px-2 py-0.5 font-code text-xs font-bold text-white">
                    M = {fixM}, N = {fixN}
                  </span>
                </div>
                <PythonCodeView code={ELIF_FIXED_CODE} compact />
                <div className="rounded-xl border border-[#9EE7D0] bg-[#E6FAF3] p-3.5 text-xs leading-relaxed text-[#11151C]">
                  {bugN !== fixN ? (
                    <>
                      <strong className="text-[#C62828]">成功揪出 Bug！</strong>{" "}
                      在嚴格遞增測資下每輪皆命中 <code className="font-code font-bold">x &gt; M</code>，導致{" "}
                      <code className="font-code font-bold">elif x &lt; N</code> 一次也沒跑，N 卡死在初始值 101。
                    </>
                  ) : (
                    <>
                      這組測資有出現較小數值進入 <code className="font-code font-bold">elif</code> 更新 N，所以剛好逃過檢測，這正是測試容易漏抓的原因！
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
