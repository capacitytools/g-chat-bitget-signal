import { BarChart3 } from "lucide-react";

export function ChartPlaceholder() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="flex gap-2">
          {["1m", "5m", "15m", "1h"].map((tf, i) => (
            <button
              key={tf}
              className={`px-2 py-1 rounded text-xs font-medium ${
                i === 2 ? "bg-primary-500 text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">BTC/USDT</span>
      </div>
      <div className="h-64 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
        <BarChart3 className="w-10 h-10 mb-2" />
        <p className="text-sm font-medium">Interactive Chart</p>
        <p className="text-xs mt-1">Coming in Phase 2</p>
      </div>
    </div>
  );
}