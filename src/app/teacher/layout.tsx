import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { TeacherSideNav } from "@/components/teacher/TeacherSideNav";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "teacher") {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rail-frame p-6 text-center space-y-4">
          <ShieldAlert className="mx-auto h-9 w-9 text-[#FF7A85]" strokeWidth={2} />
          <h1 className="text-lg font-black text-white">僅限教師帳號進入</h1>
          <p className="text-xs text-[#B8C5E0]">
            目前身份：{user.display_name}（學生）
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/dashboard" className="rail-btn-primary px-4 py-2 text-xs font-bold">
              我的進度
            </Link>
            <Link href="/topics" className="rail-btn px-4 py-2 text-xs font-bold">
              公開路線
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:py-8">
      <TeacherSideNav teacherName={user.display_name} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
