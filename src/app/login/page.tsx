"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登入失敗，請檢查帳號密碼。");
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
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-[#E2E0D8] bg-white p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#17191C]">登入 APCS 識讀實驗室</h1>
          <p className="mt-1 text-sm text-[#525866]">
            請輸入您的教師或學生帳號密碼，系統將自動導向對應工作台。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-[#17191C]">
              帳號名稱
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如 stu_wang 或 teacher_lin"
              className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-sm text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-[#17191C]">
              密碼
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              className="mt-1.5 w-full rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-sm text-[#17191C] focus:border-[#1E4E8C] focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-[#C23535]/30 bg-[#FCEEEE] px-3 py-2 text-xs text-[#C23535]">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E4E8C] px-4 py-2.5 text-sm font-medium text-white ui-transition hover:bg-[#163C6E] disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.75} />
            <span>{loading ? "驗證中..." : "登入系統"}</span>
          </button>
        </form>

        <div className="mt-5 border-t border-[#E2E0D8] pt-4 text-center text-sm text-[#525866]">
          還沒有帳號嗎？{" "}
          <Link href="/register" className="font-medium text-[#1E4E8C] hover:underline">
            立即註冊學生／教師帳號
          </Link>
        </div>
      </div>

      {/* Collapsible local test accounts reference */}
      <div className="mt-4 rounded-lg border border-[#E2E0D8] bg-[#F0EFEA] p-4">
        <button
          type="button"
          onClick={() => setShowDemoHelp((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold text-[#525866]"
        >
          <span>檢視本機測試用預設師生帳號參考（需手動輸入密碼登入）</span>
          {showDemoHelp ? (
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {showDemoHelp && (
          <div className="mt-3 space-y-2 border-t border-[#E2E0D8] pt-3 font-code text-xs text-[#17191C]">
            <div>
              <div className="font-sans font-semibold text-[#0F6B5E]">教師帳號（管理所屬班級）</div>
              <div>teacher_lin / teacher123（高二資訊甲班 APCS2A）</div>
              <div>teacher_chen / teacher123（APCS 衝刺班 APCS99）</div>
            </div>
            <div className="pt-1">
              <div className="font-sans font-semibold text-[#1E4E8C]">學生帳號</div>
              <div>stu_wang / student123（已加入 APCS2A）</div>
              <div>stu_wu / student123（已加入 APCS99）</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
