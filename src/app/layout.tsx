import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "APCS RAIL — Python 程式識讀路網",
  description:
    "APCS Python 程式識讀 50 題（官方 0915 ＋ 原創模擬）互動路網、觀念實驗卡、單步追蹤與教師班級後台。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("apcs_projector_theme");if(t==="bright")d.dataset.theme="bright";var s=localStorage.getItem("apcs_projector_scale");if(s==="large")d.dataset.scale="large";}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen rail-ground text-white antialiased">
        <div className="min-h-screen flex flex-col">
          <TopNav initialUser={user} />
          <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
