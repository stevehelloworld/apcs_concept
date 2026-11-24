import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "系統已關閉自行註冊功能，請由任課教師透過管理後台建立學生帳號。" },
    { status: 403 }
  );
}
