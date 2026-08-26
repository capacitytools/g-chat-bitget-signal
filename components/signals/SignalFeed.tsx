"use client";

import { useSignalFeed } from '@/hooks/useSignalFeed';
import { TrendingUp, TrendingDown, Clock, Zap, Timer, CheckCircle, XCircle } from 'lucide-react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useState, useEffect } from 'react';

function FeedSignalCard({ signal }: { signal: FeedSignal }) {
  const isLong = signal.direction === 'LONG';
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(signal.status);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((signal.expireTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      // Auto-expire when time runs out
      if (remaining === 0 && (signal.status === 'FRESH' || signal.status === 'ACTIVE')) {
        setCurrentStatus('EXPIRED');
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [signal.expireTime, signal.status]);

  const getStatusDisplay = () => {
    if (currentStatus === 'EXPIRED' || signal.status === 'WIN' || signal.status === 'LOSS') {
      const isWin = signal.status === 'WIN' || (signal.pnl && signal.pnl > 0);
      return (
        <div className={`rounded-lg px-3 py-2 flex items-center justify-center gap-2 ${
          isWin ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isWin ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span className="text-xs font-bold">
            {isWin ? `WIN +${signal.pnl?.toFixed(2)}%` : `LOSS ${signal.pnl?.toFixed(2)}%`}
          </span>
        </div>
      );
    }
    
    if (signal.status === 'FRESH') {
      return (
        <div className="bg-green-100 dark:bg-green-900/20 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-xs font-bold text-green-700 dark:text-green-400">FRESH SIGNAL</span>
        </div>
      );
    }    
    // ACTIVE with countdown
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg px-3 py-2 flex items-center justify-center gap-2">
        <Timer className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">
          {minutes}:{seconds.toString().padStart(2, '0')} LEFT
        </span>
      </div>
    );
  };

  return (
    <div className={`border-2 rounded-xl p-4 min-w-[300px] max-w-[320px] flex-shrink-0 transition-all ${
      currentStatus === 'EXPIRED' || signal.status === 'WIN' || signal.status === 'LOSS'
        ? (signal.pnl && signal.pnl > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10')
        : (isLong ? 'border-green-500/50 bg-white dark:bg-gray-800' : 'border-red-500/50 bg-white dark:bg-gray-800')
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isLong ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isLong ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{signal.asset}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{signal.timeframe} • {signal.direction}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Confidence</p>
          <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{signal.confidence}%</p>
        </div>
      </div>

      {/* Status with Countdown */}
      <div className="mb-3">
        {getStatusDisplay()}
      </div>

      {/* Price Levels */}
      <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Entry</p>
          <p className="font-bold text-gray-900 dark:text-white">${signal.entry.toFixed(2)}</p>
        </div>        <div className={`rounded-lg p-2 text-center ${isLong ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">TP</p>
          <p className={`font-bold ${isLong ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>${signal.tp.toFixed(2)}</p>
        </div>
        <div className={`rounded-lg p-2 text-center ${isLong ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">SL</p>
          <p className={`font-bold ${isLong ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>${signal.sl.toFixed(2)}</p>
        </div>
      </div>

      {/* Times */}
      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(signal.signalTime).toLocaleTimeString()}</span>
        </div>
        <span className="font-medium">
          Exp: {new Date(signal.expireTime).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export function SignalFeed() {
  const { signals, isLoading } = useSignalFeed();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Scanning Markets...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Finding high-probability setups</p>
        </div>
      </div>
    );
  }

  const activeSignals = signals.filter(s => s.status === 'FRESH' || s.status === 'ACTIVE');
  const closedSignals = signals.filter(s => s.status === 'WIN' || s.status === 'LOSS');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
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

      {/* Active Signals */}
      {activeSignals.length > 0 && (
        <div className="p-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active Signals ({activeSignals.length})
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {activeSignals.map(signal => (
              <FeedSignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Signals */}
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

      {signals.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-4 mt-20">
          <p className="text-sm text-gray-500 dark:text-gray-400">No signals available</p>        </div>
      )}
    </div>
  );
}