import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketData } from "@/types/market";

interface MarketCardProps {
  market: MarketData;
}

export function MarketCard({ market }: MarketCardProps) {
  const changePercent = (parseFloat(market.change24h) * 100).toFixed(2);
  const isPositive = parseFloat(market.change24h) >= 0;
  
  // Format volume (e.g., 1200000 -> 1.2M)
  const volNum = parseFloat(market.volume24h);
  const formattedVol = volNum >= 1_000_000_000 
    ? `${(volNum / 1_000_000_000).toFixed(1)}B` 
    : volNum >= 1_000_000 
    ? `${(volNum / 1_000_000).toFixed(1)}M` 
    : volNum >= 1_000 
    ? `${(volNum / 1_000).toFixed(1)}K` 
    : volNum.toFixed(0);

  // Format price to max 4 decimal places, removing trailing zeros
  const formattedPrice = parseFloat(market.price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{market.symbol}</h3>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {market.marketType}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vol: ${formattedVol}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white text-base">${formattedPrice}</p>
          <p className={`text-xs font-medium flex items-center gap-1 justify-end mt-0.5 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{changePercent}%
          </p>
        </div>
      </div>
    </div>
  );
}