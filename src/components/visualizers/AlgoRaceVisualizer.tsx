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

  // Q6 linear & binary steps for a[k]=3k+1 (0..99)
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

  // Q22 buggy upper-bound trace on [0, 2, 4, 6, 8, 10, 12, 14]
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

  // Q4 Queue round selector
  const [q4Round, setQ4Round] = useState(0);
  const q4Rounds = [
    {
      title: "初始入列（1 ~ 30）",
      queue: Array.from({ length: 30 }, (_, i) => i + 1),
      countEnd: 0,
      desc: "共 30 個元素，head=0, tail=30, count=0。",
    },
    {
      title: "第 1 輪結束後",
      queue: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
      countEnd: 0,
      desc: "每第 3 個（3 的倍數）放回隊尾；最後 30 剛好是第 30 個，count 歸 0。",
    },
    {
      title: "第 2 輪結束後（關鍵：30 沒歸零）",
      queue: [9, 18, 27],
      countEnd: 1,
      desc: "9, 18, 27 放回；讀完 30 時 count 變成 1 直接跨進下一輪（count 不會歸零！）。",
    },
    {
      title: "第 3 輪（承接 count=1）→ 最終解答",
      queue: [18],
      countEnd: 1,
      desc: "讀 9 時 count=2(丟棄)；讀 18 時 count=3(歸0並放回 18！)；讀 27 時 count=1(丟棄)。剩 [18] 停機。",
    },
  ];

  // Q9 GCD line reorder state
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
            if (k === undefined)
              return { ok: false, msg: "錯誤：還沒計算 k 就先讀取 k（NameError）！" };
            j = k;
          }
        }
        if (j === 0)
          return { ok: false, msg: "錯誤：除數 j 變成 0，引發 ZeroDivisionError！" };
      }
      if (j === 4 && i % j === 0) {
        return {
          ok: true,
          msg: "正確！先存餘數 k = i % j，再依序 i = j、j = k，順利算出 GCD(76, 48) = 4。",
        };
      }
      return {
        ok: false,
        msg: `順序有誤：i 被提前覆蓋，算出的結果變成 ${j}（正確應為 4）。`,
      };
    } catch {
      return { ok: false, msg: "執行異常，請調整賦值順序。" };
    }
  })();

  return (
    <div className="synth-panel-hard overflow-hidden">
      <div className="h-2 w-full bg-[#D98200]" />
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4DAE4] pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[#11151C]">
              <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-xs font-bold text-[#FFB800]">
                LAB-05
              </span>
              <span>演算法競速計與佇列模擬器</span>
            </h3>
            <p className="mt-1 text-xs text-[#4B5565]">
              直接比較線性 vs 二分搜尋步數、抓無解邊界 Bug、跨輪佇列計數器與 GCD 賦值順序
            </p>
          </div>

          <div className="synth-recess flex flex-wrap gap-1 p-1">
            <button
              type="button"
              onClick={() => setTab("search")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "search"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q6 & Q22 搜尋競速</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("queue")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "queue"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q4 佇列模擬</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("gcd")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                tab === "gcd"
                  ? "bg-[#161A22] text-white"
                  : "text-[#4B5565] hover:text-[#11151C]"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Q9 GCD 順序</span>
            </button>
          </div>
        </div>

        {tab === "search" && (
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Q6 Race */}
            <div className="lg:col-span-6 synth-recess p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#11151C]">
                  Q6：線性 vs 二分搜尋（a[k] = 3k + 1）
                </span>
                <div className="flex gap-1">
                  {[1, 100, 148, 298].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetValue(val)}
                      className={`rounded-md border px-2 py-0.5 font-code text-xs font-bold ${
                        targetValue === val
                          ? "border-[#161A22] bg-[#A35F00] text-white"
                          : "border-[#C4CBD6] bg-white text-[#4B5565]"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="synth-oled p-3.5 space-y-3 text-xs">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-[#CBD5E1]">f1 線性搜尋（逐格比對）</span>
                    <span className="font-code font-bold text-[#FFB800] tabular-nums">
                      n1 = {linearSteps} 次
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#1E2533]">
                    <div
                      style={{ width: `${linearSteps}%` }}
                      className="h-full bg-[#FFB800]"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-[#CBD5E1]">f2 二分搜尋（每次折半）</span>
                    <span className="font-code font-bold text-[#00E5A0] tabular-nums">
                      n2 = {binaryMidSeq.length} 次
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#1E2533]">
                    <div
                      style={{ width: `${binaryMidSeq.length * 10}%` }}
                      className="h-full bg-[#00E5A0]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#4B5565]">f2 折半歷程：</div>
                {binaryMidSeq.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between rounded-lg border border-[#C4CBD6] bg-white px-2.5 py-1 font-code text-xs tabular-nums"
                  >
                    <span>
                      #{idx + 1} [{s.low}..{s.high}]
                    </span>
                    <span className="font-bold text-[#11151C]">
                      mid={s.mid} → a[{s.mid}]={s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Q22 Boundary */}
            <div className="lg:col-span-6 synth-recess p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#11151C]">
                  Q22：找大於 x 的最小值（測出無解 Bug）
                </span>
                <div className="flex gap-1">
                  {[-1, 0, 10, 16].map((x) => (
                    <button
                      key={x}
                      type="button"
                      onClick={() => setSearchTarget(x)}
                      className={`rounded-md border px-2 py-0.5 font-code text-xs font-bold ${
                        searchTarget === x
                          ? "border-[#161A22] bg-[#161A22] text-white"
                          : "border-[#C4CBD6] bg-white text-[#4B5565]"
                      }`}
                    >
                      Search({x})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 text-center font-code text-xs">
                {q22Arr.map((v, idx) => (
                  <div
                    key={v}
                    className={`rounded-lg border py-2 ${
                      idx === qHigh
                        ? "border-[#161A22] bg-[#161A22] font-bold text-[#FFB800]"
                        : "border-[#C4CBD6] bg-white text-[#11151C]"
                    }`}
                  >
                    <div className="text-[10px] opacity-70">[{idx}]</div>
                    <div>{v}</div>
                  </div>
                ))}
              </div>

              <div
                className={`rounded-xl border-2 p-3.5 text-xs ${
                  q22Expected === undefined || q22Returned !== q22Expected
                    ? "border-[#C62828] bg-[#FDECEC] text-[#C62828]"
                    : "border-[#007A57] bg-[#E6FAF3] text-[#007A57]"
                }`}
              >
                <div className="font-bold">
                  Search({searchTarget}) 實際回傳 A[{qHigh}] = {q22Returned} ／ 應為：
                  {q22Expected !== undefined ? q22Expected : "無解（沒有元素 > 16）"}
                </div>
                <p className="mt-1 leading-relaxed text-[#11151C]">
                  {q22Expected === undefined
                    ? "抓到 Bug！程式最後未檢查 A[high] > x，當 x >= 14 時依然把最右側 14 回傳出去。"
                    : "這個測資剛好有解，無法測出程式未檢查上界的錯誤。"}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "queue" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {q4Rounds.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQ4Round(idx)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ui-transition ${
                    q4Round === idx
                      ? "border-[#161A22] bg-[#161A22] text-white"
                      : "border-[#C4CBD6] bg-white text-[#4B5565]"
                  }`}
                >
                  {r.title}
                </button>
              ))}
            </div>

            <div className="synth-oled p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">
                  {q4Rounds[q4Round].title}
                </span>
                <span className="rounded bg-[#262F3F] px-2.5 py-1 font-code text-xs font-bold text-[#FFB800] tabular-nums">
                  本輪結束 count = {q4Rounds[q4Round].countEnd}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {q4Rounds[q4Round].queue.map((val) => (
                  <span
                    key={val}
                    className={`rounded-md border px-2.5 py-1 font-code text-xs font-bold tabular-nums ${
                      val === 18
                        ? "border-[#00E5A0] bg-[#00A878]/25 text-[#00E5A0]"
                        : "border-[#2B3548] bg-[#161B24] text-[#CBD5E1]"
                    }`}
                  >
                    {val}
                  </span>
                ))}
              </div>

              <p className="text-xs leading-relaxed text-[#A8B6CC]">
                {q4Rounds[q4Round].desc}
              </p>
            </div>
          </div>
        )}

        {tab === "gcd" && (
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-2">
              <div className="text-xs font-bold text-[#4B5565]">
                調換 while (i % j) != 0 內三行順序（以 i=76, j=48 測試）：
              </div>
              {gcdLines.map((line, idx) => (
                <div
                  key={line.id}
                  className="synth-oled flex items-center justify-between px-4 py-2.5"
                >
                  <span className="font-code text-sm font-bold text-[#38BDF8]">
                    {line.text}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveGcdLine(idx, -1)}
                      aria-label="上移一行"
                      className="rounded-md border border-[#2B3548] bg-[#161B24] p-1.5 text-[#CBD5E1] hover:text-white disabled:opacity-35"
                    >
                      <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === gcdLines.length - 1}
                      onClick={() => moveGcdLine(idx, 1)}
                      aria-label="下移一行"
                      className="rounded-md border border-[#2B3548] bg-[#161B24] p-1.5 text-[#CBD5E1] hover:text-white disabled:opacity-35"
                    >
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-6 flex items-center">
              <div
                className={`w-full rounded-xl border-2 p-4 text-sm ${
                  gcdTest.ok
                    ? "border-[#007A57] bg-[#E6FAF3] text-[#007A57]"
                    : "border-[#C62828] bg-[#FDECEC] text-[#C62828]"
                }`}
              >
                <div className="font-bold mb-1">
                  {gcdTest.ok ? "順序驗證通過！" : "順序不正確"}
                </div>
                <p className="text-xs leading-relaxed text-[#11151C]">{gcdTest.msg}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
