"use client";

import { useSignalFeed } from '@/hooks/useSignalFeed';
import { TrendingUp, TrendingDown, Clock, Zap, RefreshCw } from 'lucide-react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useState } from 'react';

function FeedSignalCard({ signal }: { signal: FeedSignal }) {
  const isLong = signal.direction === 'LONG';
  
  const getStatusBadge = () => {
    if (signal.status === 'FRESH') {
      return <span className="text-[10px] font-bold text-green-600 dark:text-green-400">🟢 Fresh Signal</span>;
    }
    if (signal.status === 'ACTIVE') {
      const timeLeft = Math.max(0, Math.floor((signal.expireTime - Date.now()) / 1000));
      return <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">⏱ {timeLeft}s left</span>;
    }
    if (signal.status === 'WIN') {
      return <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✅ WIN +{signal.pnl?.toFixed(2)}%</span>;
    }
    return <span className="text-[10px] font-bold text-red-600 dark:text-red-400">❌ LOSS {signal.pnl?.toFixed(2)}%</span>;
  };

  return (
    <div className={`border-2 rounded-lg p-3 min-w-[280px] max-w-[300px] flex-shrink-0 cursor-pointer active:scale-95 transition-transform ${
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
        {getStatusBadge()}      </div>

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

export function SignalFeed() {
  const { signals } = useSignalFeed();
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  if (signals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">G-Chat Signal</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Live Futures Feed</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              SCANNING
            </div>          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 mt-20">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Zap className="w-10 h-10 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scanning Markets...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Analyzing top Futures pairs for high-probability setups
          </p>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-w-sm">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Signals will appear here automatically. This usually takes 10-30 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeSignals = signals.filter(s => s.status === 'FRESH' || s.status === 'ACTIVE');
  const closedSignals = signals.filter(s => s.status === 'WIN' || s.status === 'LOSS');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">G-Chat Signal</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Live Futures Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </div>
        </div>
      </div>

      {activeSignals.length > 0 && (
        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active Signals ({activeSignals.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {activeSignals.map(signal => (
              <FeedSignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {closedSignals.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Recent Results ({closedSignals.length})
          </h2>
          <div className="space-y-2">
            {closedSignals.map(signal => (
              <FeedSignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}