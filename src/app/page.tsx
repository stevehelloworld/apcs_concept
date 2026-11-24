import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Cpu,
  FlaskConical,
  GraduationCap,
  Terminal,
  Zap,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics } from "@/lib/queries";
import { getTopicTheme, QUESTION_TYPE_PAD_CODES } from "@/lib/topic-theme";
import {
  QUESTION_TYPE_DESCRIPTIONS,
  QUESTION_TYPE_LABELS,
  type QuestionType,
  type TraceStep,
} from "@/lib/types";
import { CodeTraceStepper } from "@/components/CodeTraceStepper";

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
    note: "去程：呼叫 f2(3) 前先印出 1，f1(1) 暫停留在呼叫堆疊中。",
  },
  {
    line: 6,
    vars: { m: 1, "呼叫": "f2(3) -> f1(2) -> f2(4)" },
    stack: ["f1(1)", "f2(3)", "f1(2)", "f2(4)"],
    output: "1\n3\n2\n4",
    note: "一路展開到 f2(4) > 3 觸底回傳，接著按後進先出依序倒車回程。",
  },
  {
    line: 7,
    vars: { m: 1, "狀態": "回程對稱輸出" },
    stack: ["f1(1)"],
    output: "1\n3\n2\n4\n2\n3\n1",
    note: "退回第 7 行再印出 1，完成對稱輸出 1 3 2 4 2 3 1（Q8 原型）。",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);
  const allTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-12">
      {/* First Viewport: Split Instrument Console */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5 space-y-5">
          <h1 className="text-3xl font-black tracking-tight text-[#11151C] sm:text-[40px] leading-[1.18]">
            把 Python 程式跑起來看懂，
            <span className="text-[#D93B09]">不再靠死背猜答案</span>
          </h1>

          <p className="max-w-prose text-[15px] leading-relaxed text-[#4B5565]">
            完整收錄 2025 APCS Python 0915 官方全 30 題，專為國高中生打造的互動程式實驗台。直接拖曳右側步驟滑桿追蹤變數與 Call Stack，再用五大主題互動儀器把迴圈邊界、二維陣列與遞迴一次搞懂。
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/topics"
              className="synth-pad-orange inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
            >
              <Compass className="h-4 w-4" strokeWidth={2.2} />
              <span>打開五大模組地圖</span>
            </Link>
            <Link
              href="/practice"
              className="synth-pad inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
            >
              <Terminal className="h-4 w-4" strokeWidth={2} />
              <span>進入刷題實驗台</span>
            </Link>
            {user?.role === "teacher" ? (
              <Link
                href="/teacher"
                className="synth-pad-emerald inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
              >
                <GraduationCap className="h-4 w-4" strokeWidth={2} />
                <span>教師控制台</span>
              </Link>
            ) : !user ? (
              <Link
                href="/login"
                className="synth-pad-dark inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
              >
                <span>師生登入</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="synth-pad-dark inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
              >
                <span>我的學習進度</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            )}
          </div>

          {/* 3-Slot Recessed OLED Telemetry Counter */}
          <div className="synth-oled grid grid-cols-3 divide-x divide-[#262F3F] p-3.5">
            <div className="pr-3">
              <div className="font-display text-2xl font-bold text-[#FF8A65] tabular-nums">
                05
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-[#A8B6CC]">
                互動實驗模組
              </div>
            </div>
            <div className="px-3">
              <div className="font-display text-2xl font-bold text-[#00E5A0] tabular-nums">
                30
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-[#A8B6CC]">
                官方範例真題
              </div>
            </div>
            <div className="pl-3">
              <div className="font-display text-2xl font-bold text-[#38BDF8] tabular-nums">
                06
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-[#A8B6CC]">
                題型特訓關卡
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <CodeTraceStepper
            code={HERO_DEMO_CODE}
            steps={HERO_DEMO_STEPS}
            title="即時追蹤示範：Q8 遞迴去程與回程 Call Stack"
          />
        </div>
      </section>

      {/* Five Hardware Topic Modules (Asymmetric 2 + 3 Rack) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#11151C]">五大主題互動模組機櫃</h2>
            <p className="mt-1 text-sm text-[#4B5565]">
              每個單元都是一台可親手調參數、看動畫的專用實驗儀器，完整涵蓋 APCS 0915 範例 30 題
            </p>
          </div>
          <Link
            href="/topics"
            className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
          >
            <span>查看 30 題完整關卡矩陣</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {topics.map((topic, idx) => {
            const theme = getTopicTheme(topic.slug, idx);
            const spanClass = idx < 2 ? "md:col-span-3" : "md:col-span-2";
            const solvedRatio =
              topic.student_correct !== undefined && topic.question_count > 0
                ? Math.round((topic.student_correct / topic.question_count) * 100)
                : null;

            return (
              <article
                key={topic.id}
                className={`${spanClass} synth-panel-hard overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  {/* Color Channel Top Bar */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: theme.hex }}
                  />

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-display text-xs font-bold"
                        style={{
                          backgroundColor: theme.softBg,
                          borderColor: theme.border,
                          color: theme.text,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.hex }}
                        />
                        {theme.code}
                      </span>

                      <div className="flex items-center gap-2 font-code text-xs text-[#4B5565] tabular-nums">
                        {topic.student_correct !== undefined && (
                          <span className="rounded-full bg-[#E6FAF3] px-2 py-0.5 font-bold text-[#007A57]">
                            {topic.student_correct}/{topic.question_count} 過關
                          </span>
                        )}
                        <span className="font-bold text-[#11151C]">
                          {topic.question_count} 題
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-[#11151C] leading-snug">
                      <Link
                        href={`/topics/${topic.slug}`}
                        className="hover:underline"
                      >
                        {topic.title}
                      </Link>
                    </h3>

                    <p className="text-sm leading-relaxed text-[#4B5565]">
                      {topic.summary}
                    </p>

                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F1F3F7] border border-[#D4DAE4] px-2.5 py-1 text-xs font-bold text-[#11151C]">
                      <FlaskConical className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                      <span>儀器：{theme.labLabel}</span>
                    </div>

                    {solvedRatio !== null && (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#DDE2EA]">
                        <div
                          style={{
                            width: `${solvedRatio}%`,
                            backgroundColor: theme.hex,
                          }}
                          className="h-full ui-transition"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[#D4DAE4] bg-[#F8F9FB] px-5 py-3.5">
                  <Link
                    href={`/topics/${topic.slug}`}
                    style={{ backgroundColor: theme.buttonBg }}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#161A22] px-3 py-2 text-xs font-bold text-white shadow-xs ui-transition hover:opacity-90"
                  >
                    <Cpu className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>開啟實驗室</span>
                  </Link>
                  <Link
                    href={`/practice?topic=${topic.slug}`}
                    className="synth-pad inline-flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold"
                  >
                    <span>直接刷題</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Six Trigger Pads: Question Type Drills */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-[#11151C]">六大考法專攻發射墊</h2>
          <p className="mt-1 text-sm text-[#4B5565]">
            APCS 不只問執行結果，還會考「填補條件、找 BUG、舉反例、抓死碼」— 點一個發射墊立即專練
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {allTypes.map((qt) => (
            <Link
              key={qt}
              href={`/practice?type=${qt}`}
              className="synth-pad group flex flex-col justify-between p-4"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-[#161A22] px-2 py-0.5 font-display text-[11px] font-bold text-white">
                    {QUESTION_TYPE_PAD_CODES[qt]}
                  </span>
                  <Zap
                    className="h-3.5 w-3.5 text-[#647082] group-hover:text-[#FF4F17] ui-transition"
                    strokeWidth={2.2}
                  />
                </div>
                <h3 className="text-sm font-black text-[#11151C] group-hover:text-[#D93B09]">
                  {QUESTION_TYPE_LABELS[qt]}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4B5565]">
                  {QUESTION_TYPE_DESCRIPTIONS[qt]}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 font-code text-[11px] font-bold text-[#D93B09]">
                <span>START</span>
                <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dual Role Console Strip */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="synth-panel-hard overflow-hidden">
          <div className="h-1.5 w-full bg-[#FF4F17]" />
          <div className="p-5 sm:p-6 space-y-2.5">
            <h3 className="text-base font-black text-[#11151C]">
              學生自主練習與班級同步
            </h3>
            <p className="text-sm leading-relaxed text-[#4B5565]">
              登入或註冊帳號並輸入老師的 6 碼班級代碼（如{" "}
              <code className="rounded bg-[#FFF1EC] px-1.5 py-0.5 font-code text-xs font-bold text-[#B83006]">
                APCS2A
              </code>
              ），就能在所有關卡方格點亮綠燈破關印記，並將錯題一鍵送回追蹤器重播。
            </p>
          </div>
        </div>

        <div className="synth-panel-hard overflow-hidden">
          <div className="h-1.5 w-full bg-[#007A5B]" />
          <div className="p-5 sm:p-6 space-y-2.5">
            <h3 className="text-base font-black text-[#11151C]">
              教師班級管理與弱點熱度矩陣
            </h3>
            <p className="text-sm leading-relaxed text-[#4B5565]">
              資訊科教師登入後可直接開立班級、編修五大主題講義、建立班級專屬題目與指派練習作業，即時從「主題 × 考法」熱度矩陣找出全班盲點。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
