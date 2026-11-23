import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb, hydrateTopic } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const db = await getDb();
  const rows = await db.queryAll<Record<string, unknown>>(
    "SELECT * FROM topics ORDER BY sort_order ASC, id ASC"
  );

  return NextResponse.json({
    topics: rows.map((r) => hydrateTopic(r)),
  });
}
