"use client";

import { MTFResult } from '@/lib/mtfEngine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MTFSummaryProps {
  data: MTFResult[];
  isLoading: boolean;
}

export function MTFSummary({ data, isLoading }: MTFSummaryProps) {
  if (isLoading || data.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {['1m', '5m', '15m', '1h'].map(tf => (
          <div key={tf} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg animate-pulse h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {data.map((item) => {
        const isBullish = item.trend === 'BULLISH';
        const isBearish = item.trend === 'BEARISH';
        const Icon = isBullish ? TrendingUp : isBearish ? TrendingDown : Minus;
        const color = isBullish ? 'text-green-500' : isBearish ? 'text-red-500' : 'text-gray-400';
        const bg = isBullish ? 'bg-green-50 dark:bg-green-900/20' : isBearish ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800';

        return (
          <div key={item.timeframe} className={`${bg} border border-gray-200 dark:border-gray-700 p-2 rounded-lg flex flex-col items-center justify-center`}>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">{item.timeframe.toUpperCase()}</span>
            <Icon className={`w-4 h-4 ${color} ${isBearish ? 'rotate-180' : ''}`} />
            <span className={`text-[10px] font-semibold mt-1 ${color}`}>
              {item.trend === 'NEUTRAL' ? 'FLAT' : item.trend}
            </span>
          </div>
        );
      })}
    </div>
  );
}