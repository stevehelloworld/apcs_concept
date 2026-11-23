import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listPublishedTopics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const topics = await listPublishedTopics(user);
  return NextResponse.json({ topics });
}
