"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Gauge,
  GraduationCap,
  LogIn,
  LogOut,
  Map as MapIcon,
  Route,
  ShieldCheck,
  Terminal,
  User,
} from "lucide-react";
import type { AuthUser } from "@/lib/types";

interface TopNavProps {
  initialUser: AuthUser | null;
}

export function TopNav({ initialUser }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isTeacherRoute = pathname.startsWith("/teacher");
  const activeUnderline = isTeacherRoute ? "bg-[#22B14C]" : "bg-[#E21D2D]";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const navItems = [
    { href: "/", label: "路網", icon: MapIcon, exact: true },
    { href: "/topics", label: "路線", icon: Route, exact: false },
    { href: "/practice", label: "刷題", icon: Terminal, exact: false },
  ];

  if (initialUser?.role === "student") {
    navItems.push({
      href: "/dashboard",
      label: "進度",
      icon: Gauge,
      exact: false,
    });
  } else if (initialUser?.role === "teacher") {
    navItems.push({
      href: "/teacher",
      label: "控台",
      icon: ShieldCheck,
      exact: false,
    });
  }

  const mobileTabs =
    initialUser !== null
      ? navItems
      : [
          ...navItems,
          { href: "/login", label: "登入", icon: LogIn, exact: false },
        ];

  return (
    <>
      {/* Desktop: Fixed Left Porcelain-Framed Vertical Rail */}
      <aside className="hidden lg:flex lg:w-[216px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen p-3.5">
        <div className="rail-frame w-full h-full flex flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Brand Emblem + Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2.5 text-white ui-transition hover:opacity-85"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <rect
                  x="1"
                  y="1"
                  width="26"
                  height="26"
                  rx="4"
                  stroke="#FFFFFF"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />
                <path d="M5 20L14 14L23 8" stroke="#E21D2D" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M5 8L14 14L23 20" stroke="#1E5BFF" strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="14" cy="14" r="4" fill="#0B1230" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-extrabold tracking-widest text-white">
                  APCS RAIL
                </span>
                <span className="mt-0.5 font-code text-[10px] text-[#7E91B8] tabular-nums">
                  0915 識讀路網
                </span>
              </span>
            </Link>

            {/* Primary Nav Rail */}
            <nav className="space-y-1" aria-label="主導覽列">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex flex-col px-2.5 py-2 rounded-[5px] ui-transition ${
                      isActive
                        ? "text-white bg-white/[0.06]"
                        : "text-[#B8C5E0] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className={`mt-1.5 h-[2px] w-7 ui-transition ${
                        isActive ? activeUnderline : "bg-transparent group-hover:bg-white/25"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom User & System Status */}
          <div className="border-t border-white/15 pt-4 space-y-3">
            {initialUser ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      initialUser.role === "teacher" ? "bg-[#22B14C]" : "bg-[#E21D2D]"
                    }`}
                  />
                  {initialUser.role === "teacher" ? (
                    <GraduationCap className="h-3.5 w-3.5 text-[#4ADE80] shrink-0" strokeWidth={2} />
                  ) : (
                    <User className="h-3.5 w-3.5 text-[#B8C5E0] shrink-0" strokeWidth={2} />
                  )}
                  <span className="truncate font-bold text-white">
                    {initialUser.display_name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rail-btn flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-bold disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{loggingOut ? "登出中..." : "登出"}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rail-btn-primary flex w-full items-center justify-center gap-1.5 py-2 text-xs font-bold"
              >
                <LogIn className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>師生登入</span>
              </Link>
            )}

            <div className="font-code text-[10px] text-[#7E91B8] tabular-nums tracking-wider">
              5 LINES · 50 STATIONS
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-white/20 bg-[#0B1230]/95 backdrop-blur-md">
        <div className="flex h-13 items-center justify-between gap-2 px-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M4 21L14 14L24 7" stroke="#E21D2D" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M4 7L14 14L24 21" stroke="#1E5BFF" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="14" cy="14" r="4" fill="#0B1230" stroke="#FFFFFF" strokeWidth="2.2" />
            </svg>
            <span className="font-display text-base font-extrabold tracking-widest">
              APCS RAIL
            </span>
          </Link>

          {initialUser ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[130px] truncate text-xs font-bold text-[#B8C5E0]">
                {initialUser.display_name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="登出"
                className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                <span>登出</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rail-btn-primary inline-flex items-center gap-1 px-3 py-1 text-xs font-bold"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span>登入</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Fixed Bottom 4-Tab Bar */}
      <nav
        aria-label="行動版導覽列"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/25 bg-[#070C22]/95 backdrop-blur-md grid grid-cols-4 px-2 py-1.5"
      >
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-bold ${
                isActive ? "text-white" : "text-[#7E91B8]"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              <span>{item.label}</span>
              <span
                className={`mt-0.5 h-[2px] w-6 ${
                  isActive ? activeUnderline : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
