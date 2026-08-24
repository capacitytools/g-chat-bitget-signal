import { Badge } from "@/components/ui/Badge";
import { TrendingUp, ShieldAlert } from "lucide-react";

interface SignalCardProps {
  asset: string;
  type: string;
  direction: string;
  score: number;
  entry: string;
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  rr: string;
}

export function SignalCard({ asset, type, direction, score, entry, sl, tp1, tp2, tp3, rr }: SignalCardProps) {
  const isLong = direction === "LONG";

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isLong ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
          }`}>
            <TrendingUp className={`w-4 h-4 ${isLong ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400 rotate-180"}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{asset}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{type} • {direction}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
          <p className="font-bold text-primary-600 dark:text-primary-400">{score}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Entry</p>
          <p className="font-semibold text-gray-900 dark:text-white">${entry}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Risk/Reward</p>
          <p className="font-semibold text-primary-600 dark:text-primary-400">{rr}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">
          <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">SL</p>
          <p className="text-xs font-bold text-red-700 dark:text-red-300">${sl}</p>
        </div>
        <div className="flex-[2] grid grid-cols-3 gap-1">
          {[tp1, tp2, tp3].map((tp, i) => (
            <div key={i} className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
              <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">TP{i+1}</p>
              <p className="text-xs font-bold text-green-700 dark:text-green-300">${tp}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <ShieldAlert className="w-3 h-3" />
          <span>Invalid if closes below ${sl}</span>
        </div>
        <button className="px-3 py-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg active:scale-95 transition-transform">
          View Chart
        </button>
      </div>
    </div>
  );
}