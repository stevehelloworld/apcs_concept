"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Database,
  ExternalLink,
  Users,
} from "lucide-react";

const TEACHER_NAV = [
  { href: "/teacher", label: "班級數據總覽", icon: BarChart3, exact: true },
  { href: "/teacher/classes", label: "班級與學生名冊", icon: Users, exact: false },
  { href: "/teacher/questions", label: "題庫與迷思管理", icon: Database, exact: false },
  { href: "/teacher/topics", label: "五大主題講義 CMS", icon: BookOpenCheck, exact: false },
  { href: "/teacher/assignments", label: "作業指派與追蹤", icon: ClipboardList, exact: false },
];

export function TeacherSideNav({ teacherName }: { teacherName: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="sticky top-20 synth-panel-hard overflow-hidden">
        <div className="h-2 w-full bg-[#007A5B]" />
        <div className="p-4 space-y-4">
          <div className="border-b border-[#D4DAE4] pb-3">
            <div className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold text-[#007A5B]">
              <span className="h-2 w-2 rounded-full bg-[#00C48C]" />
              <span>MASTER CONSOLE</span>
            </div>
            <div className="mt-1 text-sm font-black text-[#11151C]">{teacherName}</div>
          </div>

          <nav className="space-y-1.5" aria-label="教師後台側邊導覽">
            {TEACHER_NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-bold ui-transition ${
                    active
                      ? "border-[#161A22] bg-[#007A5B] text-white shadow-xs"
                      : "border-[#C4CBD6] bg-white text-[#11151C] hover:border-[#161A22]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#D4DAE4] pt-3">
            <Link
              href="/topics"
              className="synth-pad flex items-center justify-between px-3 py-2 text-xs font-bold"
            >
              <span>切換預覽學生端</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#4B5565]" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
