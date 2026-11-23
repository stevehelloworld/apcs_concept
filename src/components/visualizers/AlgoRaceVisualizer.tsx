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

  // Search race + Q22 boundary state
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
  const q22Trace: Array<{ low: number; high: number; mid: number }> = [];
  let qLow = 0;
  let qHigh = 7;
  while (qHigh > qLow) {
    const mid = Math.floor((qHigh + qLow) / 2);
    q22Trace.push({ low: qLow, high: qHigh, mid });
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
      countStart: 0,
      countEnd: 0,
      desc: "共 30 個元素，head=0, tail=30, count=0。",
    },
    {
      title: "第 1 輪結束後",
      queue: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
      countStart: 0,
      countEnd: 0,
      desc: "每第 3 個（3 的倍數）放回隊尾；最後 30 剛好是第 30 個，count 歸 0。",
    },
    {
      title: "第 2 輪結束後（關鍵：30 沒進 if！）",
      queue: [9, 18, 27],
      countStart: 0,
      countEnd: 1,
      desc: "9, 18, 27 被放回；最後讀到 30 時 count 變成 1 就進下一輪（count 不會歸零！）。",
    },
    {
      title: "第 3 輪（承接 count=1）-> 最終解答",
      queue: [18],
      countStart: 1,
      countEnd: 1,
      desc: "讀 9 時 count=2(丟棄)；讀 18 時 count=3(歸0並放回 18！)；讀 27 時 count=1(丟棄)。剩 [18] 停機！",
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

  // Test GCD lines on (76, 48)
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
            if (k === undefined) return { ok: false, msg: "錯誤：尚未計算 k 就先讀取 k（NameError）！" };
            j = k;
          }
        }
        if (j === 0) return { ok: false, msg: "錯誤：除數 j 變成 0，引發 ZeroDivisionError！" };
      }
      if (j === 4 && i % j === 0) {
        return { ok: true, msg: "正確！先存餘數 k = i % j，再依序 i = j、j = k，順利算出 GCD(76, 48) = 4。" };
      }
      return { ok: false, msg: `順序有誤：i 被提早覆寫導致算出的結果變成 ${j}（應為 4）。` };
    } catch {
      return { ok: false, msg: "執行異常，請調整賦值順序。" };
    }
  })();

  return (
    <div className="rounded-lg border border-[#E2E0D8] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E0D8] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[#17191C]">
            互動視覺化實驗室：搜尋競速、佇列模擬與賦值順序
          </h3>
          <p className="text-xs text-[#525866]">
            驗證二分搜尋的無解邊界 Bug、跨輪不歸零佇列計數器與輾轉相除變數暫存順序
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTab("search")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "search"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q6 & Q22 搜尋競速與邊界</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("queue")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "queue"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q4 佇列跨輪模擬</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("gcd")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === "gcd"
                ? "bg-[#1E4E8C] text-white"
                : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Q9 GCD 賦值順序</span>
          </button>
        </div>
      </div>

      {tab === "search" && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Q6 Race */}
          <div className="lg:col-span-6 space-y-3 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17191C]">
                Q6：線性 vs 二分搜尋（a[k] = 3k + 1）
              </span>
              <div className="flex gap-1">
                {[1, 100, 148, 298].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetValue(val)}
                    className={`rounded px-2 py-0.5 font-code text-xs ${
                      targetValue === val
                        ? "bg-[#1E4E8C] text-white"
                        : "border border-[#E2E0D8] bg-white text-[#525866]"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-[#525866]">f1 線性搜尋（i = 0 逐格比對）</span>
                  <span className="font-code font-bold text-[#17191C] tabular-nums">
                    n1 = {linearSteps} 次
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded bg-[#E2E0D8]">
                  <div
                    style={{ width: `${linearSteps}%` }}
                    className="h-full bg-[#B4690E]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-[#525866]">f2 二分搜尋（mid 每次折半）</span>
                  <span className="font-code font-bold text-[#1E4E8C] tabular-nums">
                    n2 = {binaryMidSeq.length} 次
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded bg-[#E2E0D8]">
                  <div
                    style={{ width: `${binaryMidSeq.length * 10}%` }}
                    className="h-full bg-[#1E4E8C]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-semibold text-[#525866]">f2 折半歷程：</div>
              {binaryMidSeq.map((s, idx) => (
                <div
                  key={idx}
                  className="flex justify-between rounded border border-[#E2E0D8] bg-white px-2.5 py-1 font-code text-xs tabular-nums"
                >
                  <span>
                    #{idx + 1} [{s.low}..{s.high}]
                  </span>
                  <span>
                    mid={s.mid} → a[{s.mid}]={s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Q22 Boundary target */}
          <div className="lg:col-span-6 space-y-3 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#17191C]">
                Q22：找大於 x 的最小值（測出無解邊界 Bug）
              </span>
              <div className="flex gap-1">
                {[-1, 0, 10, 16].map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => setSearchTarget(x)}
                    className={`rounded px-2 py-0.5 font-code text-xs ${
                      searchTarget === x
                        ? "bg-[#1E4E8C] text-white"
                        : "border border-[#E2E0D8] bg-white text-[#525866]"
                    }`}
                  >
                    Search({x})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1 text-center font-code text-xs">
              {q22Arr.map((v, idx) => (
                <div
                  key={v}
                  className={`rounded border py-2 ${
                    idx === qHigh
                      ? "border-[#1E4E8C] bg-[#EAF1FA] font-bold text-[#1E4E8C]"
                      : "border-[#E2E0D8] bg-white text-[#17191C]"
                  }`}
                >
                  <div className="text-[10px] text-[#6C7382]">[{idx}]</div>
                  <div>{v}</div>
                </div>
              ))}
            </div>

            <div
              className={`rounded-md border p-3 text-xs ${
                q22Expected === undefined || q22Returned !== q22Expected
                  ? "border-[#C23535]/40 bg-[#FCEEEE] text-[#C23535]"
                  : "border-[#157F4B]/30 bg-[#EAF6EF] text-[#157F4B]"
              }`}
            >
              <div className="font-semibold">
                Search({searchTarget}) 實際回傳 A[{qHigh}] = {q22Returned} ／ 正確答案應為：
                {q22Expected !== undefined ? q22Expected : "無解（A 中無元素大於 16）"}
              </div>
              <p className="mt-1 text-[#17191C]">
                {q22Expected === undefined
                  ? "成功戳破 Bug！因程式最後未檢查 A[high] > x，當 x >= 14 時依然把最右側元素 14 回傳出去。"
                  : "這個測資剛好有解且落在範圍內，因此測不出函式的邊界錯誤。"}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "queue" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {q4Rounds.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQ4Round(idx)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  q4Round === idx
                    ? "bg-[#1E4E8C] text-white"
                    : "border border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>

          <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#17191C]">
                {q4Rounds[q4Round].title}
              </span>
              <span className="rounded bg-white border border-[#E2E0D8] px-2.5 py-1 font-code text-xs tabular-nums">
                輪次結束 count = {q4Rounds[q4Round].countEnd}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {q4Rounds[q4Round].queue.map((val) => (
                <span
                  key={val}
                  className={`rounded border px-2.5 py-1 font-code text-xs font-semibold tabular-nums ${
                    val === 18
                      ? "border-[#1E4E8C] bg-[#EAF1FA] text-[#1E4E8C]"
                      : "border-[#E2E0D8] bg-white text-[#17191C]"
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-[#525866]">
              {q4Rounds[q4Round].desc}
            </p>
          </div>
        </div>
      )}

      {tab === "gcd" && (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-semibold text-[#525866]">
              上下調整 while (i % j) != 0 內的三行賦值順序（以 i=76, j=48 測試）：
            </div>
            {gcdLines.map((line, idx) => (
              <div
                key={line.id}
                className="flex items-center justify-between rounded-md border border-[#E2E0D8] bg-[#141820] px-3.5 py-2.5 text-white"
              >
                <span className="font-code text-sm">{line.text}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveGcdLine(idx, -1)}
                    aria-label="上移一行"
                    className="rounded border border-[#252C3A] bg-[#1B202B] p-1 text-[#9AA5CE] hover:text-white disabled:opacity-35"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === gcdLines.length - 1}
                    onClick={() => moveGcdLine(idx, 1)}
                    aria-label="下移一行"
                    className="rounded border border-[#252C3A] bg-[#1B202B] p-1 text-[#9AA5CE] hover:text-white disabled:opacity-35"
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 flex items-center">
            <div
              className={`w-full rounded-md border p-4 text-sm ${
                gcdTest.ok
                  ? "border-[#157F4B]/30 bg-[#EAF6EF] text-[#157F4B]"
                  : "border-[#C23535]/40 bg-[#FCEEEE] text-[#C23535]"
              }`}
            >
              <div className="font-semibold mb-1">
                {gcdTest.ok ? "順序驗證通過" : "順序錯誤"}
              </div>
              <p className="text-xs leading-relaxed text-[#17191C]">{gcdTest.msg}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
