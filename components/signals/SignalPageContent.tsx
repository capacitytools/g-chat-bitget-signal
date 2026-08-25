"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TradingChart } from "@/components/chart/TradingChart";
import { SignalCard } from "@/components/signals/SignalCard";
import { useSignalAnalysis } from "@/hooks/useSignalAnalysis";
import { useMTFAnalysis } from "@/hooks/useMTFAnalysis";
import { ChartControls } from "@/components/chart/ChartControls";
import { AssetSelector } from "@/components/signals/AssetSelector";
import { MTFSummary } from "@/components/signals/MTFSummary";
import { ChatBriefing } from "@/components/signals/ChatBriefing";
import { generateBriefing } from "@/lib/chatBriefing";
import { Loader2, AlertCircle } from "lucide-react";

export function SignalPageContent() {
  const searchParams = useSearchParams();
  
  const asset = searchParams.get('asset') || 'BTCUSDT';
  const marketType = searchParams.get('type') || 'SPOT';
  
  const [interval, setInterval] = useState("5m"); // Default to 5m for Futures scalping
  
  const { analysis, candles, ema9, ema21, ema50, isLoading, error } = useSignalAnalysis(asset, marketType as 'SPOT' | 'FUTURES', interval);
  const { mtfData, isLoading: isMTFLoading } = useMTFAnalysis(asset, marketType as 'SPOT' | 'FUTURES');

  const briefingText = useMemo(() => {
    if (analysis && mtfData.length > 0) {
      return generateBriefing(mtfData, analysis, asset);
    }
    return "Analyzing market structure...";
  }, [analysis, mtfData, asset]);

  useEffect(() => {
    setInterval("5m");
  }, [asset, marketType]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <AssetSelector />
      
      <div className="p-4 space-y-4">
        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
           <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
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

        {/* Multi-Timeframe Summary */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Multi-Timeframe Alignment</h3>
          <MTFSummary data={mtfData} isLoading={isMTFLoading} />
        </div>

        {/* G-Chat Briefing */}
        <ChatBriefing text={briefingText} />

        {/* Signal Engine */}
        <h3 className="text-md font-bold text-gray-900 dark:text-white pt-2">Signal Engine</h3>
        
        {isLoading ? (
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl text-center text-gray-500 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Calculating signal...</span>
           </div>
        ) : analysis ? (
           <SignalCard analysis={analysis} asset={asset} type={marketType} />
        ) : (
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center text-gray-500">
              Waiting for data...
           </div>
        )}
      </div>
    </div>
  );
}