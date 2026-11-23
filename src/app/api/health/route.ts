import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const topicRow = await db.queryOne<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM topics");
    const questionRow = await db.queryOne<{ cnt: number }>("SELECT COUNT(*) AS cnt FROM questions");
    return NextResponse.json({
      ok: true,
      storage: db.storageMode,
      topics: Number(topicRow?.cnt ?? 0),
      questions: Number(questionRow?.cnt ?? 0),
    });
  } catch (err) {
    console.error("health check error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Database error" },
      { status: 500 }
    );
  }
}
