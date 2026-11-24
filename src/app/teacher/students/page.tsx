import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  buildTeacherStudentProgress,
  listTeacherManagedStudents,
} from "@/lib/teacher-queries";
import { TeacherStudentsClient } from "@/components/teacher/TeacherStudentsClient";

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "teacher") return null;

  const sp = await searchParams;
  const listRes = await listTeacherManagedStudents(user.id, null);
  if (!listRes.ok) {
    return (
      <div className="rail-frame p-6 text-sm font-bold text-[#FF7A85]">
        {listRes.error}
      </div>
    );
  }

  const requestedId = sp.studentId ? Number(sp.studentId) : null;
  const initialSelectedId =
    requestedId && listRes.students.some((s) => s.id === requestedId)
      ? requestedId
      : listRes.students[0]?.id ?? null;

  const initialProgress = initialSelectedId
    ? await buildTeacherStudentProgress(user.id, initialSelectedId)
    : null;

  return (
    <TeacherStudentsClient
      classes={listRes.classes}
      initialStudents={listRes.students}
      initialSelectedId={initialSelectedId}
      initialProgress={initialProgress}
    />
  );
}
