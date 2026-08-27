"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const isGenerating = useRef(false);

  const storageKeyActive = `gchat_signals_active_${marketType}`;
  const storageKeyRecord = `gchat_signals_record_${marketType}`;

  const [signals, setSignals] = useState<FeedSignal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeyActive);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [signalRecord, setSignalRecord] = useState<FeedSignal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeyRecord);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(storageKeyActive, JSON.stringify(signals));
  }, [signals, storageKeyActive]);

  useEffect(() => {
    localStorage.setItem(storageKeyRecord, JSON.stringify(signalRecord));
  }, [signalRecord, storageKeyRecord]);

  const generateSignals = useCallback(async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;
    setIsScanning(true);

    try {
      const res = await fetch(`/api/scanner?type=${marketType}`);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        const newSignals: FeedSignal[] = [];        const signalGenerationTime = Date.now();

        let validCount = 0;
        for (const asset of json.data) {
          if (validCount >= 5) break;
          
          if (asset.marketType === marketType && asset.score >= 60) {
            validCount++;
            const direction: 'LONG' | 'SHORT' = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
            const timeframe: '1m' | '3m' | '5m' = 
              asset.score >= 80 ? '1m' : asset.score >= 70 ? '3m' : '5m';
            
            const timeframeMs = timeframe === '1m' ? 60000 : timeframe === '3m' ? 180000 : 300000;
            const entryPrice = parseFloat(asset.price);
            
            const signal: FeedSignal = {
              id: `${asset.symbol}-${signalGenerationTime}-${validCount}`,
              asset: asset.symbol,
              marketType: marketType,
              direction,
              entry: entryPrice,
              tp: direction === 'LONG' ? entryPrice * 1.015 : entryPrice * 0.985,
              sl: direction === 'LONG' ? entryPrice * 0.995 : entryPrice * 1.015,
              timeframe,
              signalTime: signalGenerationTime,
              expireTime: signalGenerationTime + timeframeMs,
              confidence: Math.max(65, asset.score || 70),
              status: 'FRESH',
              currentPrice: entryPrice,
              pnl: 0
            };

            newSignals.push(signal);
            subscribe(asset.symbol, marketType);
          }
        }

        if (newSignals.length > 0) {
          setSignals(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueNew = newSignals.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueNew];
          });
        }
      }
    } catch (e) {
      console.error('Signal generation error:', e);
    } finally {
      setIsScanning(false);
      setIsLoading(false);      isGenerating.current = false;
    }
  }, [marketType, subscribe]);

  useEffect(() => {
    setIsLoading(true);
    const hasActive = signals.some(s => s.status === 'FRESH' || s.status === 'ACTIVE');
    
    if (!hasActive) {
      generateSignals();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Heartbeat: Check for expiration and move to record
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const now = Date.now();
      let recordUpdates: FeedSignal[] = [];

      setSignals(prevSignals => {
        const remainingActive: FeedSignal[] = [];

        prevSignals.forEach(signal => {
          // Get the latest price from WebSocket context
          const wsPrice = prices[signal.asset];
          // Fallback to the last known price or entry
          const currentPrice = wsPrice || signal.currentPrice || signal.entry;
          
          if (signal.status === 'WIN' || signal.status === 'LOSS') {
            remainingActive.push(signal);
            return;
          }

          if (now > signal.expireTime) {
            // CALCULATE FINAL PNL CORRECTLY
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;
            
            const finalPnl = parseFloat(pnl.toFixed(2));
            const finalStatus = (finalPnl >= 0 ? 'WIN' : 'LOSS') as 'WIN' | 'LOSS';
            
            const expiredSignal = {
              ...signal,
              status: finalStatus,
              pnl: finalPnl, // SAVE THE PNL HERE
              currentPrice
            };            
            recordUpdates.push(expiredSignal);
          } else {
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;

            remainingActive.push({
              ...signal,
              status: 'ACTIVE' as 'FRESH' | 'ACTIVE' | 'WIN' | 'LOSS',
              currentPrice,
              pnl: parseFloat(pnl.toFixed(2))
            });
          }
        });

        if (recordUpdates.length > 0) {
          setSignalRecord(prevRecord => {
            const existingIds = new Set(prevRecord.map(s => s.id));
            const uniqueNew = recordUpdates.filter(s => !existingIds.has(s.id));
            return [...uniqueNew, ...prevRecord];
          });
        }

        return remainingActive;
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, signalRecord, isLoading, isScanning };
}