"use client";

import Link from "next/link";
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
    <div className="mx-auto max-w-md px-4 py-12 space-y-4">
      <div className="synth-panel-hard overflow-hidden">
        <div className="h-2 w-full bg-[#FF4F17]" />
        <div className="p-6 sm:p-7 space-y-5">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-[#11151C]">
              <KeyRound className="h-5 w-5 text-[#D93B09]" strokeWidth={2.2} />
              <span>登入 OP-APCS 實驗室</span>
            </h1>
            <p className="mt-1.5 text-sm text-[#4B5565]">
              輸入學生或教師帳號密碼，系統會自動切換至對應的工作台。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-bold text-[#11151C]"
              >
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
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 font-code text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-[#11151C]"
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
                placeholder="請輸入密碼"
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-[#F9B4B4] bg-[#FDECEC] px-3.5 py-2.5 text-xs font-medium text-[#C62828]">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="synth-pad-orange flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" strokeWidth={2.2} />
              <span>{loading ? "驗證中..." : "登入系統"}</span>
            </button>
          </form>

          <div className="border-t border-[#D4DAE4] pt-4 text-center text-xs font-medium text-[#4B5565]">
            尚未擁有帳號？請聯繫任課教師由管理後台開通學生帳密。
          </div>
        </div>
      </div>

      {/* Collapsible test accounts reference */}
      <div className="synth-panel p-4">
        <button
          type="button"
          onClick={() => setShowDemoHelp((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-bold text-[#4B5565] hover:text-[#11151C]"
        >
          <span>展示／測試用預設師生帳號一覽（需手動輸入密碼登入）</span>
          {showDemoHelp ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          )}
        </button>

        {showDemoHelp && (
          <div className="mt-3 space-y-2.5 border-t border-[#C4CBD6] pt-3 font-code text-xs text-[#11151C]">
            <div>
              <div className="font-sans font-bold text-[#007A5B]">
                教師帳號（管理所屬班級）
              </div>
              <div>teacher_lin / teacher123（高二資訊甲班 APCS2A）</div>
              <div>teacher_chen / teacher123（APCS 衝刺班 APCS99）</div>
            </div>
            <div>
              <div className="font-sans font-bold text-[#D93B09]">學生帳號</div>
              <div>stu_wang / student123（已加入 APCS2A）</div>
              <div>stu_wu / student123（已加入 APCS99）</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
