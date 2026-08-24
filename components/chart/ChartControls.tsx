"use client";

import { cn } from "@/lib/utils";

interface ChartControlsProps {
  activeInterval: string;
  onIntervalChange: (interval: string) => void;
}

const intervals = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
];

export function ChartControls({ activeInterval, onIntervalChange }: ChartControlsProps) {
  return (
    <div className="flex gap-1 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
      {intervals.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onIntervalChange(tf.value)}
          className={cn(
            "flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors",
            activeInterval === tf.value
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700"
          )}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}