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
      <div className="synth-panel-hard overflow-hidden">
        <div
          className="h-2 w-full ui-transition"
          style={{ backgroundColor: role === "teacher" ? "#007A5B" : "#FF4F17" }}
        />
        <div className="p-6 sm:p-7 space-y-5">
          <div>
            <h1 className="text-2xl font-black text-[#11151C]">註冊 OP-APCS 帳號</h1>
            <p className="mt-1.5 text-sm text-[#4B5565]">
              選擇身份後填入資料，立即啟用個人進度或教師管理後台。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tactile Role Switcher */}
            <div
              className="synth-recess grid grid-cols-2 gap-1.5 p-1.5"
              role="radiogroup"
              aria-label="身份選擇"
            >
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold ui-transition ${
                  role === "student"
                    ? "bg-[#161A22] text-white shadow-xs"
                    : "text-[#4B5565] hover:text-[#11151C]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    role === "student" ? "bg-[#FF4F17]" : "bg-[#9AA3B2]"
                  }`}
                />
                <BookOpen className="h-4 w-4" strokeWidth={2} />
                <span>學生</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold ui-transition ${
                  role === "teacher"
                    ? "bg-[#161A22] text-white shadow-xs"
                    : "text-[#4B5565] hover:text-[#11151C]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    role === "teacher" ? "bg-[#00C48C]" : "bg-[#9AA3B2]"
                  }`}
                />
                <GraduationCap className="h-4 w-4" strokeWidth={2} />
                <span>教師</span>
              </button>
            </div>

            <div>
              <label
                htmlFor="reg-username"
                className="block text-xs font-bold text-[#11151C]"
              >
                登入帳號（3–32 碼英數字或底線）
              </label>
              <input
                id="reg-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如 hs_chen01"
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 font-code text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-display"
                className="block text-xs font-bold text-[#11151C]"
              >
                顯示姓名
              </label>
              <input
                id="reg-display"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={role === "teacher" ? "例如 林志遠老師" : "例如 陳宇翔"}
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-bold text-[#11151C]"
              >
                設定密碼（至少 6 個字元）
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 text-sm text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
              />
            </div>

            {role === "student" && (
              <div>
                <label
                  htmlFor="reg-joincode"
                  className="block text-xs font-bold text-[#11151C]"
                >
                  班級加入代碼（選填，之後也能在儀表板補加）
                </label>
                <input
                  id="reg-joincode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="例如 APCS2A"
                  className="mt-1.5 w-full rounded-xl border-[1.5px] border-[#C4CBD6] bg-[#F8F9FB] px-3.5 py-2.5 font-code text-sm uppercase text-[#11151C] focus:border-[#161A22] focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-[#F9B4B4] bg-[#FDECEC] px-3.5 py-2.5 text-xs font-medium text-[#C62828]">
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold disabled:opacity-50 ${
                role === "teacher" ? "synth-pad-emerald" : "synth-pad-orange"
              }`}
            >
              <UserPlus className="h-4 w-4" strokeWidth={2.2} />
              <span>{loading ? "建立帳號中..." : "完成註冊並進入"}</span>
            </button>
          </form>

          <div className="border-t border-[#D4DAE4] pt-4 text-center text-sm text-[#4B5565]">
            已經有帳號了？{" "}
            <Link href="/login" className="font-bold text-[#D93B09] hover:underline">
              前往登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
