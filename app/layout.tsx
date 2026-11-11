import type { Metadata } from "next";
import { Gowun_Dodum, Jua } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

// 제목·버튼용 동글동글한 글씨체
const jua = Jua({
  variable: "--font-jua",
  weight: "400",
  subsets: ["latin"],
});

// 본문용 부드러운 글씨체
const gowun = Gowun_Dodum({
  variable: "--font-gowun",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "고구마마켓 🍠 우리 동네 따끈한 중고거래",
  description: "이웃과 따뜻하게 나누는 동네 중고거래, 고구마마켓",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowun.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="py-8 text-center text-sm text-muted">
          © 고구마마켓 · 이웃과 따뜻하게 🍠
        </footer>
      </body>
    </html>
  );
}
