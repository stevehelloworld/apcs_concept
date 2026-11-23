import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, hydrateTopic } from "@/lib/db";
import { TeacherTopicsClient } from "@/components/teacher/TeacherTopicsClient";

export const dynamic = "force-dynamic";

export default async function TeacherTopicsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const db = await getDb();
  const rows = await db.queryAll<Record<string, unknown>>(
    "SELECT * FROM topics ORDER BY sort_order ASC, id ASC"
  );

  return <TeacherTopicsClient initialTopics={rows.map(hydrateTopic)} />;
}
