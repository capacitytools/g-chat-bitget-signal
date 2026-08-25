"use client";

import { useState, useEffect } from "react";
import { useTrading, PaperTrade } from "@/context/TradingContext";
import { useLivePrice } from "@/context/LivePriceContext";
import { Wallet, Clock, BarChart3, List } from "lucide-react";
import { PerformanceDashboard } from "@/components/analytics/PerformanceDashboard";

export function TradeDashboard() {
  const { balance, trades, closeTrade } = useTrading();
  const { prices } = useLivePrice();
  const [view, setView] = useState<"analytics" | "positions">("analytics");

  const openTrades = trades.filter((t) => t.status === "OPEN");
  const closedTrades = trades.filter((t) => t.status !== "OPEN");

  const wins = closedTrades.filter((t) => t.status === "WIN").length;
  const losses = closedTrades.filter((t) => t.status === "LOSS").length;

  // Calculate realized P/L for closed trades
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Calculate live unrealized P/L for open trades
  const getLivePnL = (trade: PaperTrade) => {
    const currentPrice = prices?.[trade.asset];
    if (!currentPrice) return 0;

    if (trade.direction === "LONG") {
      return ((currentPrice - trade.entry) / trade.entry) * (trade.positionSize || 0) * (trade.leverage || 1);
    } else {
      return ((trade.entry - currentPrice) / trade.entry) * (trade.positionSize || 0) * (trade.leverage || 1);
    }
  };

  const totalUnrealizedPnL = openTrades.reduce((sum, t) => sum + getLivePnL(t), 0);

  // Keep an effect if you want to poll or react to price changes (example placeholder)
  useEffect(() => {
    // no-op for now; prices come from context
  }, [prices]);

  return (
    <div className="p-4 space-y-4">
      {/* Balance Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-80 font-medium">Paper Trading Balance</p>
            <h2 className="text-3xl font-bold mt-1">${(balance || 0).toFixed(2)}</h2>
            <p
              className={`text-xs mt-1 font-medium ${
                totalPnl >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              Realized P/L: {totalPnl >= 0 ? "+" : ""}
              ${(totalPnl || 0).toFixed(2)}
            </p>
            {totalUnrealizedPnL !== 0 && (
              <p
                className={`text-xs font-medium ${
                  totalUnrealizedPnL >= 0 ? "text-green-200" : "text-red-200"
                }`}
              >
                Unrealized: {totalUnrealizedPnL >= 0 ? "+" : ""}
                ${(totalUnrealizedPnL || 0).toFixed(2)}
              </p>
            )}
          </div>
          <Wallet className="w-8 h-8 opacity-50" />
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <p className="opacity-80">Win Rate</p>
            <p className="font-semibold">
              {closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div>
            <p className="opacity-80">Open Trades</p>
            <p className="font-semibold">{openTrades.length}</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setView("analytics")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors ${
            view === "analytics"
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
        <button
          onClick={() => setView("positions")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors ${
            view === "positions"
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <List className="w-4 h-4" /> Positions ({openTrades.length})
        </button>
      </div>

      {/* Content */}
      {view === "analytics" ? (
        <PerformanceDashboard trades={trades} />
      ) : (
        <div className="space-y-3">
          {openTrades.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
              <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No open paper trades.</p>
            </div>
          ) : (
            openTrades.map((trade) => {
              const livePnL = getLivePnL(trade);
              const currentPrice = prices?.[trade.asset] ?? trade.entry ?? 0;

              return (
                <div
                  key={trade.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{trade.asset}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {trade.direction} • {trade.leverage}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${livePnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {livePnL >= 0 ? "+" : ""}
                        ${livePnL.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">${Number(currentPrice).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <p className="text-gray-500">Entry</p>
                      <p className="font-bold">${(trade.entry ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <p className="text-red-500">SL</p>
                      <p className="font-bold text-red-700 dark:text-red-300">${(trade.sl ?? 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <p className="text-green-500">TP</p>
                      <p className="font-bold text-green-700 dark:text-green-300">${(trade.tp ?? 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => closeTrade(trade.id, Number(currentPrice))}
                    className="w-full mt-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
                  >
                    Close Position at ${Number(currentPrice).toFixed(2)}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}