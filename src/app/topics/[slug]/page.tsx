import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Terminal } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTopicBySlugForUser, listPublishedTopics } from "@/lib/queries";
import { getTopicTheme } from "@/lib/topic-theme";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";
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
  const theme = getTopicTheme(topic.slug, currentIdx);
  const checkInQuestions = questions.slice(0, 3);
  const distinctTypes = Array.from(new Set(questions.map((q) => q.question_type)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Hardware Channel Rail */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            <div className="synth-panel p-4 space-y-3">
              <div className="font-display text-xs font-bold text-[#4B5565]">
                CH // 切換主題模組
              </div>
              <nav className="space-y-1.5" aria-label="主題單元切換">
                {allTopics.map((t, i) => {
                  const tTheme = getTopicTheme(t.slug, i);
                  const active = t.slug === topic.slug;
                  return (
                    <Link
                      key={t.id}
                      href={`/topics/${t.slug}`}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold ui-transition ${
                        active
                          ? "border-[#161A22] bg-[#161A22] text-white shadow-xs"
                          : "border-[#C4CBD6] bg-white text-[#11151C] hover:border-[#161A22]"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: tTheme.hex }}
                        />
                        <span className="truncate">{t.title}</span>
                      </span>
                      <span className="ml-2 font-code tabular-nums opacity-75">
                        {t.question_count}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="synth-panel p-4 space-y-2.5">
              <div className="font-display text-xs font-bold text-[#4B5565]">
                本課六段式學習路線
              </div>
              <ul className="space-y-1.5 text-xs font-medium text-[#4B5565]">
                <li>
                  <a href="#exam-card" className="block py-0.5 hover:text-[#11151C]">
                    1. 考點規格面板
                  </a>
                </li>
                <li>
                  <a href="#core-concepts" className="block py-0.5 hover:text-[#11151C]">
                    2. 核心觀念與 Python 備忘
                  </a>
                </li>
                <li>
                  <a href="#interactive-lab" className="block py-0.5 hover:text-[#11151C]">
                    3. 主題專屬互動實驗室
                  </a>
                </li>
                <li>
                  <a href="#official-walkthrough" className="block py-0.5 hover:text-[#11151C]">
                    4. 本單元題庫關卡矩陣
                  </a>
                </li>
                <li>
                  <a href="#pitfalls" className="block py-0.5 hover:text-[#11151C]">
                    5. A/B 高頻地雷對照室
                  </a>
                </li>
                <li>
                  <a href="#checkin-quiz" className="block py-0.5 hover:text-[#11151C]">
                    6. 即時微測驗與追蹤重播
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main 6-Stage Instructional Lab */}
        <div className="lg:col-span-9 space-y-10 min-w-0">
          {/* 1. Module Spec Card */}
          <section id="exam-card" className="synth-panel-hard overflow-hidden">
            <div className="h-2.5 w-full" style={{ backgroundColor: theme.hex }} />
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href="/topics"
                  className="synth-pad inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>返回全模組矩陣</span>
                </Link>

                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2.5 py-1 font-display text-xs font-bold text-white"
                    style={{ backgroundColor: "#161A22" }}
                  >
                    {theme.code}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#C4CBD6] bg-[#F8F9FB] px-2.5 py-1 font-code text-xs font-bold text-[#4B5565]">
                    <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                    <span>建議 {topic.study_minutes} 分鐘</span>
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#11151C] sm:text-3xl leading-tight">
                  {topic.title}
                </h1>
                <p className="mt-1.5 text-base font-bold" style={{ color: theme.text }}>
                  {topic.subtitle}
                </p>
                <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-[#4B5565]">
                  {topic.summary}
                </p>
              </div>

              <div className="grid gap-3 border-t border-[#D4DAE4] pt-4 sm:grid-cols-3">
                <div className="synth-recess p-3.5">
                  <div className="text-xs font-bold text-[#4B5565]">官方題號與比重</div>
                  <div className="mt-1 text-sm font-black text-[#11151C]">
                    {topic.exam_weight}
                  </div>
                </div>
                <div className="synth-recess p-3.5">
                  <div className="text-xs font-bold text-[#4B5565]">本模組題庫數量</div>
                  <div
                    className="mt-1 font-display text-lg font-bold tabular-nums"
                    style={{ color: theme.text }}
                  >
                    {questions.length} 題可實戰
                  </div>
                </div>
                <div className="synth-recess p-3.5">
                  <div className="text-xs font-bold text-[#4B5565]">涵蓋考法題型</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {distinctTypes.map((qt) => (
                      <span
                        key={qt}
                        className="rounded border border-[#C4CBD6] bg-white px-2 py-0.5 text-[11px] font-bold text-[#11151C]"
                      >
                        {QUESTION_TYPE_LABELS[qt]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Core Concepts */}
          <section id="core-concepts" className="space-y-4">
            <h2 className="text-xl font-black text-[#11151C]">
              核心觀念與 Python 識讀備忘
            </h2>
            <div className="space-y-4">
              {topic.core_concepts.map((concept, idx) => (
                <div key={idx} className="synth-panel-hard p-5 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-display text-xs font-bold text-white"
                      style={{ backgroundColor: theme.buttonBg }}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-black text-[#11151C]">
                      {concept.title}
                    </h3>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-6 space-y-3">
                      <p className="text-sm leading-relaxed text-[#4B5565]">
                        {concept.summary}
                      </p>
                      <div
                        className="rounded-xl border p-3.5 text-xs leading-relaxed text-[#11151C]"
                        style={{
                          backgroundColor: theme.softBg,
                          borderColor: theme.border,
                        }}
                      >
                        <strong className="mr-1" style={{ color: theme.text }}>
                          考場關鍵提醒：
                        </strong>
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
            <h2 className="text-xl font-black text-[#11151C]">
              互動實驗室：{theme.labLabel}
            </h2>
            <TopicVisualizerHost type={topic.visualizer_type} />
          </section>

          {/* 4. Official Sample Question Sequencer Index */}
          <section id="official-walkthrough" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#11151C]">
                本單元題庫關卡矩陣（共 {questions.length} 題）
              </h2>
              <Link
                href={`/practice?topic=${topic.slug}`}
                className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>全部載入刷題台</span>
              </Link>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {questions.map((q) => {
                const att = q.user_last_attempt;
                const ledCls = att
                  ? att.is_correct
                    ? "bg-[#00C48C]"
                    : "bg-[#FF4757]"
                  : "border border-[#647082] bg-white";

                return (
                  <Link
                    key={q.id}
                    href={`/practice?topic=${topic.slug}&qid=${q.id}`}
                    className="synth-pad group flex items-center justify-between gap-3 p-3.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#161A22] px-2 py-0.5 font-code text-[11px] font-bold text-white">
                          {q.official_ref ?? `#${q.id}`}
                        </span>
                        <span className="text-[11px] font-bold text-[#4B5565]">
                          {QUESTION_TYPE_LABELS[q.question_type]}
                        </span>
                        <span className="text-[11px] text-[#647082]">
                          {DIFFICULTY_LABELS[q.difficulty]}
                        </span>
                      </div>
                      <div className="truncate text-sm font-bold text-[#11151C] group-hover:text-[#D93B09]">
                        {q.title}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${ledCls}`} />
                      <ArrowRight
                        className="h-4 w-4 text-[#647082] group-hover:translate-x-0.5 group-hover:text-[#D93B09] ui-transition"
                        strokeWidth={2}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 5. A/B Pitfall Diagnostic Deck */}
          <section id="pitfalls" className="space-y-4">
            <h2 className="text-xl font-black text-[#11151C]">
              A/B 高頻地雷對照室（錯碼 × 反例測資 × 正解）
            </h2>
            <div className="space-y-4">
              {topic.pitfalls.map((p, idx) => (
                <div key={idx} className="synth-panel-hard p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-black text-[#C62828]">
                      {p.title}
                    </h3>
                    <span className="rounded-full border border-[#FCD47A] bg-[#FFF6E0] px-3 py-0.5 font-code text-xs font-bold text-[#9A5800]">
                      觸發測資：{p.triggerInput}
                    </span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 font-code text-xs font-bold text-[#C62828]">
                        <span className="h-2 w-2 rounded-full bg-[#FF4757]" />
                        <span>CH-A // 常見地雷寫法</span>
                      </div>
                      <PythonCodeView code={p.wrongCode} compact />
                    </div>
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 font-code text-xs font-bold text-[#007A57]">
                        <span className="h-2 w-2 rounded-full bg-[#00C48C]" />
                        <span>CH-B // 正確判斷原則</span>
                      </div>
                      <PythonCodeView code={p.fixedCode} compact />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[#4B5565]">
                    {p.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Check-in Micro Quiz */}
          <section id="checkin-quiz" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#11151C]">
                  本單元即時微測驗
                </h2>
                <p className="mt-1 text-sm text-[#4B5565]">
                  {user
                    ? "作答結果會即時更新綠燈過關紀錄，答錯立即呈現迷思診斷與追蹤器。"
                    : "登入學生帳號即可送出批改、累積進度並重播執行軌跡。"}
                </p>
              </div>
              <Link
                href={`/practice?topic=${topic.slug}`}
                className="synth-pad inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold"
              >
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                <span>練習本單元完整題庫</span>
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

          {/* Prev / Next Module Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#C4CBD6] pt-6">
            {prevTopic ? (
              <Link
                href={`/topics/${prevTopic.slug}`}
                className="synth-pad inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                <span>上一單元：{prevTopic.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextTopic && (
              <Link
                href={`/topics/${nextTopic.slug}`}
                className="synth-pad-orange inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
              >
                <span>下一單元：{nextTopic.title}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
