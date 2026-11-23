"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Code2,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  Terminal,
  UserPlus,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/types";

interface TopNavProps {
  initialUser: AuthUser | null;
}

export function TopNav({ initialUser }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const accentText = isTeacherRoute ? "text-[#0F6B5E]" : "text-[#1E4E8C]";
  const activeBg = isTeacherRoute
    ? "bg-[#E6F4F1] text-[#0F6B5E]"
    : "bg-[#EAF1FA] text-[#1E4E8C]";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setMobileOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const navItems = [
    { href: "/topics", label: "全主題導覽", icon: BookOpen, matchPrefix: "/topics" },
    { href: "/practice", label: "刷題工作台", icon: Terminal, matchPrefix: "/practice" },
  ];

  if (initialUser?.role === "student") {
    navItems.push({
      href: "/dashboard",
      label: "學習儀表板",
      icon: LayoutDashboard,
      matchPrefix: "/dashboard",
    });
  }

  if (initialUser?.role === "teacher") {
    navItems.push({
      href: "/teacher",
      label: "教師管理後台",
      icon: ShieldCheck,
      matchPrefix: "/teacher",
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E0D8] bg-[#FFFFFF]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-[#17191C] ui-transition hover:opacity-85"
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-md border border-[#E2E0D8] ${
                isTeacherRoute
                  ? "bg-[#0F6B5E] text-white"
                  : "bg-[#1E4E8C] text-white"
              }`}
            >
              <Code2 className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="text-[15px]">APCS 識讀實驗室</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="主導覽列">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.matchPrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ui-transition ${
                    isActive
                      ? activeBg
                      : "text-[#525866] hover:bg-[#F0EFEA] hover:text-[#17191C]"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {initialUser ? (
            <>
              <div className="flex items-center gap-2 rounded-md border border-[#E2E0D8] bg-[#F7F6F2] px-2.5 py-1 text-xs">
                {initialUser.role === "teacher" ? (
                  <GraduationCap
                    className="h-3.5 w-3.5 text-[#0F6B5E]"
                    strokeWidth={1.75}
                  />
                ) : (
                  <BookOpen
                    className="h-3.5 w-3.5 text-[#1E4E8C]"
                    strokeWidth={1.75}
                  />
                )}
                <span className={`font-medium ${accentText}`}>
                  {initialUser.role === "teacher" ? "教師" : "學生"}
                </span>
                <span className="text-[#E2E0D8]">|</span>
                <span className="font-medium text-[#17191C]">
                  {initialUser.display_name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1.5 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-sm font-medium text-[#525866] ui-transition hover:border-[#C9C6BB] hover:bg-[#F0EFEA] hover:text-[#17191C] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                <span>{loggingOut ? "登出中..." : "登出"}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-md border border-[#E2E0D8] bg-white px-3 py-1.5 text-sm font-medium text-[#17191C] ui-transition hover:border-[#C9C6BB] hover:bg-[#F0EFEA]"
              >
                <LogIn className="h-4 w-4" strokeWidth={1.75} />
                <span>登入</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-md bg-[#1E4E8C] px-3 py-1.5 text-sm font-medium text-white ui-transition hover:bg-[#163C6E]"
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                <span>註冊帳號</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "關閉導覽選單" : "開啟導覽選單"}
          className="inline-flex md:hidden items-center justify-center rounded-md border border-[#E2E0D8] p-1.5 text-[#525866] hover:bg-[#F0EFEA] hover:text-[#17191C]"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={1.75} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E2E0D8] bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.matchPrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? activeBg : "text-[#525866] hover:bg-[#F0EFEA]"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-3 border-t border-[#E2E0D8] pt-3">
            {initialUser ? (
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span className={`font-medium ${accentText}`}>
                    {initialUser.role === "teacher" ? "教師" : "學生"}
                  </span>{" "}
                  <span className="font-medium text-[#17191C]">
                    {initialUser.display_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-1.5 rounded-md border border-[#E2E0D8] px-3 py-1.5 text-sm font-medium text-[#525866]"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-md border border-[#E2E0D8] py-2 text-sm font-medium text-[#17191C]"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.75} />
                  <span>登入</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-md bg-[#1E4E8C] py-2 text-sm font-medium text-white"
                >
                  <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                  <span>註冊帳號</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
