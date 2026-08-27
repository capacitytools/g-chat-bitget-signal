"use client";

import { useSignalFeed } from '@/hooks/useSignalFeed';
import { TrendingUp, TrendingDown, Clock, Zap, Timer, CheckCircle, XCircle } from 'lucide-react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useState, useEffect } from 'react';

function SignalCard({ signal }: { signal: FeedSignal }) {
  const isLong = signal.direction === 'LONG';
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((signal.expireTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [signal.expireTime]);

  const isExpired = signal.status === 'WIN' || signal.status === 'LOSS';
  const isWin = signal.status === 'WIN';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const livePnl = signal.pnl || 0;

  return (
    <div className={`border-2 rounded-xl p-4 w-full max-w-2xl mx-auto transition-all mb-3 ${
      isExpired
        ? (isWin ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10')
        : (isLong ? 'border-green-500/50 bg-white dark:bg-gray-800' : 'border-red-500/50 bg-white dark:bg-gray-800')
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isLong ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isLong ? <TrendingUp className="w-7 h-7 text-white" /> : <TrendingDown className="w-7 h-7 text-white" />}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">{signal.asset}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{signal.timeframe} • {signal.direction}</p>
          </div>
        </div>
        <div className="text-right">          <p className="text-[10px] font-bold text-gray-400 uppercase">Confidence</p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{signal.confidence}%</p>
        </div>
      </div>

      {!isExpired && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 mb-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Timer className="w-6 h-6 text-white animate-pulse" />
            <span className="text-sm font-bold text-white uppercase">Time Remaining</span>
          </div>
          <p className="text-4xl font-black text-white tabular-nums">
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      {!isExpired && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ${signal.currentPrice?.toFixed(2) || signal.entry.toFixed(2)}
            </p>
          </div>
          <div className={`rounded-xl p-3 text-center ${
            livePnl >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Live P/L</p>
            <p className={`text-lg font-bold ${
              livePnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {livePnl >= 0 ? '+' : ''}{livePnl.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className={`rounded-xl p-6 mb-3 text-center ${
          isWin ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {isWin ? <CheckCircle className="w-8 h-8 text-white" /> : <XCircle className="w-8 h-8 text-white" />}
            <span className="text-2xl font-black text-white">
              {isWin ? 'WIN' : 'LOSS'}
            </span>
          </div>
          <p className="text-3xl font-black text-white">
            {isWin ? '+' : ''}{signal.pnl?.toFixed(2)}%          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Entry</p>
          <p className="font-bold text-gray-900 dark:text-white">${signal.entry.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${isLong ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">TP</p>
          <p className={`font-bold ${isLong ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>${signal.tp.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${isLong ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">SL</p>
          <p className={`font-bold ${isLong ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>${signal.sl.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Started: {new Date(signal.signalTime).toLocaleTimeString()}</span>
        </div>
        <span className="font-medium">
          Expires: {new Date(signal.expireTime).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function MarketTypeSelector({ 
  selected, 
  onChange 
}: { 
  selected: 'FUTURES' | 'SPOT'; 
  onChange: (type: 'FUTURES' | 'SPOT') => void 
}) {
  return (
    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
      <button
        onClick={() => onChange('FUTURES')}
        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
          selected === 'FUTURES'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        🔷 Futures Signals      </button>
      <button
        onClick={() => onChange('SPOT')}
        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
          selected === 'SPOT'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
         Spot Signals
      </button>
    </div>
  );
}

export function SignalFeed() {
  const [marketType, setMarketType] = useState<'FUTURES' | 'SPOT'>('FUTURES');
  const { signals, isLoading } = useSignalFeed(marketType);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Scanning {marketType} Markets...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Finding high-probability setups</p>
        </div>
      </div>
    );
  }

  const activeSignals = signals.filter(s => s.status === 'FRESH' || s.status === 'ACTIVE');
  const closedSignals = signals.filter(s => s.status === 'WIN' || s.status === 'LOSS');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">G-Chat Signal</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Live {marketType} Feed</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            LIVE
          </div>
        </div>
        
        <MarketTypeSelector selected={marketType} onChange={setMarketType} />
      </div>

      <div className="p-4 space-y-4">
        {activeSignals.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active Signals ({activeSignals.length})
            </h2>
            {activeSignals.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}

        {closedSignals.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Recent Results ({closedSignals.length})
            </h2>
            {closedSignals.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}

        {signals.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center p-4 mt-20">
            <p className="text-sm text-gray-500 dark:text-gray-400">No signals available</p>
          </div>
        )}
      </div>
    </div>
  );
}