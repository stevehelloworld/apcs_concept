import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { buildTeacherAnalytics } from "@/lib/teacher-queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const classIdParam = searchParams.get("classId");
  const requestedClassId =
    classIdParam && classIdParam !== "all" ? Number(classIdParam) : null;

  if (classIdParam && classIdParam !== "all" && Number.isNaN(requestedClassId)) {
    return NextResponse.json({ error: "無效的班級參數。" }, { status: 400 });
  }

  const res = await buildTeacherAnalytics(auth.user.id, requestedClassId);
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }
  return NextResponse.json(res.data);
}
