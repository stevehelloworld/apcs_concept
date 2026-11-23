import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildTeacherAnalytics } from "@/lib/teacher-queries";
import { TeacherAnalyticsClient } from "@/components/teacher/TeacherAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function TeacherOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const res = await buildTeacherAnalytics(user.id, null);
  if (!res.ok) {
    return (
      <div className="rounded-lg border border-[#C23535]/30 bg-white p-6 text-sm text-[#C23535]">
        {res.error}
      </div>
    );
  }

  return <TeacherAnalyticsClient initialData={res.data} />;
}
