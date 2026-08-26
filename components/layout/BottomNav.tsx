"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, BarChart3, Zap, History, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Markets", href: "/markets", icon: BarChart3 },
  { name: "Signal", href: "/", icon: Zap, isCenter: true },
  { name: "Trades", href: "/trades", icon: History },
  { name: "More", href: "/more", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2",
                  isActive 
                    ? "bg-primary-500 border-primary-500 text-white scale-110" 
                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center p-2 rounded-lg active:bg-gray-100 dark:active:bg-gray-700 active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400")} />
              <span className={cn("text-[10px] mt-1 font-medium", isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}