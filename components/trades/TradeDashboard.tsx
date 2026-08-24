import { Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";

export function TradeDashboard() {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-80 font-medium">Paper Trading Balance</p>
            <h2 className="text-3xl font-bold mt-1">$100.00</h2>
          </div>
          <Wallet className="w-8 h-8 opacity-50" />
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <p className="opacity-80">Daily P/L</p>
            <p className="font-semibold">+$0.00 (0%)</p>
          </div>
          <div>
            <p className="opacity-80">Open Trades</p>
            <p className="font-semibold">0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Wins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Losses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">0%</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Win Rate</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">No Trades Yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your paper trade history will appear here once you start testing signals.
        </p>
      </div>
    </div>
  );
}