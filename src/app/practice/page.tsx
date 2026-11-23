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
    assignmentId?: string;
    qid?: string;
  }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);

  const initialTopic = sp.topic ?? "all";
  const initialType = sp.type ?? "all";
  const initialDifficulty = sp.difficulty ?? "all";
  const initialStatus = sp.status ?? "all";
  const initialAssignmentId = sp.assignmentId ? Number(sp.assignmentId) : null;
  const initialQuestionId = sp.qid ? Number(sp.qid) : null;

  const initialQuestions = await queryVisibleQuestions(user, {
    topicSlug: initialTopic,
    questionType: initialType,
    difficulty: initialDifficulty,
    status: initialStatus,
    assignmentId: initialAssignmentId ?? undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PracticeWorkbenchClient
        topics={topics}
        initialQuestions={initialQuestions}
        initialTopic={initialTopic}
        initialType={initialType}
        initialDifficulty={initialDifficulty}
        initialStatus={initialStatus}
        initialAssignmentId={initialAssignmentId}
        initialQuestionId={initialQuestionId}
        isLoggedIn={Boolean(user)}
      />
    </div>
  );
}
