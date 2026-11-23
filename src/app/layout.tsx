import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_TC } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APCS 識讀實驗室 — Python 程式識讀互動教學與班級管理平台",
  description:
    "以 2025 APCS「程式識讀 Python 題本範例（0915）」為基準，提供五大主題互動視覺化教學、學生迷思診斷練習與教師班級管理後台。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="zh-Hant" className={`${notoSansTc.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#17191C]">
        <TopNav initialUser={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
