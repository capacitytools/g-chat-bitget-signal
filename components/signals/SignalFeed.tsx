"use client";

import { useSignalFeed } from '@/hooks/useSignalFeed';
import { TrendingUp, TrendingDown, Clock, Zap, Timer, CheckCircle, XCircle, Search, FileText, Trophy, X } from 'lucide-react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useState, useEffect, useRef } from 'react';

type TabType = 'FUTURES' | 'SPOT' | 'RECORD';

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
          </div>        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Confidence</p>
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
          </div>          <p className="text-3xl font-black text-white">
            {isWin ? '+' : ''}{signal.pnl?.toFixed(2)}%
          </p>
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

function SignalRecordCard({ signal }: { signal: FeedSignal }) {
  const isWin = signal.status === 'WIN';
  const isLong = signal.direction === 'LONG';
  const date = new Date(signal.signalTime);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const startTime = date.toLocaleTimeString();
  const endTime = new Date(signal.expireTime).toLocaleTimeString();

  return (
    <div className={`border-l-4 rounded-xl p-4 w-full max-w-2xl mx-auto mb-3 bg-white dark:bg-gray-800 shadow-sm ${
      isWin ? 'border-l-green-500' : 'border-l-red-500'    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isLong ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isLong ? <TrendingUp className="w-7 h-7 text-white" /> : <TrendingDown className="w-7 h-7 text-white" />}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">{signal.asset}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {signal.timeframe} • {signal.direction} • {signal.marketType}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${
          isWin ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          <div className="flex items-center gap-1">
            {isWin ? <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" /> : <X className="w-4 h-4 text-red-600 dark:text-red-400" />}
            <span className={`text-sm font-bold ${
              isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isWin ? 'WIN' : 'LOSS'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Signal Time</p>
            <p className="font-semibold text-gray-900 dark:text-white">{startTime}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Expired Time</p>
            <p className="font-semibold text-gray-900 dark:text-white">{endTime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Entry</p>
          <p className="font-bold text-gray-900 dark:text-white">${signal.entry.toFixed(2)}</p>
        </div>
        <div className={`rounded-lg p-2 text-center ${isLong ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">TP</p>
          <p className={`font-bold ${isLong ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>${signal.tp.toFixed(2)}</p>        </div>
        <div className={`rounded-lg p-2 text-center ${isLong ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
          <p className="text-gray-500 dark:text-gray-400 mb-1">SL</p>
          <p className={`font-bold ${isLong ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>${signal.sl.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className={`text-lg font-black ${
          isWin ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {isWin ? '+' : ''}{signal.pnl?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

function TabSelector({ 
  selected, 
  onChange,
  recordCount
}: { 
  selected: TabType; 
  onChange: (type: TabType) => void;
  recordCount: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
      <button
        onClick={() => onChange('FUTURES')}
        className={`py-3 px-2 rounded-lg text-xs font-bold transition-all ${
          selected === 'FUTURES'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
         Futures
      </button>
      <button
        onClick={() => onChange('SPOT')}
        className={`py-3 px-2 rounded-lg text-xs font-bold transition-all ${
          selected === 'SPOT'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}      >
         Spot
      </button>
      <button
        onClick={() => onChange('RECORD')}
        className={`py-3 px-2 rounded-lg text-xs font-bold transition-all relative ${
          selected === 'RECORD'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        <FileText className="w-4 h-4 inline mr-1" />
        Record
        {recordCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {recordCount > 99 ? '99+' : recordCount}
          </span>
        )}
      </button>
    </div>
  );
}

export function SignalFeed() {
  const [activeTab, setActiveTab] = useState<TabType>('FUTURES');
  const [marketType, setMarketType] = useState<'FUTURES' | 'SPOT'>('FUTURES');
  const { signals, isLoading, isScanning } = useSignalFeed(marketType);
  const [signalRecord, setSignalRecord] = useState<FeedSignal[]>([]);
  const prevSignalsRef = useRef<FeedSignal[]>([]);

  // Track signals that just expired and add them to the record
  useEffect(() => {
    const prevSignals = prevSignalsRef.current;
    
    signals.forEach(signal => {
      const prev = prevSignals.find(s => s.id === signal.id);
      // If signal just changed to WIN or LOSS, add to record
      if (
        (signal.status === 'WIN' || signal.status === 'LOSS') &&
        (!prev || (prev.status !== 'WIN' && prev.status !== 'LOSS'))
      ) {
        setSignalRecord(prevRecord => {
          // Don't add duplicates
          if (prevRecord.find(s => s.id === signal.id)) return prevRecord;
          return [signal, ...prevRecord];
        });
      }
    });

    prevSignalsRef.current = signals;  }, [signals]);

  // Update market type when tab changes
  useEffect(() => {
    if (activeTab === 'FUTURES') {
      setMarketType('FUTURES');
    } else if (activeTab === 'SPOT') {
      setMarketType('SPOT');
    }
  }, [activeTab]);

  const activeSignals = signals.filter(s => s.status === 'FRESH' || s.status === 'ACTIVE');
  const closedSignals = signals.filter(s => s.status === 'WIN' || s.status === 'LOSS');

  // Calculate record stats
  const totalWins = signalRecord.filter(s => s.status === 'WIN').length;
  const totalLosses = signalRecord.filter(s => s.status === 'LOSS').length;
  const winRate = signalRecord.length > 0 
    ? ((totalWins / signalRecord.length) * 100).toFixed(1) 
    : '0.0';
  const totalPnl = signalRecord.reduce((sum, s) => sum + (s.pnl || 0), 0);

  if (isLoading || (signals.length === 0 && isScanning && activeTab !== 'RECORD')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Search className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Scanning {marketType} Markets...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing price action for high-probability setups</p>
        </div>
      </div>
    );
  }

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
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {activeTab === 'RECORD' ? 'Signal History' : `Live ${marketType} Feed`}
              </p>
            </div>          </div>
          {activeTab !== 'RECORD' && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE
            </div>
          )}
        </div>
        
        <TabSelector 
          selected={activeTab} 
          onChange={setActiveTab}
          recordCount={signalRecord.length}
        />
      </div>

      <div className="p-4 space-y-4">
        {/* FUTURES or SPOT TAB */}
        {activeTab !== 'RECORD' && (
          <>
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

            {signals.length > 0 && activeSignals.length === 0 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">All signals expired. Scanning for new setups...</p>              </div>
            )}
          </>
        )}

        {/* SIGNAL RECORD TAB */}
        {activeTab === 'RECORD' && (
          <div>
            {/* Stats Header */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                Signal Performance
              </h2>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Total</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{signalRecord.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-green-500 uppercase">Wins</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalWins}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-red-500 uppercase">Losses</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{totalLosses}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-primary-500 uppercase">Win Rate</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{winRate}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">Total P/L</p>
                <p className={`text-xl font-bold ${
                  totalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Record List */}
            {signalRecord.length > 0 ? (
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  All Expired Signals ({signalRecord.length})
                </h2>
                {signalRecord.map(signal => (
                  <SignalRecordCard key={signal.id} signal={signal} />                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Records Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expired signals will appear here automatically
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}