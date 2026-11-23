import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, hydrateQuestion, hydrateTopic } from "@/lib/db";
import type { ClassRecord } from "@/lib/types";
import { TeacherQuestionsClient } from "@/components/teacher/TeacherQuestionsClient";

export const dynamic = "force-dynamic";

export default async function TeacherQuestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const db = await getDb();
  const qRows = await db.queryAll<Record<string, unknown>>(
    `SELECT q.*, t.slug AS topic_slug, t.title AS topic_title, c.name AS class_name
     FROM questions q
     JOIN topics t ON t.id = q.topic_id
     LEFT JOIN classes c ON c.id = q.class_id
     WHERE q.class_id IS NULL OR q.created_by = ? OR c.teacher_id = ?
     ORDER BY t.sort_order ASC, q.id ASC`,
    [user.id, user.id]
  );
  const topicRows = await db.queryAll<Record<string, unknown>>(
    "SELECT * FROM topics ORDER BY sort_order ASC"
  );
  const classes = await db.queryAll<ClassRecord>(
    "SELECT * FROM classes WHERE teacher_id = ? ORDER BY id ASC",
    [user.id]
  );

  return (
    <TeacherQuestionsClient
      initialQuestions={qRows.map(hydrateQuestion)}
      topics={topicRows.map(hydrateTopic)}
      classes={classes}
    />
  );
}
