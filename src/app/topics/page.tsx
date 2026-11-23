import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics, queryVisibleQuestions } from "@/lib/queries";
import { TopicsDirectoryClient } from "@/components/TopicsDirectoryClient";

export const dynamic = "force-dynamic";

export default async function TopicsDirectoryPage() {
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);
  const allQuestions = await queryVisibleQuestions(user, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Persistent Topic Rail */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 rounded-lg border border-[#E2E0D8] bg-[#F0EFEA] p-4 space-y-3">
            <div className="text-xs font-semibold text-[#525866]">主題單元快速切換</div>
            <nav className="space-y-1" aria-label="主題單元導覽">
              {topics.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/topics/${t.slug}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-[#17191C] ui-transition hover:bg-white hover:text-[#1E4E8C]"
                >
                  <span className="truncate">
                    {i + 1}. {t.title}
                  </span>
                  <span className="ml-2 shrink-0 font-code text-xs text-[#6C7382] tabular-nums">
                    {t.question_count}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-[#E2E0D8] pt-3">
              <Link
                href="/practice"
                className="block w-full rounded-md bg-[#1E4E8C] px-3 py-2 text-center text-xs font-medium text-white hover:bg-[#163C6E]"
              >
                前往綜合刷題工作台
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Dual-Axis Directory */}
        <div className="lg:col-span-9">
          <TopicsDirectoryClient topics={topics} allQuestions={allQuestions} />
        </div>
      </div>
    </div>
  );
}
