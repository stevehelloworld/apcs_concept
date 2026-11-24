"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Code2,
  Compass,
  Gauge,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  Terminal,
  User,
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
  const ledColor = isTeacherRoute ? "bg-[#00C48C]" : "bg-[#FF4F17]";

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
    { href: "/topics", label: "探索模組", icon: Compass, matchPrefix: "/topics" },
    { href: "/practice", label: "刷題實驗台", icon: Terminal, matchPrefix: "/practice" },
  ];

  if (initialUser?.role === "student") {
    navItems.push({
      href: "/dashboard",
      label: "我的進度",
      icon: Gauge,
      matchPrefix: "/dashboard",
    });
  }

  if (initialUser?.role === "teacher") {
    navItems.push({
      href: "/teacher",
      label: "教師控制台",
      icon: ShieldCheck,
      matchPrefix: "/teacher",
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#161A22] bg-[#F8F9FB]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4 lg:gap-6 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 text-[#11151C] ui-transition hover:opacity-85"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-[#161A22] bg-[#161A22] text-white shadow-xs">
              <Code2 className="h-4.5 w-4.5" strokeWidth={2} />
              <span
                className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#F8F9FB] ${ledColor}`}
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-wider text-[#11151C]">
                OP-APCS
              </span>
              <span className="mt-0.5 text-[11px] font-bold text-[#4B5565]">
                程式識讀實驗室
              </span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1 rounded-xl border border-[#C4CBD6] bg-[#DDE2EA] p-1"
            aria-label="主導覽列"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.matchPrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ui-transition ${
                    isActive
                      ? "bg-[#161A22] text-white shadow-xs"
                      : "text-[#4B5565] hover:bg-white/75 hover:text-[#11151C]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? isTeacherRoute
                          ? "bg-[#00C48C]"
                          : "bg-[#FF4F17]"
                        : "bg-[#9AA3B2]"
                    }`}
                  />
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {initialUser ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-[#C4CBD6] bg-white px-3 py-1.5 text-xs">
                {initialUser.role === "teacher" ? (
                  <GraduationCap
                    className="h-3.5 w-3.5 text-[#007A5B]"
                    strokeWidth={2}
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-[#D93B09]" strokeWidth={2} />
                )}
                <span
                  className={`font-display text-[11px] font-bold uppercase ${
                    initialUser.role === "teacher"
                      ? "text-[#007A5B]"
                      : "text-[#D93B09]"
                  }`}
                >
                  {initialUser.role === "teacher" ? "TEACHER" : "STUDENT"}
                </span>
                <span className="h-3 w-px bg-[#C4CBD6]" />
                <span className="max-w-[140px] truncate font-bold text-[#11151C]">
                  {initialUser.display_name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="synth-pad inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{loggingOut ? "登出中..." : "登出"}</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="synth-pad-orange inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>師生登入</span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "關閉導覽選單" : "開啟導覽選單"}
          className="synth-pad inline-flex md:hidden items-center justify-center p-2"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t-2 border-[#161A22] bg-[#F8F9FB] px-4 py-4 md:hidden space-y-3">
          <div className="grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.matchPrefix);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold ${
                    isActive
                      ? "border-[#161A22] bg-[#161A22] text-white"
                      : "border-[#C4CBD6] bg-white text-[#11151C]"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#C4CBD6] pt-3">
            {initialUser ? (
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span
                    className={`font-display text-xs font-bold mr-1.5 ${
                      initialUser.role === "teacher"
                        ? "text-[#007A5B]"
                        : "text-[#D93B09]"
                    }`}
                  >
                    {initialUser.role === "teacher" ? "教師" : "學生"}
                  </span>
                  <span className="font-bold text-[#11151C]">
                    {initialUser.display_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="synth-pad inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="synth-pad-orange flex w-full items-center justify-center gap-1.5 py-2.5 text-sm font-bold"
              >
                <LogIn className="h-4 w-4" strokeWidth={2.2} />
                <span>師生登入</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
