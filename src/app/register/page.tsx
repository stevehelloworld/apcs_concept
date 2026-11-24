import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

export default function RegisterClosedPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-14">
      <div className="rail-frame overflow-hidden">
        <div className="h-1 w-full bg-[#E21D2D]" />
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-white/25 bg-[#070C22] text-[#FF7A85]">
              <LockKeyhole className="h-4 w-4" strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-lg font-black text-white">帳號由教師統一建立</h1>
              <p className="text-xs text-[#7E91B8]">不開放訪客自行註冊</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="rail-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={2.2} />
              <span>前往登入頁</span>
            </Link>
            <Link
              href="/topics"
              className="rail-btn flex w-full items-center justify-center gap-2 py-2.5 text-sm font-bold"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              <span>先逛公開路線</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
