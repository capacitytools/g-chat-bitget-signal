"use client";

import { FeedSignal } from '@/lib/signalFeedEngine';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface SignalCardProps {
  signal: FeedSignal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const isLong = signal.direction === 'LONG';
  
  const getStatusBadge = () => {
    if (signal.status === 'FRESH') {
      return <span className="text-[10px] font-bold text-green-600 dark:text-green-400">🟢 Fresh Signal</span>;
    }
    if (signal.status === 'ACTIVE') {
      const timeLeft = Math.max(0, Math.floor((signal.expireTime - Date.now()) / 1000));
      return <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">🟡 {timeLeft}s left</span>;
    }
    if (signal.status === 'WIN') {
      return <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✅ WIN +{signal.pnl?.toFixed(2)}%</span>;
    }
    return <span className="text-[10px] font-bold text-red-600 dark:text-red-400">❌ LOSS {signal.pnl?.toFixed(2)}%</span>;
  };

  return (
    <div className={`border-2 rounded-lg p-3 min-w-[280px] max-w-[300px] flex-shrink-0 ${
      isLong 
        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${
            isLong ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isLong ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{signal.asset}</p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">{signal.timeframe} • {signal.direction}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Confidence</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{signal.confidence}%</p>
        </div>
      </div>

      <div className="mb-2 bg-white/50 dark:bg-black/20 rounded px-2 py-1">
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
        <div className="bg-white dark:bg-gray-800 rounded p-1 text-center">
          <p className="text-gray-500">Entry</p>
          <p className="font-bold text-gray-900 dark:text-white">${signal.entry.toFixed(2)}</p>
        </div>
        <div className={`rounded p-1 text-center ${isLong ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <p className="text-gray-500">TP</p>
          <p className={`font-bold ${isLong ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>${signal.tp.toFixed(2)}</p>
        </div>
        <div className={`rounded p-1 text-center ${isLong ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
          <p className="text-gray-500">SL</p>
          <p className={`font-bold ${isLong ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>${signal.sl.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(signal.signalTime).toLocaleTimeString()}</span>
        </div>
        <span>Exp: {new Date(signal.expireTime).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}