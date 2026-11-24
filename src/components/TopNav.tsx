"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Compass,
  Gauge,
  GraduationCap,
  LogIn,
  LogOut,
  Map as MapIcon,
  Moon,
  Route,
  ShieldCheck,
  Sun,
  Terminal,
  Type,
  User,
} from "lucide-react";
import type { AuthUser } from "@/lib/types";
import { ClassroomQuickJump } from "./ClassroomQuickJump";

interface TopNavProps {
  initialUser: AuthUser | null;
}

export function TopNav({ initialUser }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "bright">("dark");
  const [scaleMode, setScaleMode] = useState<"standard" | "large">("standard");

  useEffect(() => {
    const d = document.documentElement;
    setThemeMode(d.dataset.theme === "bright" ? "bright" : "dark");
    setScaleMode(d.dataset.scale === "large" ? "large" : "standard");
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.shiftKey && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setQuickJumpOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleTheme() {
    const next = themeMode === "bright" ? "dark" : "bright";
    setThemeMode(next);
    if (next === "bright") {
      document.documentElement.dataset.theme = "bright";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem("apcs_projector_theme", next);
    } catch {
      // Ignore storage error
    }
  }

  function toggleScale() {
    const next = scaleMode === "large" ? "standard" : "large";
    setScaleMode(next);
    if (next === "large") {
      document.documentElement.dataset.scale = "large";
    } else {
      delete document.documentElement.dataset.scale;
    }
    try {
      localStorage.setItem("apcs_projector_scale", next);
    } catch {
      // Ignore storage error
    }
  }

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

  const isTeacherRoute = pathname.startsWith("/teacher");
  const activeUnderline = isTeacherRoute ? "bg-[#22B14C]" : "bg-[#E21D2D]";

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
      {/* Slim 52px Sticky TopBar for All Viewports */}
      <header className="sticky top-0 z-40 h-[52px] border-b border-white/20 bg-[#0B1230]/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1520px] items-center justify-between gap-2 px-3 sm:px-5">
          {/* Left: Brand + Desktop Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 text-white ui-transition hover:opacity-85 shrink-0"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="1"
                  width="26"
                  height="26"
                  rx="4"
                  stroke="currentColor"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                />
                <path
                  d="M5 20L14 14L23 8"
                  stroke="#E21D2D"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <path
                  d="M5 8L14 14L23 20"
                  stroke="#1E5BFF"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <circle
                  cx="14"
                  cy="14"
                  r="4"
                  fill="#0B1230"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </svg>
              <span className="font-display text-base sm:text-lg font-extrabold tracking-widest text-white">
                APCS RAIL
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="主導覽列">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-bold ui-transition ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-[#B8C5E0] hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className={`absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full ${activeUnderline}`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Classroom Projector Controls + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleScale}
              data-scale-toggle="true"
              aria-pressed={scaleMode === "large"}
              aria-label="切換投影大字模式"
              title="切換投影大字模式"
              className="rail-btn inline-flex items-center gap-1 px-2 py-1 font-code text-xs font-bold"
            >
              <Type className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="hidden sm:inline">大字</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={themeMode === "bright"}
              aria-label="切換深藍或明亮教室白底"
              title="切換深藍 / 明亮教室白底"
              className="rail-btn inline-flex items-center gap-1 px-2 py-1 font-code text-xs font-bold"
            >
              {themeMode === "bright" ? (
                <>
                  <Moon className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="hidden sm:inline">深藍</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#FFC20E]" strokeWidth={2} />
                  <span className="hidden sm:inline">亮底</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setQuickJumpOpen(true)}
              aria-label="開啟課堂速跳控台"
              title="課堂速跳 (Shift+G)"
              className="rail-btn inline-flex items-center gap-1.5 px-2.5 py-1 font-code text-xs font-bold"
            >
              <Compass className="h-3.5 w-3.5 text-[#14B8C4]" strokeWidth={2.2} />
              <span className="hidden sm:inline">速跳</span>
              <span className="hidden xl:inline text-[10px] text-[#7E91B8]">
                Shift+G
              </span>
            </button>

            {initialUser ? (
              <div className="flex items-center gap-1.5 pl-1">
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded border border-white/20 px-2 py-1 text-xs font-bold text-white max-w-[130px]">
                  {initialUser.role === "teacher" ? (
                    <GraduationCap
                      className="h-3.5 w-3.5 text-[#4ADE80] shrink-0"
                      strokeWidth={2}
                    />
                  ) : (
                    <User className="h-3.5 w-3.5 text-[#B8C5E0] shrink-0" strokeWidth={2} />
                  )}
                  <span className="truncate">{initialUser.display_name}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  aria-label="登出"
                  className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                  <span className="hidden sm:inline">登出</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rail-btn-primary inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
              >
                <LogIn className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>登入</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom 4-Tab Bar */}
      <nav
        aria-label="行動版導覽列"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/25 bg-[#070C22]/95 backdrop-blur-md grid grid-cols-4 px-2 py-1.5"
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

      <ClassroomQuickJump
        open={quickJumpOpen}
        onClose={() => setQuickJumpOpen(false)}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        scaleMode={scaleMode}
        onToggleScale={toggleScale}
      />
    </>
  );
}
