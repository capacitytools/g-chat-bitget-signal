"use client";

import { useState } from "react";
import { TradingChart } from "@/components/chart/TradingChart";
import { SignalCard } from "./SignalCard";
import { useSignalAnalysis } from "@/hooks/useSignalAnalysis";
import { ChartControls } from "@/components/chart/ChartControls";
import { Loader2, AlertCircle } from "lucide-react";

export function SignalDashboard() {
  const [interval, setInterval] = useState("15m");
  const { analysis, candles, ema9, ema21, ema50, isLoading, error } = useSignalAnalysis("BTCUSDT", "SPOT", interval);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Market Analysis</h2>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
         <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-900 dark:text-white text-sm">BTC/USDT</h3>
               <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">SPOT</span>
            </div>
            <ChartControls activeInterval={interval} onIntervalChange={setInterval} />
         </div>
         
         <div className="relative w-full h-64 sm:h-80">
            {isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10 gap-2">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  <span className="text-xs text-gray-500">Loading chart data...</span>
               </div>
            )}
            
            {!isLoading && candles.length === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 z-10 gap-2 text-center px-4">
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Chart Data Unavailable</p>
                  <p className="text-xs text-gray-500">{error || "Market data unavailable."}</p>
               </div>
            )}

            <TradingChart candles={candles} ema9={ema9} ema21={ema21} ema50={ema50} />
         </div>
      </div>

      <h3 className="text-md font-bold text-gray-900 dark:text-white pt-2">Signal Engine</h3>
      
      {isLoading ? (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Calculating signal...</span>
         </div>
      ) : analysis ? (
         <SignalCard analysis={analysis} asset="BTC/USDT" marketType="SPOT" />
      ) : (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center text-gray-500">
            Waiting for data...
         </div>
      )}
    </div>
  );
}
