import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics, queryVisibleQuestions } from "@/lib/queries";
import { TopicsDirectoryClient } from "@/components/TopicsDirectoryClient";

export const dynamic = "force-dynamic";

export default async function TopicsDirectoryPage() {
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);
  const allQuestions = await queryVisibleQuestions(user, {});

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
      <TopicsDirectoryClient
        topics={topics}
        allQuestions={allQuestions}
        isLoggedIn={Boolean(user)}
      />
    </div>
  );
}
