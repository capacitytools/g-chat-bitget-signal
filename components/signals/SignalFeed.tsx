"use client";

import { useSignalFeed } from '@/hooks/useSignalFeed';
import { SignalCard } from './SignalCard';
import { Zap, TrendingUp } from 'lucide-react';

export function SignalFeed() {
  const { signals } = useSignalFeed();

  if (signals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Signal Feed Loading</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scanning markets for high-probability setups...</p>
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
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active Signals ({activeSignals.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {activeSignals.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
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
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}