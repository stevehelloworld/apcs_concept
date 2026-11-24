"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, KeyRound, LogIn } from "lucide-react";

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
    <div className="mx-auto max-w-sm px-4 py-14 space-y-4">
      <div className="rail-frame overflow-hidden">
        <div className="h-1 w-full bg-[#E21D2D]" />
        <div className="p-6 space-y-5">
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-white">
            <KeyRound className="h-5 w-5 text-[#E21D2D]" strokeWidth={2.2} />
            <span>師生登入</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-bold text-[#B8C5E0]"
              >
                帳號
              </label>
              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="stu_wang / teacher_lin"
                className="rail-input mt-1.5 w-full px-3 py-2 font-code text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-[#B8C5E0]"
              >
                密碼
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼"
                className="rail-input mt-1.5 w-full px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded border border-[#E21D2D]/50 bg-[#E21D2D]/15 px-3 py-2 text-xs font-medium text-[#FF7A85]">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rail-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" strokeWidth={2.2} />
              <span>{loading ? "驗證中..." : "登入"}</span>
            </button>
          </form>

          <div className="border-t border-white/15 pt-3 text-center text-xs text-[#7E91B8]">
            學生帳號由任課教師統一開通
          </div>
        </div>
      </div>

      {/* Collapsible test accounts */}
      <div className="rail-frame p-3.5">
        <button
          type="button"
          onClick={() => setShowDemoHelp((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-bold text-[#B8C5E0] hover:text-white"
        >
          <span>展示測試帳密</span>
          {showDemoHelp ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          )}
        </button>

        {showDemoHelp && (
          <div className="mt-3 space-y-2 border-t border-white/15 pt-3 font-code text-xs text-[#B8C5E0]">
            <div>
              <div className="font-sans font-bold text-[#4ADE80]">教師</div>
              <div>teacher_lin / teacher123（APCS2A）</div>
              <div>teacher_chen / teacher123（APCS99）</div>
            </div>
            <div>
              <div className="font-sans font-bold text-[#FF7A85]">學生</div>
              <div>stu_wang / student123（APCS2A）</div>
              <div>stu_wu / student123（APCS99）</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
