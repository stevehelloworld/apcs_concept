import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics, queryVisibleQuestions } from "@/lib/queries";
import { TransitNetworkMap } from "@/components/TransitNetworkMap";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [topics, questions] = await Promise.all([
    listPublishedTopics(user),
    queryVisibleQuestions(user, {}),
  ]);

  return (
    <div className="mx-auto max-w-[1520px] px-3 sm:px-5 py-4">
      <TransitNetworkMap
        topics={topics}
        questions={questions}
        isLoggedIn={Boolean(user)}
      />
    </div>
  );
}
