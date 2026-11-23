import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb, hydrateTopic } from "@/lib/db";
import type { CoreConcept, PitfallItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("teacher");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const topicId = Number(id);
  const db = await getDb();

  const row = await db.queryOne<Record<string, unknown>>(
    "SELECT * FROM topics WHERE id = ?",
    [topicId]
  );
  if (!row) {
    return NextResponse.json({ error: "找不到該主題。" }, { status: 404 });
  }

  const existing = hydrateTopic(row);

  try {
    const body = (await req.json()) as {
      title?: string;
      subtitle?: string;
      summary?: string;
      exam_weight?: string;
      study_minutes?: number;
      core_concepts?: CoreConcept[];
      pitfalls?: PitfallItem[];
      is_published?: boolean;
    };

    await db.run(
      `UPDATE topics SET
         title = ?,
         subtitle = ?,
         summary = ?,
         exam_weight = ?,
         study_minutes = ?,
         core_concepts_json = ?,
         pitfalls_json = ?,
         is_published = ?,
         updated_at = datetime('now')
       WHERE id = ?`,
      [
        body.title !== undefined ? body.title.trim() : existing.title,
        body.subtitle !== undefined ? body.subtitle.trim() : existing.subtitle,
        body.summary !== undefined ? body.summary.trim() : existing.summary,
        body.exam_weight !== undefined ? body.exam_weight.trim() : existing.exam_weight,
        body.study_minutes !== undefined ? Number(body.study_minutes) : existing.study_minutes,
        JSON.stringify(body.core_concepts ?? existing.core_concepts),
        JSON.stringify(body.pitfalls ?? existing.pitfalls),
        body.is_published !== undefined ? (body.is_published ? 1 : 0) : existing.is_published ? 1 : 0,
        topicId,
      ]
    );

    const updated = await db.queryOne<Record<string, unknown>>(
      "SELECT * FROM topics WHERE id = ?",
      [topicId]
    );
    return NextResponse.json({ topic: hydrateTopic(updated!) });
  } catch (err) {
    console.error("update topic error", err);
    return NextResponse.json({ error: "更新主題內容失敗。" }, { status: 500 });
  }
}
