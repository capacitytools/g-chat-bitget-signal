import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const mockMarkets = [
  { symbol: "BTC/USDT", price: "64,230.50", change: "+2.4%", volume: "1.2B", trend: "Bullish", score: 87, status: "WATCH" },
  { symbol: "ETH/USDT", price: "3,450.20", change: "-1.2%", volume: "850M", trend: "Bearish", score: 45, status: "WAIT" },
  { symbol: "SOL/USDT", price: "145.80", change: "+5.6%", volume: "620M", trend: "Bullish", score: 91, status: "STRONG" },
  { symbol: "XRP/USDT", price: "0.5840", change: "+0.8%", volume: "310M", trend: "Neutral", score: 62, status: "MODERATE" },
];

export function MarketList() {
  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search markets (BTC, ETH, SOL...)"
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {["ALL", "SPOT", "FUTURES"].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {mockMarkets.map((market) => (
          <div
            key={market.symbol}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{market.symbol}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Vol: {market.volume}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">${market.price}</p>
                <p className={`text-xs font-medium flex items-center gap-1 justify-end ${
                  market.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}>
                  {market.change.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {market.change}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">Trend: <span className="font-medium text-gray-700 dark:text-gray-200">{market.trend}</span></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Score: <span className="font-bold text-primary-600 dark:text-primary-400">{market.score}/100</span></span>
              </div>
              <Badge variant={market.status === "STRONG" ? "success" : market.status === "WAIT" ? "neutral" : "warning"}>
                {market.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}