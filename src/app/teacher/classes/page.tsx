import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { ClassRecord } from "@/lib/types";
import { TeacherClassesClient } from "@/components/teacher/TeacherClassesClient";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const db = await getDb();
  const classes = await db.queryAll<ClassRecord>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) AS member_count,
       (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS assignment_count
     FROM classes c
     WHERE c.teacher_id = ?
     ORDER BY c.id ASC`,
    [user.id]
  );

  return <TeacherClassesClient initialClasses={classes} />;
}
