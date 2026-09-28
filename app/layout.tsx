import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OF TABLE — 오래 곁에 두고 싶은 것들",
  description: "빈티지 감성과 현대적인 정돈감을 담은 테이블웨어 편집숍",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
