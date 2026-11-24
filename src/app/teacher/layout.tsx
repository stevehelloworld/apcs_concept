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
        <div className="synth-panel-hard p-6 sm:p-7 text-center space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-[#C62828]" strokeWidth={2} />
          <h1 className="text-xl font-black text-[#11151C]">
            權限不足：僅限教師帳號進入
          </h1>
          <p className="text-sm text-[#4B5565]">
            目前登入帳號「{user.display_name}」為學生身份，無法存取教師班級與題庫控制台。
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link href="/dashboard" className="synth-pad-orange px-4 py-2 text-sm font-bold">
              返回學生學習進度
            </Link>
            <Link href="/topics" className="synth-pad px-4 py-2 text-sm font-bold">
              瀏覽五大模組
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
