"use client";

import { useState } from "react";
import { TradingChart } from "@/components/chart/TradingChart";
import { SignalCard } from "./SignalCard";
import { useSignalAnalysis } from "@/hooks/useSignalAnalysis";
import { ChartControls } from "@/components/chart/ChartControls";
import { Loader2 } from "lucide-react";

export function SignalDashboard() {
  const [interval, setInterval] = useState("15m");
  const { analysis, candles, ema9, ema21, ema50, isLoading } = useSignalAnalysis("BTCUSDT", "SPOT", interval);

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
            {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>}
            <TradingChart candles={candles} ema9={ema9} ema21={ema21} ema50={ema50} />
         </div>
      </div>

      <h3 className="text-md font-bold text-gray-900 dark:text-white pt-2">Signal Engine</h3>
      {analysis ? (
         <SignalCard analysis={analysis} asset="BTC/USDT" type="Spot" />
      ) : (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center text-gray-500">Calculating signal...</div>
      )}
    </div>
  );
}