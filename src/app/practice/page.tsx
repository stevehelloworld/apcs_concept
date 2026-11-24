import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics, queryVisibleQuestions } from "@/lib/queries";
import { PracticeWorkbenchClient } from "@/components/PracticeWorkbenchClient";

export const dynamic = "force-dynamic";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{
    topic?: string;
    type?: string;
    difficulty?: string;
    status?: string;
    source?: string;
    assignmentId?: string;
    qid?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);

  const initialTopic = sp.topic ?? "all";
  const initialType = sp.type ?? "all";
  const initialDifficulty = sp.difficulty ?? "all";
  const initialStatus = sp.status ?? "all";
  const initialSource = sp.source ?? "all";
  const initialAssignmentId = sp.assignmentId ? Number(sp.assignmentId) : null;
  const rawQid = sp.qid ?? sp.q;
  const initialQuestionId = rawQid ? Number(rawQid) : null;

  const initialQuestions = await queryVisibleQuestions(user, {
    topicSlug: initialTopic,
    questionType: initialType,
    difficulty: initialDifficulty,
    status: initialStatus,
    source: initialSource,
    assignmentId: initialAssignmentId ?? undefined,
  });

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
      <PracticeWorkbenchClient
        topics={topics}
        initialQuestions={initialQuestions}
        initialTopic={initialTopic}
        initialType={initialType}
        initialDifficulty={initialDifficulty}
        initialStatus={initialStatus}
        initialSource={initialSource}
        initialAssignmentId={initialAssignmentId}
        initialQuestionId={initialQuestionId}
        isLoggedIn={Boolean(user)}
      />
    </div>
  );
}
