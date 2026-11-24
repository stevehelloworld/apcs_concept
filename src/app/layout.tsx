import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "OP-APCS 識讀實驗室 — Python 程式追蹤合成台與班級後台",
  description:
    "以 2025 APCS「程式識讀 Python 題本範例（0915）」為基準，結合模組化互動視覺實驗室、即時單步追蹤器與班級管理後台。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col synth-chassis text-[#11151C]">
        <TopNav initialUser={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
