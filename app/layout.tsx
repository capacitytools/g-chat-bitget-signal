import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { TradingProvider } from "@/context/TradingContext";
import { LivePriceProvider } from "@/context/LivePriceContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G-Chat Bitget Signal",
  description: "Your intelligent Bitget market command center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`} suppressHydrationWarning>
        <TradingProvider>
          <LivePriceProvider>
            <Header />
            <main className="flex-1 pb-20 overflow-y-auto no-scrollbar">
              {children}
            </main>
            <BottomNav />
          </LivePriceProvider>
        </TradingProvider>
      </body>
    </html>
  );
}