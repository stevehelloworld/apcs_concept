"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Database,
  ExternalLink,
  UserCog,
  Users,
} from "lucide-react";

const TEACHER_NAV = [
  { href: "/teacher", label: "總覽", icon: BarChart3, exact: true },
  { href: "/teacher/classes", label: "班級", icon: Users, exact: false },
  { href: "/teacher/students", label: "學生", icon: UserCog, exact: false },
  { href: "/teacher/questions", label: "題庫", icon: Database, exact: false },
  { href: "/teacher/topics", label: "講義", icon: BookOpenCheck, exact: false },
  { href: "/teacher/assignments", label: "作業", icon: ClipboardList, exact: false },
];

export function TeacherSideNav({ teacherName }: { teacherName: string }) {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-white/20 flex flex-wrap items-center justify-between gap-3">
      <nav
        className="flex items-center gap-1 overflow-x-auto"
        aria-label="教師控制台分頁"
      >
        {TEACHER_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-bold ui-transition ${
                active ? "text-white" : "text-[#B8C5E0] hover:text-white"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${active ? "text-[#4ADE80]" : ""}`}
                strokeWidth={2}
              />
              <span>{item.label}</span>
              <span
                className={`absolute inset-x-2 bottom-0 h-[2px] ${
                  active ? "bg-[#22B14C]" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 pb-2 sm:pb-0 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#B8C5E0]">
          <span className="h-2 w-2 rounded-full bg-[#22B14C]" />
          <span>{teacherName}</span>
        </span>
        <Link
          href="/topics"
          className="rail-btn inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold"
        >
          <span>學生端</span>
          <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
