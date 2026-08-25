"use client";

import { useTrading } from "@/context/TradingContext";
import { Wallet, TrendingUp, TrendingDown, Clock, XCircle } from "lucide-react";

export function TradeDashboard() {
  const { balance, trades, closeTrade } = useTrading();

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status !== 'OPEN');
  
  const wins = closedTrades.filter(t => t.status === 'WIN').length;
  const losses = closedTrades.filter(t => t.status === 'LOSS').length;
  const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(0) : '0';

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs opacity-80 font-medium">Paper Trading Balance</p>
            <h2 className="text-3xl font-bold mt-1">${balance.toFixed(2)}</h2>
            <p className={`text-xs mt-1 font-medium ${totalPnl >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              Total P/L: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </p>
          </div>
          <Wallet className="w-8 h-8 opacity-50" />
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <p className="opacity-80">Win Rate</p>
            <p className="font-semibold">{winRate}%</p>
          </div>
          <div>
            <p className="opacity-80">Open Trades</p>
            <p className="font-semibold">{openTrades.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{wins}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Wins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{losses}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Losses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
          <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{closedTrades.length}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">Total</p>
        </div>
      </div>

      <h3 className="text-md font-bold text-gray-900 dark:text-white pt-2">Open Positions</h3>
      {openTrades.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No open paper trades.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {openTrades.map(trade => (
            <div key={trade.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{trade.asset}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{trade.direction} • {trade.leverage}x</p>
                </div>
                <button 
                  onClick={() => {
                    const exitPrice = prompt(`Enter exit price for ${trade.asset}:`, trade.entry.toString());
                    if (exitPrice) closeTrade(trade.id, parseFloat(exitPrice));
                  }}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg active:scale-95 transition-transform"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded"><p className="text-gray-500">Entry</p><p className="font-bold">${trade.entry}</p></div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded"><p className="text-red-500">SL</p><p className="font-bold text-red-700 dark:text-red-300">${trade.sl}</p></div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded"><p className="text-green-500">TP</p><p className="font-bold text-green-700 dark:text-green-300">${trade.tp}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}