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
  { href: "/teacher", label: "數據總覽", icon: BarChart3, exact: true },
  { href: "/teacher/classes", label: "班級與學生管理", icon: Users, exact: false },
  { href: "/teacher/questions", label: "題庫 CRUD 管理", icon: Database, exact: false },
  { href: "/teacher/topics", label: "主題內容 CMS", icon: BookOpenCheck, exact: false },
  { href: "/teacher/assignments", label: "班級作業指派", icon: ClipboardList, exact: false },
];

export function TeacherSideNav({ teacherName }: { teacherName: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="sticky top-20 rounded-lg border border-[#E2E0D8] bg-[#F0EFEA] p-4 space-y-4">
        <div className="border-b border-[#E2E0D8] pb-3">
          <div className="text-xs font-semibold text-[#0F6B5E]">教師管理後台</div>
          <div className="mt-0.5 text-sm font-bold text-[#17191C]">{teacherName}</div>
        </div>

        <nav className="space-y-1" aria-label="教師後台側邊導覽">
          {TEACHER_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium ui-transition ${
                  active
                    ? "bg-[#0F6B5E] text-white"
                    : "text-[#17191C] hover:bg-white hover:text-[#0F6B5E]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E2E0D8] pt-3 space-y-1.5">
          <Link
            href="/topics"
            className="flex items-center justify-between rounded-md border border-[#E2E0D8] bg-white px-3 py-2 text-xs font-medium text-[#17191C] hover:border-[#0F6B5E]"
          >
            <span>預覽學生端教學頁</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#525866]" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
