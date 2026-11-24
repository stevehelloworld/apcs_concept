import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

export default function RegisterClosedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="synth-panel-hard overflow-hidden">
        <div className="h-2 w-full bg-[#161A22]" />
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#161A22] bg-[#FFF1EC] text-[#D93B09]">
              <LockKeyhole className="h-5 w-5" strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-xl font-black text-[#11151C]">
                帳號由教師統一建立
              </h1>
              <p className="text-xs font-bold text-[#4B5565]">
                不開放訪客自行註冊
              </p>
            </div>
          </div>

          <div className="synth-recess p-4 space-y-2 text-sm leading-relaxed text-[#11151C]">
            <p>
              為確保班級名冊管理與學習紀錄追蹤一致，本平台已關閉對外自行註冊功能。
            </p>
            <p className="text-xs text-[#4B5565]">
              請向您的任課老師領取專屬登入帳號與初始密碼，再前往登入頁啟用個人進度與班級作業。
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/login"
              className="synth-pad-orange flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
              <span>前往登入頁</span>
            </Link>
            <Link
              href="/topics"
              className="synth-pad flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              <span>先瀏覽公開五大模組</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
