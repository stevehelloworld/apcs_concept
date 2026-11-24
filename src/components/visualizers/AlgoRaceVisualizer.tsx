"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Gauge, ListOrdered, Search } from "lucide-react";

type AlgoTab = "search" | "queue" | "gcd";

interface GcdLine {
  id: string;
  text: string;
}

const DEFAULT_GCD_LINES: GcdLine[] = [
  { id: "k_mod", text: "k = i % j" },
  { id: "i_eq_j", text: "i = j" },
  { id: "j_eq_k", text: "j = k" },
];

export function AlgoRaceVisualizer() {
  const [tab, setTab] = useState<AlgoTab>("search");
  const [targetValue, setTargetValue] = useState<number>(100);
  const [searchTarget, setSearchTarget] = useState<number>(16);

  const kExact = (targetValue - 1) / 3;
  const isValidInQ6 = Number.isInteger(kExact) && kExact >= 0 && kExact < 100;
  const linearSteps = isValidInQ6 ? kExact + 1 : 100;
  const binaryMidSeq: Array<{ low: number; high: number; mid: number; val: number }> = [];
  {
    let low = 0;
    let high = 99;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const val = 3 * mid + 1;
      binaryMidSeq.push({ low, high, mid, val });
      if (val === targetValue) break;
      if (val < targetValue) low = mid + 1;
      else high = mid - 1;
    }
  }

  const q22Arr = [0, 2, 4, 6, 8, 10, 12, 14];
  let qLow = 0;
  let qHigh = 7;
  while (qHigh > qLow) {
    const mid = Math.floor((qHigh + qLow) / 2);
    if (q22Arr[mid] <= searchTarget) qLow = mid + 1;
    else qHigh = mid;
  }
  const q22Returned = q22Arr[qHigh];
  const q22Expected = q22Arr.find((v) => v > searchTarget);

  const [q4Round, setQ4Round] = useState(0);
  const q4Rounds = [
    {
      title: "初始 (1..30)",
      queue: Array.from({ length: 30 }, (_, i) => i + 1),
      countEnd: 0,
      desc: "共 30 個元素，count = 0。",
    },
    {
      title: "第 1 輪後",
      queue: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
      countEnd: 0,
      desc: "3 的倍數留存，count 歸 0。",
    },
    {
      title: "第 2 輪後",
      queue: [9, 18, 27],
      countEnd: 1,
      desc: "讀完 30 時 count = 1 跨進下一輪。",
    },
    {
      title: "第 3 輪",
      queue: [18],
      countEnd: 1,
      desc: "承接 count=1，最終只剩 [18]。",
    },
  ];

  const [gcdLines, setGcdLines] = useState<GcdLine[]>([
    DEFAULT_GCD_LINES[1],
    DEFAULT_GCD_LINES[0],
    DEFAULT_GCD_LINES[2],
  ]);

  function moveGcdLine(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= gcdLines.length) return;
    const copy = [...gcdLines];
    const tmp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = tmp;
    setGcdLines(copy);
  }

  const gcdTest = (() => {
    let i = 76;
    let j = 48;
    let k: number | undefined = undefined;
    try {
      for (let iter = 0; iter < 15 && i % j !== 0; iter++) {
        for (const l of gcdLines) {
          if (l.id === "k_mod") k = i % j;
          else if (l.id === "i_eq_j") i = j;
          else if (l.id === "j_eq_k") {
            if (k === undefined) return { ok: false, msg: "NameError：尚未計算 k" };
            j = k;
          }
        }
        if (j === 0) return { ok: false, msg: "ZeroDivisionError：j = 0" };
      }
      if (j === 4 && i % j === 0) {
        return { ok: true, msg: "通過：GCD(76, 48) = 4" };
      }
      return { ok: false, msg: `順序錯誤：結果為 ${j}（應為 4）` };
    } catch {
      return { ok: false, msg: "執行異常" };
    }
  })();

  return (
    <div className="rail-frame overflow-hidden">
      <div className="h-1 w-full bg-[#14B8C4]" />
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#14B8C4] px-2 py-0.5 font-code text-xs font-bold text-[#0B1230]">
              L5
            </span>
            <h3 className="text-sm font-black text-white">演算法競速</h3>
          </div>

          <div className="rail-well flex flex-wrap gap-1 p-0.5">
            <button
              type="button"
              onClick={() => setTab("search")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "search"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q6 / Q22</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("queue")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "queue"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q4 佇列</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("gcd")}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                tab === "gcd"
                  ? "bg-white text-[#0B1230]"
                  : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q9 GCD</span>
            </button>
          </div>
        </div>

        {tab === "search" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 rail-well p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">Q6：a[k]=3k+1</span>
                <div className="flex gap-1">
                  {[1, 100, 148, 298].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetValue(val)}
                      className={`rounded px-2 py-0.5 font-code text-xs font-bold ${
                        targetValue === val
                          ? "bg-[#14B8C4] text-[#0B1230]"
                          : "border border-white/20 text-[#B8C5E0]"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="mb-1 flex justify-between font-code">
                    <span className="text-[#B8C5E0]">f1 線性</span>
                    <span className="font-bold text-[#FFD452] tabular-nums">
                      n1 = {linearSteps}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B1230]">
                    <div style={{ width: `${linearSteps}%` }} className="h-full bg-[#FFC20E]" />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-code">
                    <span className="text-[#B8C5E0]">f2 二分</span>
                    <span className="font-bold text-[#4ADE80] tabular-nums">
                      n2 = {binaryMidSeq.length}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#0B1230]">
                    <div
                      style={{ width: `${binaryMidSeq.length * 10}%` }}
                      className="h-full bg-[#22B14C]"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/10 font-code text-xs">
                {binaryMidSeq.map((s, idx) => (
                  <div key={idx} className="flex justify-between py-1 tabular-nums text-[#B8C5E0]">
                    <span>
                      #{idx + 1} [{s.low}..{s.high}]
                    </span>
                    <span className="font-bold text-white">
                      a[{s.mid}]={s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 rail-well p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">Q22：找 &gt; x</span>
                <div className="flex gap-1">
                  {[-1, 0, 10, 16].map((x) => (
                    <button
                      key={x}
                      type="button"
                      onClick={() => setSearchTarget(x)}
                      className={`rounded px-2 py-0.5 font-code text-xs font-bold ${
                        searchTarget === x
                          ? "bg-white text-[#0B1230]"
                          : "border border-white/20 text-[#B8C5E0]"
                      }`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 text-center font-code text-xs">
                {q22Arr.map((v, idx) => (
                  <div
                    key={v}
                    className={`rounded border py-1.5 ${
                      idx === qHigh
                        ? "border-[#FFC20E] bg-[#FFC20E]/18 font-bold text-[#FFD452]"
                        : "border-white/15 bg-[#0B1230] text-white"
                    }`}
                  >
                    <div className="text-[9px] text-[#7E91B8]">[{idx}]</div>
                    <div>{v}</div>
                  </div>
                ))}
              </div>

              <div
                className={`rounded border p-3 text-xs ${
                  q22Expected === undefined || q22Returned !== q22Expected
                    ? "border-[#E21D2D]/50 bg-[#E21D2D]/15 text-[#FF7A85]"
                    : "border-[#22B14C]/50 bg-[#22B14C]/15 text-[#4ADE80]"
                }`}
              >
                <div className="font-bold">
                  回傳 A[{qHigh}]={q22Returned} ／ 應為 {q22Expected ?? "無解"}
                </div>
                <p className="mt-1 text-[#B8C5E0]">
                  {q22Expected === undefined
                    ? "未檢查 A[high] > x，當 x >= 14 時誤回傳 14。"
                    : "有解測資無法暴露上界檢查缺失。"}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "queue" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap gap-1.5">
              {q4Rounds.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQ4Round(idx)}
                  className={`rounded px-2.5 py-1 text-xs font-bold ui-transition ${
                    q4Round === idx
                      ? "bg-white text-[#0B1230]"
                      : "border border-white/20 text-[#B8C5E0]"
                  }`}
                >
                  {r.title}
                </button>
              ))}
            </div>

            <div className="rail-well p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 font-code text-xs">
                <span className="font-bold text-white">{q4Rounds[q4Round].title}</span>
                <span className="font-bold text-[#FFD452] tabular-nums">
                  count = {q4Rounds[q4Round].countEnd}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {q4Rounds[q4Round].queue.map((val) => (
                  <span
                    key={val}
                    className={`rounded border px-2 py-0.5 font-code text-xs font-bold tabular-nums ${
                      val === 18
                        ? "border-[#22B14C] bg-[#22B14C]/20 text-[#4ADE80]"
                        : "border-white/20 bg-[#0B1230] text-[#B8C5E0]"
                    }`}
                  >
                    {val}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[#B8C5E0]">{q4Rounds[q4Round].desc}</p>
            </div>
          </div>
        )}

        {tab === "gcd" && (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-2">
              {gcdLines.map((line, idx) => (
                <div
                  key={line.id}
                  className="rail-well flex items-center justify-between px-3.5 py-2"
                >
                  <span className="font-code text-xs font-bold text-[#5EEAD4]">
                    {line.text}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveGcdLine(idx, -1)}
                      aria-label="上移"
                      className="rail-btn p-1 disabled:opacity-35"
                    >
                      <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === gcdLines.length - 1}
                      onClick={() => moveGcdLine(idx, 1)}
                      aria-label="下移"
                      className="rail-btn p-1 disabled:opacity-35"
                    >
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 flex items-center">
              <div
                className={`w-full rounded border p-3.5 text-xs ${
                  gcdTest.ok
                    ? "border-[#22B14C]/55 bg-[#22B14C]/15 text-[#4ADE80]"
                    : "border-[#E21D2D]/55 bg-[#E21D2D]/15 text-[#FF7A85]"
                }`}
              >
                <div className="font-bold">{gcdTest.msg}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
