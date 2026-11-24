import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "APCS RAIL — Python 程式識讀路網",
  description:
    "2025 APCS Python 0915 30 題互動路網、單步執行追蹤與教師班級後台。",
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
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
        />
      </head>
      <body className="min-h-screen rail-ground text-white antialiased">
        <div className="min-h-screen lg:flex">
          <TopNav initialUser={user} />
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
