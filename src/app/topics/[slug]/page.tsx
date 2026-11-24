import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  CONCEPT_LESSONS_BY_TOPIC,
  TOPIC_SYLLABUS_TAGS,
} from "@/lib/concept-lessons";
import { getTopicBySlugForUser, listPublishedTopics } from "@/lib/queries";
import { getTopicTheme } from "@/lib/topic-theme";
import { TopicCockpitClient } from "@/components/TopicCockpitClient";

export const dynamic = "force-dynamic";

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();
  const data = await getTopicBySlugForUser(slug, user);
  if (!data) {
    notFound();
  }

  const allTopics = await listPublishedTopics(user);
  const currentIdx = allTopics.findIndex((t) => t.slug === slug);

  const { topic, questions } = data;
  const theme = getTopicTheme(topic.slug, currentIdx);
  const conceptLessons =
    CONCEPT_LESSONS_BY_TOPIC[topic.slug] ??
    CONCEPT_LESSONS_BY_TOPIC["control-flow"];
  const syllabusTags = TOPIC_SYLLABUS_TAGS[topic.slug] ?? [];

  return (
    <TopicCockpitClient
      topic={topic}
      allTopics={allTopics}
      questions={questions}
      theme={theme}
      conceptLessons={conceptLessons}
      syllabusTags={syllabusTags}
      initialStage={sp.stage ?? "recon"}
      isLoggedIn={Boolean(user)}
      userRole={user?.role ?? null}
    />
  );
}
