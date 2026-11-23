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
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-lg border border-[#C23535]/30 bg-white p-6 text-center space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-[#C23535]" strokeWidth={1.75} />
          <h1 className="text-xl font-bold text-[#17191C]">權限不足：僅限教師帳號</h1>
          <p className="text-sm text-[#525866]">
            目前登入帳號「{user.display_name}」為學生身份，無法存取教師班級與題庫管理後台。
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-[#1E4E8C] px-4 py-2 text-sm font-medium text-white hover:bg-[#163C6E]"
            >
              返回學生儀表板
            </Link>
            <Link
              href="/topics"
              className="rounded-md border border-[#E2E0D8] bg-white px-4 py-2 text-sm font-medium text-[#17191C] hover:bg-[#F0EFEA]"
            >
              瀏覽主題教學
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <TeacherSideNav teacherName={user.display_name} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
