"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Shield, Bell, Info, ChevronRight } from "lucide-react";

export function SettingsMenu() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-primary-500" />}
            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDark ? "bg-primary-500" : "bg-gray-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </button>

        {[
          { icon: Shield, label: "Risk Management", desc: "Configure position sizing" },
          { icon: Bell, label: "Notifications", desc: "Signal alerts" },
          { icon: Info, label: "About", desc: "Version 1.0.0" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">G-Chat Bitget Signal</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Your intelligent market command center.</p>
      </div>
    </div>
  );
}