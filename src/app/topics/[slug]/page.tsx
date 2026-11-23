import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Terminal } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTopicBySlugForUser, listPublishedTopics } from "@/lib/queries";
import { QUESTION_TYPE_LABELS } from "@/lib/types";
import { PythonCodeView } from "@/components/PythonCodeView";
import { TopicVisualizerHost } from "@/components/visualizers/TopicVisualizerHost";
import { PracticeQuestionCard } from "@/components/PracticeQuestionCard";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const data = await getTopicBySlugForUser(slug, user);
  if (!data) {
    notFound();
  }

  const allTopics = await listPublishedTopics(user);
  const currentIdx = allTopics.findIndex((t) => t.slug === slug);
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  const { topic, questions } = data;
  const checkInQuestions = questions.slice(0, 3);
  const distinctTypes = Array.from(new Set(questions.map((q) => q.question_type)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Topic & Section Navigation Rail */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-lg border border-[#E2E0D8] bg-[#F0EFEA] p-4 space-y-2">
              <div className="text-xs font-semibold text-[#525866]">全主題切換</div>
              <nav className="space-y-1">
                {allTopics.map((t, i) => {
                  const active = t.slug === topic.slug;
                  return (
                    <Link
                      key={t.id}
                      href={`/topics/${t.slug}`}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium ui-transition ${
                        active
                          ? "bg-[#1E4E8C] text-white"
                          : "text-[#17191C] hover:bg-white"
                      }`}
                    >
                      <span className="truncate">
                        {i + 1}. {t.title}
                      </span>
                      <span className="ml-2 font-code tabular-nums opacity-80">
                        {t.question_count}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-lg border border-[#E2E0D8] bg-white p-4 space-y-2">
              <div className="text-xs font-semibold text-[#525866]">本頁六段式結構</div>
              <ul className="space-y-1.5 text-xs text-[#525866]">
                <li>
                  <a href="#exam-card" className="hover:text-[#1E4E8C]">
                    1. 考點儀表板
                  </a>
                </li>
                <li>
                  <a href="#core-concepts" className="hover:text-[#1E4E8C]">
                    2. 核心觀念與 Python 備忘
                  </a>
                </li>
                <li>
                  <a href="#interactive-lab" className="hover:text-[#1E4E8C]">
                    3. 主題專屬互動視覺化實驗室
                  </a>
                </li>
                <li>
                  <a href="#official-walkthrough" className="hover:text-[#1E4E8C]">
                    4. 官方範例題目索引
                  </a>
                </li>
                <li>
                  <a href="#pitfalls" className="hover:text-[#1E4E8C]">
                    5. 高頻地雷對照博物館
                  </a>
                </li>
                <li>
                  <a href="#checkin-quiz" className="hover:text-[#1E4E8C]">
                    6. 即時微測驗與迷思診斷
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main 6-Section Instructional Body */}
        <div className="lg:col-span-9 space-y-10">
          {/* 1. Exam Card */}
          <section
            id="exam-card"
            className="rounded-lg border border-[#E2E0D8] bg-white p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href="/topics"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#525866] hover:text-[#1E4E8C]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>返回全主題目錄</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#525866]">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>建議研讀 {topic.study_minutes} 分鐘</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#17191C] sm:text-3xl">{topic.title}</h1>
              <p className="mt-1 text-base font-medium text-[#1E4E8C]">{topic.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#525866] max-w-3xl">
                {topic.summary}
              </p>
            </div>

            <div className="grid gap-3 border-t border-[#E2E0D8] pt-4 sm:grid-cols-3">
              <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3">
                <div className="text-xs text-[#525866]">命題比重與題號</div>
                <div className="mt-1 text-sm font-semibold text-[#17191C]">
                  {topic.exam_weight}
                </div>
              </div>
              <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3">
                <div className="text-xs text-[#525866]">本單元題庫數</div>
                <div className="mt-1 font-code text-sm font-semibold text-[#1E4E8C] tabular-nums">
                  {questions.length} 題可練習
                </div>
              </div>
              <div className="rounded-md border border-[#E2E0D8] bg-[#F7F6F2] p-3">
                <div className="text-xs text-[#525866]">涵蓋認知題型</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {distinctTypes.map((qt) => (
                    <span
                      key={qt}
                      className="rounded border border-[#E2E0D8] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#17191C]"
                    >
                      {QUESTION_TYPE_LABELS[qt]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 2. Core Concepts */}
          <section id="core-concepts" className="space-y-4">
            <h2 className="text-xl font-bold text-[#17191C]">核心觀念與 Python 識讀備忘</h2>
            <div className="space-y-4">
              {topic.core_concepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3"
                >
                  <h3 className="text-base font-semibold text-[#17191C]">
                    {idx + 1}. {concept.title}
                  </h3>
                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-6 space-y-2.5">
                      <p className="text-sm leading-relaxed text-[#525866]">
                        {concept.summary}
                      </p>
                      <div className="rounded-md border border-[#C7DAEE] bg-[#EAF1FA] p-3 text-xs leading-relaxed text-[#17191C]">
                        <strong className="text-[#1E4E8C]">考場識讀重點：</strong>
                        {concept.note}
                      </div>
                    </div>
                    <div className="lg:col-span-6">
                      <PythonCodeView code={concept.code} compact />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Topic-Specific Interactive Visualizer */}
          <section id="interactive-lab" className="space-y-3">
            <h2 className="text-xl font-bold text-[#17191C]">主題專屬互動視覺化實驗室</h2>
            <TopicVisualizerHost type={topic.visualizer_type} />
          </section>

          {/* 4. Official Sample Question Walkthrough List */}
          <section id="official-walkthrough" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#17191C]">
                本主題官方範例與精選練習索引（共 {questions.length} 題）
              </h2>
              <Link
                href={`/practice?topic=${topic.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#163C6E]"
              >
                <Terminal className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>在刷題工作台練習全部題目</span>
              </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#E2E0D8] bg-white divide-y divide-[#E2E0D8]">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-[#F7F6F2]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-[#17191C] px-2 py-0.5 font-code text-xs text-white">
                      {q.official_ref ?? `#${q.id}`}
                    </span>
                    <span className="font-medium text-[#17191C]">{q.title}</span>
                    <span className="rounded border border-[#E2E0D8] bg-[#F7F6F2] px-2 py-0.5 text-xs text-[#525866]">
                      {QUESTION_TYPE_LABELS[q.question_type]}
                    </span>
                  </div>
                  <Link
                    href={`/practice?topic=${topic.slug}&qid=${q.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#1E4E8C] hover:underline"
                  >
                    <span>進入題目與單步追蹤</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Misconception Pitfalls Museum */}
          <section id="pitfalls" className="space-y-4">
            <h2 className="text-xl font-bold text-[#17191C]">高頻地雷博物館（錯碼 × 反例 × 正解）</h2>
            <div className="space-y-4">
              {topic.pitfalls.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E2E0D8] bg-white p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#C23535]">{p.title}</h3>
                    <span className="rounded border border-[#C23535]/30 bg-[#FCEEEE] px-2.5 py-0.5 text-xs font-medium text-[#C23535]">
                      觸發測資：{p.triggerInput}
                    </span>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-1.5 text-xs font-semibold text-[#C23535]">常見錯誤寫法</div>
                      <PythonCodeView code={p.wrongCode} compact />
                    </div>
                    <div>
                      <div className="mb-1.5 text-xs font-semibold text-[#157F4B]">修正方向 / 判斷原則</div>
                      <PythonCodeView code={p.fixedCode} compact />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[#525866]">{p.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Check-in Micro Quiz */}
          <section id="checkin-quiz" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#17191C]">本主題即時微測驗</h2>
                <p className="text-sm text-[#525866]">
                  {user
                    ? "作答結果會即時寫入學習紀錄，並於答錯時呈現專屬迷思診斷與追蹤重播。"
                    : "登入學生帳號即可即時送出批改並保存學習軌跡。"}
                </p>
              </div>
              <Link
                href={`/practice?topic=${topic.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#1E4E8C] hover:underline"
              >
                <BookOpen className="h-4 w-4" strokeWidth={1.75} />
                <span>練習本主題完整題庫</span>
              </Link>
            </div>

            <div className="space-y-5">
              {checkInQuestions.map((q) => (
                <PracticeQuestionCard
                  key={q.id}
                  question={q}
                  isLoggedIn={Boolean(user)}
                />
              ))}
            </div>
          </section>

          {/* Prev / Next Topic Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E2E0D8] pt-6">
            {prevTopic ? (
              <Link
                href={`/topics/${prevTopic.slug}`}
                className="inline-flex items-center gap-2 rounded-md border border-[#E2E0D8] bg-white px-4 py-2 text-sm font-medium text-[#17191C] hover:bg-[#F0EFEA]"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                <span>上一單元：{prevTopic.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextTopic && (
              <Link
                href={`/topics/${nextTopic.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-[#1E4E8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#163C6E]"
              >
                <span>下一單元：{nextTopic.title}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
