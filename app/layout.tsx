import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LINE 貼圖工作台",
  description: "建立 LINE 貼圖套組"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
