import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Noto_Sans_TC } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

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
    <html
      lang="zh-Hant"
      className={`${notoSansTc.variable} ${jetbrainsMono.variable} ${chakraPetch.variable}`}
    >
      <body className="min-h-screen flex flex-col synth-chassis text-[#11151C]">
        <TopNav initialUser={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
