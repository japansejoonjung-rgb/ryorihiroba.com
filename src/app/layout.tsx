'use client';

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

// export const metadata: Metadata = {
//   title: "レシピ広場 | 毎日の料理をもっと楽しく",
//   description: "日本の家庭料理、時短料理、人気レシピを探せるレシピコミュニティ。",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#fffaf5] text-stone-800">
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
