import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildStudentDashboard } from "@/lib/queries";
import { StudentDashboardClient } from "@/components/StudentDashboardClient";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role === "teacher") {
    redirect("/teacher");
  }

  const dashboard = await buildStudentDashboard(user);
  return <StudentDashboardClient initialData={dashboard} />;
}
