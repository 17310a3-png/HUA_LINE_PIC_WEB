import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "800"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap"
});

export const metadata: Metadata = {
  title: "貼圖工作室 · LINE 貼圖自動生成",
  description: "從草稿到上架，一站式 AI 貼圖工作室"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${jakarta.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        <div className="pointer-events-none fixed inset-0 z-[100] grain-overlay" />
        {children}
      </body>
    </html>
  );
}
