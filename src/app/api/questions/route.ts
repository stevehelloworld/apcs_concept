import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryVisibleQuestions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);

  const assignmentParam = searchParams.get("assignmentId");
  const limitParam = searchParams.get("limit");

  const questions = await queryVisibleQuestions(user, {
    topicSlug: searchParams.get("topic") ?? undefined,
    questionType: searchParams.get("type") ?? undefined,
    difficulty: searchParams.get("difficulty") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    assignmentId: assignmentParam ? Number(assignmentParam) : undefined,
    status: searchParams.get("status") ?? undefined,
    limit: limitParam ? Number(limitParam) : undefined,
  });

  return NextResponse.json({ questions });
}
