"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const isGenerating = useRef(false);

  // 1. Initialize from Local Storage (Persistence)
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

  // 2. Save to Local Storage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKeyActive, JSON.stringify(signals));
  }, [signals, storageKeyActive]);

  useEffect(() => {
    localStorage.setItem(storageKeyRecord, JSON.stringify(signalRecord));
  }, [signalRecord, storageKeyRecord]);

  // 3. Generate Signals (Only if empty)
  const generateSignals = useCallback(async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;
    setIsScanning(true);

    try {
      const res = await fetch(`/api/scanner?type=${marketType}`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const newSignals: FeedSignal[] = [];
        const signalGenerationTime = Date.now();

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
      console.error('Signal generation error:', e);    } finally {
      setIsScanning(false);
      setIsLoading(false);
      isGenerating.current = false;
    }
  }, [marketType, subscribe]);

  // 4. Initial Load & Expiration Check
  useEffect(() => {
    setIsLoading(true);
    
    // Check if we have active signals in storage
    const hasActive = signals.some(s => s.status === 'FRESH' || s.status === 'ACTIVE');
    
    if (!hasActive) {
      // No active signals, scan for new ones
      generateSignals();
    } else {
      // We have signals, just stop loading
      setIsLoading(false);
    }
  }, []); // Run once on mount

  // 5. The Heartbeat: Update prices, countdown, and move to record
  useEffect(() => {
    if (Object.keys(prices).length === 0 && signals.length === 0) return;

    const updateInterval = setInterval(() => {
      const now = Date.now();
      let recordUpdates: FeedSignal[] = [];

      setSignals(prevSignals => {
        const remainingActive: FeedSignal[] = [];

        prevSignals.forEach(signal => {
          const currentPrice = prices[signal.asset] || signal.currentPrice || signal.entry;
          
          // If already expired in the past, keep it as is
          if (signal.status === 'WIN' || signal.status === 'LOSS') {
            remainingActive.push(signal);
            return;
          }

          // Check if time is up
          if (now > signal.expireTime) {
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;
            
            const finalPnl = parseFloat(pnl.toFixed(2));            const finalStatus = (finalPnl >= 0 ? 'WIN' : 'LOSS') as 'WIN' | 'LOSS';
            
            const expiredSignal = {
              ...signal,
              status: finalStatus,
              pnl: finalPnl,
              currentPrice
            };
            
            recordUpdates.push(expiredSignal); // Move to record
          } else {
            // Still active
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

        // Add newly expired signals to the record
        if (recordUpdates.length > 0) {
          setSignalRecord(prevRecord => {
            const existingIds = new Set(prevRecord.map(s => s.id));
            const uniqueNew = recordUpdates.filter(s => !existingIds.has(s.id));
            return [...uniqueNew, ...prevRecord]; // Newest first
          });
        }

        return remainingActive;
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, signalRecord, isLoading, isScanning };
}