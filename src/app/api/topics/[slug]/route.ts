import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTopicBySlugForUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const user = await getCurrentUser();
  const result = await getTopicBySlugForUser(slug, user);

  if (!result) {
    return NextResponse.json({ error: "找不到指定的主題單元。" }, { status: 404 });
  }

  return NextResponse.json(result);
}
