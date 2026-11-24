import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Terminal } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  CONCEPT_LESSONS_BY_TOPIC,
  TOPIC_SYLLABUS_TAGS,
} from "@/lib/concept-lessons";
import { getTopicBySlugForUser, listPublishedTopics } from "@/lib/queries";
import { getTopicTheme } from "@/lib/topic-theme";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/types";
import { ConceptDeckClient } from "@/components/ConceptDeckClient";
import { PitfallCompareClient } from "@/components/PitfallCompareClient";
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
  const conceptLessons =
    CONCEPT_LESSONS_BY_TOPIC[topic.slug] ??
    CONCEPT_LESSONS_BY_TOPIC["control-flow"];
  const syllabusTags = TOPIC_SYLLABUS_TAGS[topic.slug] ?? [];

  const officialCount = questions.filter((q) =>
    q.official_ref?.startsWith("0915-")
  ).length;
  const mockCount = questions.filter((q) =>
    q.official_ref?.startsWith("SIM-")
  ).length;
  const checkInQuestions = questions.slice(0, 3);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8 space-y-6">
      {/* Top Horizontal Line Switcher + Section Anchors */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {allTopics.map((t, i) => {
            const tTheme = getTopicTheme(t.slug, i);
            const active = t.slug === topic.slug;
            return (
              <Link
                key={t.id}
                href={`/topics/${t.slug}`}
                className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold ui-transition"
                style={
                  active
                    ? { backgroundColor: tTheme.hex, color: tTheme.buttonText }
                    : {
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#B8C5E0",
                      }
                }
              >
                <span className="font-code">{tTheme.code}</span>
                <span className="hidden sm:inline">{tTheme.shortLabel}</span>
              </Link>
            );
          })}
        </div>

        <nav className="flex flex-wrap items-center gap-3 font-code text-xs text-[#B8C5E0]">
          <a href="#core-concepts" className="hover:text-white">
            互動觀念
          </a>
          <a href="#interactive-lab" className="hover:text-white">
            實驗室
          </a>
          <a href="#official-walkthrough" className="hover:text-white">
            站點
          </a>
          <a href="#pitfalls" className="hover:text-white">
            地雷
          </a>
          <a href="#checkin-quiz" className="hover:text-white">
            即測
          </a>
        </nav>
      </div>

      {/* Compact Line Banner */}
      <section className="rail-frame overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: theme.hex }} />
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-display text-xs font-extrabold"
                style={{ backgroundColor: theme.hex, color: theme.buttonText }}
              >
                {theme.code}
              </span>
              <h1 className="text-xl font-black text-white sm:text-2xl">
                {topic.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-code text-xs text-[#B8C5E0] tabular-nums">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                {topic.study_minutes}m
              </span>
              <span>·</span>
              <span>官方 {officialCount}</span>
              {mockCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#7AA4FF]">原創模擬 {mockCount}</span>
                </>
              )}
              {syllabusTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/15 bg-[#070C22] px-2 py-0.5 text-[11px] text-[#B8C5E0]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/topics"
              className="rail-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
              <span>路線表</span>
            </Link>
            <Link
              href={`/practice?topic=${topic.slug}`}
              className="rail-btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
            >
              <Terminal className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>整線刷題</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Concept Deck */}
      <section id="core-concepts" className="space-y-3">
        <h2 className="font-display text-xl font-extrabold tracking-wide text-white">
          互動觀念實驗卡
        </h2>
        <ConceptDeckClient
          theme={theme}
          lessons={conceptLessons}
          cmsConcepts={topic.core_concepts}
        />
      </section>

      {/* Topic-Specific Interactive Visualizer */}
      <section id="interactive-lab" className="space-y-3">
        <h2 className="font-display text-xl font-extrabold tracking-wide text-white">
          {theme.labLabel}
        </h2>
        <TopicVisualizerHost type={topic.visualizer_type} />
      </section>

      {/* Station Matrix (Official + Mock SIM) */}
      <section id="official-walkthrough" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold tracking-wide text-white">
            本線站點（{questions.length}）
          </h2>
          <Link
            href={`/practice?topic=${topic.slug}`}
            className="font-code text-xs font-bold text-[#B8C5E0] hover:text-white"
          >
            進入刷題台 →
          </Link>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => {
            const att = q.user_last_attempt;
            const isSim = q.official_ref?.startsWith("SIM-");
            const dotColor = att
              ? att.is_correct
                ? "#22B14C"
                : "#E21D2D"
              : "#FFFFFF";

            return (
              <Link
                key={q.id}
                href={`/practice?topic=${topic.slug}&qid=${q.id}`}
                className="rail-well group flex items-center justify-between gap-2.5 px-3 py-2.5 hover:border-white/50 ui-transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 border-2"
                    style={{
                      backgroundColor: dotColor,
                      borderColor: att ? "#FFFFFF" : theme.hex,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-code text-[11px] text-[#7E91B8]">
                      <span
                        className={`rounded px-1.5 py-0.2 font-bold ${
                          isSim
                            ? "bg-[#1E5BFF]/25 text-[#7AA4FF] border border-[#1E5BFF]/45"
                            : "bg-white text-[#0B1230]"
                        }`}
                      >
                        {q.official_ref ?? `Q${q.id}`}
                      </span>
                      <span>{QUESTION_TYPE_LABELS[q.question_type]}</span>
                      <span>·</span>
                      <span>{DIFFICULTY_LABELS[q.difficulty]}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs font-bold text-[#B8C5E0] group-hover:text-white">
                      {q.title}
                    </div>
                  </div>
                </div>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 text-[#7E91B8] group-hover:text-white"
                  strokeWidth={2}
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Interactive Tabbed A/B Pitfalls */}
      <section id="pitfalls" className="space-y-3">
        <h2 className="font-display text-xl font-extrabold tracking-wide text-white">
          A/B 地雷對照
        </h2>
        <PitfallCompareClient pitfalls={topic.pitfalls} />
      </section>

      {/* Check-in Micro Quiz */}
      <section id="checkin-quiz" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold tracking-wide text-white">
            即時微測驗
          </h2>
          <Link
            href={`/practice?topic=${topic.slug}`}
            className="font-code text-xs font-bold text-[#B8C5E0] hover:text-white"
          >
            完整題庫 →
          </Link>
        </div>

        <div className="space-y-4">
          {checkInQuestions.map((q) => (
            <PracticeQuestionCard
              key={q.id}
              question={q}
              isLoggedIn={Boolean(user)}
            />
          ))}
        </div>
      </section>

      {/* Prev / Next Topic Line Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
        {prevTopic ? (
          <Link
            href={`/topics/${prevTopic.slug}`}
            className="rail-btn inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            <span>{prevTopic.title}</span>
          </Link>
        ) : (
          <span />
        )}

        {nextTopic && (
          <Link
            href={`/topics/${nextTopic.slug}`}
            className="rail-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
          >
            <span>{nextTopic.title}</span>
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        )}
      </div>
    </div>
  );
}
