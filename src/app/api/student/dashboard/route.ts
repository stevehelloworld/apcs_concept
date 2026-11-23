import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { buildStudentDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireRole("student");
  if (!auth.ok) return auth.response;

  const dashboard = await buildStudentDashboard(auth.user);
  return NextResponse.json(dashboard);
}
