"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, BookOpen, GraduationCap, UserPlus } from "lucide-react";
import type { UserRole } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          username,
          displayName,
          password,
          joinCode: role === "student" ? joinCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "註冊失敗，請檢查輸入欄位。");
        return;
      }

      if (data.user?.role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("連線發生異常，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-lg border border-[#E2E0D8] bg-white p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#17191C]">註冊 APCS 識讀實驗室帳號</h1>
          <p className="mt-1 text-sm text-[#525866]">
            請先選擇您的使用身份，系統將依身份開啟對應學習紀錄與班級權限。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="身份選擇">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium ui-transition ${
                role === "student"
                  ? "border-[#1E4E8C] bg-[#EAF1FA] text-[#1E4E8C]"
                  : "border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
              }`}
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              <span>學生</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium ui-transition ${
                role === "teacher"
                  ? "border-[#0F6B5E] bg-[#E6F4F1] text-[#0F6B5E]"
                  : "border-[#E2E0D8] bg-[#F7F6F2] text-[#525866]"
              }`}
            >
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
              <span>教師</span>
            </button>
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-[#17191C]">
              登入帳號（3–32 碼英數字或底線）
            </label>
            <input
              id="reg-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如 hs_chen01"
              className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 font-code text-sm text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-display" className="block text-sm font-medium text-[#17191C]">
              顯示姓名
            </label>
            <input
              id="reg-display"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={role === "teacher" ? "例如 林志遠老師" : "例如 陳宇翔"}
              className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-sm text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-[#17191C]">
              設定密碼（至少 6 個字元）
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-sm text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
            />
          </div>

          {role === "student" && (
            <div>
              <label htmlFor="reg-joincode" className="block text-sm font-medium text-[#17191C]">
                班級加入代碼（選填，可稍後於儀表板加入）
              </label>
              <input
                id="reg-joincode"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="例如 APCS2A"
                className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 font-code text-sm uppercase text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-[#C23535]/30 bg-[#FCEEEE] px-3 py-2 text-xs text-[#C23535]">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white ui-transition disabled:opacity-50 ${
              role === "teacher"
                ? "bg-[#0F6B5E] hover:bg-[#0B5349]"
                : "bg-[#1E4E8C] hover:bg-[#163C6E]"
            }`}
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            <span>{loading ? "建立帳號中..." : "完成註冊並進入"}</span>
          </button>
        </form>

        <div className="mt-5 border-t border-[#E2E0D8] pt-4 text-center text-sm text-[#525866]">
          已經有帳號了？{" "}
          <Link href="/login" className="font-medium text-[#1E4E8C] hover:underline">
            前往登入
          </Link>
        </div>
      </div>
    </div>
  );
}
