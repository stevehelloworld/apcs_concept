import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  Terminal,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics } from "@/lib/queries";
import {
  QUESTION_TYPE_DESCRIPTIONS,
  QUESTION_TYPE_LABELS,
  type QuestionType,
} from "@/lib/types";
import { CodeTraceStepper } from "@/components/CodeTraceStepper";
import type { TraceStep } from "@/lib/types";

export const dynamic = "force-dynamic";

const HERO_DEMO_CODE = `def f1(m):
    if m > 3:
        print(m)
        return
    print(m)
    f2(m + 2)
    print(m)`;

const HERO_DEMO_STEPS: TraceStep[] = [
  {
    line: 5,
    vars: { m: 1 },
    stack: ["f1(1)"],
    output: "1",
    note: "去程：呼叫 f2(3) 前先印出 1，f1(1) 暫停於呼叫堆疊中。",
  },
  {
    line: 6,
    vars: { m: 1, "呼叫": "f2(3) -> f1(2) -> f2(4)" },
    stack: ["f1(1)", "f2(3)", "f1(2)", "f2(4)"],
    output: "1\n3\n2\n4",
    note: "一路展開至 f2(4) > 3 觸底回傳，接著按後進先出順序執行回程。",
  },
  {
    line: 7,
    vars: { m: 1, "狀態": "回程對稱輸出" },
    stack: ["f1(1)"],
    output: "1\n3\n2\n4\n2\n3\n1",
    note: "回到第 7 行再印一次 1，形成完美對稱軌跡 1 3 2 4 2 3 1（Q8 原型）。",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);
  const allTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-12">
      {/* Hero Thesis + Immediate Mechanism Proof */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5 space-y-5">
          <h1 className="text-3xl font-bold tracking-tight text-[#17191C] sm:text-4xl leading-tight">
            APCS Python 程式識讀
            <br />
            互動追蹤與班級實驗室
          </h1>
          <p className="text-[15px] leading-relaxed text-[#525866]">
            依據官方 2025 APCS「程式識讀 Python 題本範例（0915 版，全 30 題）」建構。
            不讓學生只看靜態解答背答案，而是用單步變數追蹤表、迷思選項即時診斷與五大主題視覺化實驗室，真正看懂迴圈邊界、遞迴堆疊與演算法陷阱。
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 rounded-md bg-[#1E4E8C] px-4 py-2.5 text-sm font-medium text-white ui-transition hover:bg-[#163C6E]"
            >
              <Compass className="h-4 w-4" strokeWidth={1.75} />
              <span>探索五大主題導覽</span>
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-md border border-[#E2E0D8] bg-white px-4 py-2.5 text-sm font-medium text-[#17191C] ui-transition hover:border-[#C9C6BB] hover:bg-[#F0EFEA]"
            >
              <Terminal className="h-4 w-4" strokeWidth={1.75} />
              <span>進入刷題工作台</span>
            </Link>
            {user?.role === "teacher" ? (
              <Link
                href="/teacher"
                className="inline-flex items-center gap-2 rounded-md border border-[#0F6B5E] bg-[#E6F4F1] px-4 py-2.5 text-sm font-medium text-[#0F6B5E] ui-transition hover:bg-[#d5ece7]"
              >
                <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
                <span>進入教師後台</span>
              </Link>
            ) : !user ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md border border-[#E2E0D8] bg-[#F0EFEA] px-4 py-2.5 text-sm font-medium text-[#17191C] ui-transition hover:bg-[#E5E3DC]"
              >
                <span>登入師生帳號</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md border border-[#1E4E8C]/30 bg-[#EAF1FA] px-4 py-2.5 text-sm font-medium text-[#1E4E8C] ui-transition hover:bg-[#dce8f8]"
              >
                <span>查看個人學習進度</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-[#E2E0D8] pt-4">
            <div>
              <div className="font-code text-xl font-bold text-[#17191C] tabular-nums">5 單元</div>
              <div className="text-xs text-[#525866]">專屬互動視覺化</div>
            </div>
            <div>
              <div className="font-code text-xl font-bold text-[#17191C] tabular-nums">30 真題</div>
              <div className="text-xs text-[#525866]">逐選項迷思診斷</div>
            </div>
            <div>
              <div className="font-code text-xl font-bold text-[#17191C] tabular-nums">6 題型</div>
              <div className="text-xs text-[#525866]">跨主題弱點矩陣</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <CodeTraceStepper
            code={HERO_DEMO_CODE}
            steps={HERO_DEMO_STEPS}
            title="即時機制預覽：Q8 遞迴去程與回程 Call Stack 追蹤"
          />
        </div>
      </section>

      {/* Five Topics Structured Directory */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[#E2E0D8] pb-3">
          <div>
            <h2 className="text-xl font-bold text-[#17191C]">五大知識主題學習路線</h2>
            <p className="mt-1 text-sm text-[#525866]">
              完整涵蓋官方 0915 範例題本 30 題，每單元皆附六段式教學與專屬視覺化實驗室
            </p>
          </div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1E4E8C] hover:underline"
          >
            <span>開啟完整雙軸目錄</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E2E0D8] bg-white divide-y divide-[#E2E0D8]">
          {topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12 lg:items-center hover:bg-[#F7F6F2]/60 ui-transition"
            >
              <div className="lg:col-span-5 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-code text-xs font-semibold text-[#1E4E8C]">
                    主題 {idx + 1}
                  </span>
                  <span className="text-xs text-[#6C7382]">·</span>
                  <span className="text-xs text-[#525866]">{topic.exam_weight}</span>
                </div>
                <h3 className="text-base font-semibold text-[#17191C]">
                  <Link href={`/topics/${topic.slug}`} className="hover:text-[#1E4E8C]">
                    {topic.title}
                  </Link>
                </h3>
                <p className="text-sm text-[#525866] leading-relaxed">{topic.summary}</p>
              </div>

              <div className="lg:col-span-4 flex flex-wrap gap-1.5">
                {topic.question_types.map((qt) => (
                  <span
                    key={qt}
                    className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2 py-0.5 text-xs text-[#525866]"
                  >
                    {QUESTION_TYPE_LABELS[qt]}
                  </span>
                ))}
                <span className="rounded bg-[#EAF1FA] px-2 py-0.5 font-code text-xs font-medium text-[#1E4E8C] tabular-nums">
                  {topic.question_count} 題
                </span>
                {topic.student_correct !== undefined && (
                  <span className="rounded bg-[#EAF6EF] px-2 py-0.5 font-code text-xs font-medium text-[#157F4B] tabular-nums">
                    已通過 {topic.student_correct}/{topic.question_count}
                  </span>
                )}
              </div>

              <div className="lg:col-span-3 flex flex-wrap items-center justify-start lg:justify-end gap-2">
                <Link
                  href={`/topics/${topic.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3 py-1.5 text-xs font-medium text-white ui-transition hover:bg-[#163C6E]"
                >
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>進入教學頁</span>
                </Link>
                <Link
                  href={`/practice?topic=${topic.slug}`}
                  className="inline-flex items-center gap-1 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-xs font-medium text-[#17191C] ui-transition hover:bg-[#F0EFEA]"
                >
                  <span>刷題</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Six Cognitive Question Types */}
      <section className="space-y-4">
        <div className="border-b border-[#E2E0D8] pb-3">
          <h2 className="text-xl font-bold text-[#17191C]">六大認知題型特訓入口</h2>
          <p className="mt-1 text-sm text-[#525866]">
            純算輸出只佔 APCS 識讀的 33%，針對「逆向填空、找反例測資、死碼推理」分項特訓更能快速拉高分數
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allTypes.map((qt) => (
            <Link
              key={qt}
              href={`/practice?type=${qt}`}
              className="group flex flex-col justify-between rounded-lg border border-[#E2E0D8] bg-white p-4 ui-transition hover:border-[#1E4E8C]"
            >
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#17191C] group-hover:text-[#1E4E8C]">
                    {QUESTION_TYPE_LABELS[qt]}
                  </span>
                  <Layers className="h-4 w-4 text-[#6C7382] group-hover:text-[#1E4E8C]" strokeWidth={1.75} />
                </div>
                <p className="text-xs leading-relaxed text-[#525866]">
                  {QUESTION_TYPE_DESCRIPTIONS[qt]}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1E4E8C]">
                <span>練習此題型</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dual Role Split Note */}
      <section className="rounded-lg border border-[#E2E0D8] bg-white p-6">
        <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-[#E2E0D8]">
          <div className="space-y-2 md:pr-6">
            <h3 className="text-base font-semibold text-[#1E4E8C]">給學生與自學者</h3>
            <p className="text-sm leading-relaxed text-[#525866]">
              註冊學生帳號並輸入老師的 6 碼班級代碼（如 <code className="font-code">APCS2A</code>），即可接收班級作業、追蹤五大主題與六大題型掌握度，並從錯題清單直接重播執行軌跡。
            </p>
          </div>
          <div className="space-y-2 md:pl-6">
            <h3 className="text-base font-semibold text-[#0F6B5E]">給資訊科教師與培訓講師</h3>
            <p className="text-sm leading-relaxed text-[#525866]">
              登入教師管理後台即可建立班級、檢視「主題 × 題型」班級弱點熱度矩陣與高錯率迷思排行、自訂班級專屬題目、編修主題教學內容與指派作業任務。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
