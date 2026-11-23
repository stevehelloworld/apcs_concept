import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, hydrateQuestion } from "@/lib/db";
import { listTeacherAssignments } from "@/lib/teacher-queries";
import type { ClassRecord } from "@/lib/types";
import { TeacherAssignmentsClient } from "@/components/teacher/TeacherAssignmentsClient";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const db = await getDb();
  const assignments = await listTeacherAssignments(user.id);
  const classes = await db.queryAll<ClassRecord>(
    "SELECT * FROM classes WHERE teacher_id = ? ORDER BY id ASC",
    [user.id]
  );
  const qRows = await db.queryAll<Record<string, unknown>>(
    `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name
     FROM questions q
     JOIN topics t ON t.id = q.topic_id
     LEFT JOIN classes c ON c.id = q.class_id
     WHERE q.is_published = 1 AND (q.class_id IS NULL OR q.created_by = ? OR c.teacher_id = ?)
     ORDER BY t.sort_order ASC, q.id ASC`,
    [user.id, user.id]
  );

  return (
    <TeacherAssignmentsClient
      initialAssignments={assignments}
      classes={classes}
      questions={qRows.map(hydrateQuestion)}
    />
  );
}
