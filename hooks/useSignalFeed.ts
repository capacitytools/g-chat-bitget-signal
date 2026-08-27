"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const signalsRef = useRef<FeedSignal[]>([]);
  const hasLoadedOnce = useRef(false);
  const isGenerating = useRef(false);

  // Generate signals function
  const generateSignals = useCallback(async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;

    if (!hasLoadedOnce.current) {
      setIsLoading(true);
    }
    
    try {
      const res = await fetch(`/api/scanner?type=${marketType}`);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        const newSignals: FeedSignal[] = [];
        const signalGenerationTime = Date.now();

        // Only take first 5 valid assets
        let validCount = 0;
        for (const asset of json.data) {
          if (validCount >= 5) break;
          
          if (asset.marketType === marketType && asset.score >= 60) {
            validCount++;
            const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
            const timeframe: '1m' | '3m' | '5m' = 
              asset.score >= 80 ? '1m' : asset.score >= 70 ? '3m' : '5m';
            
            // Calculate correct expire time
            const timeframeMs = timeframe === '1m' ? 60000 : timeframe === '3m' ? 180000 : 300000;
            const entryPrice = parseFloat(asset.price);
            
            const signal: FeedSignal = {
              id: `${asset.symbol}-${signalGenerationTime}-${validCount}`,
              asset: asset.symbol,
              marketType: marketType,              direction,
              entry: entryPrice,
              tp: direction === 'LONG' 
                ? entryPrice * 1.015 
                : entryPrice * 0.985,
              sl: direction === 'LONG' 
                ? entryPrice * 0.995 
                : entryPrice * 1.015,
              timeframe,
              signalTime: signalGenerationTime,
              expireTime: signalGenerationTime + timeframeMs,
              confidence: Math.max(65, asset.score || 70),
              status: 'FRESH',
              currentPrice: entryPrice
            };

            newSignals.push(signal);
            subscribe(asset.symbol, marketType);
          }
        }

        if (newSignals.length > 0) {
          signalsRef.current = newSignals;
          setSignals(newSignals);
        }
      }
    } catch (e) {
      console.error('Signal generation error:', e);
    } finally {
      setIsLoading(false);
      hasLoadedOnce.current = true;
      isGenerating.current = false;
    }
  }, [marketType, subscribe]);

  // Generate signals on mount and every 2 minutes
  useEffect(() => {
    generateSignals();
    const interval = setInterval(generateSignals, 120000);
    return () => clearInterval(interval);
  }, [generateSignals]);

  // Update prices and countdown every second
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const updateInterval = setInterval(() => {
      const now = Date.now();
      
      setSignals(prevSignals => {        const updated = prevSignals.map(signal => {
          const currentPrice = prices[signal.asset];
          if (!currentPrice) return signal;
          
          // If already expired, don't update
          if (signal.status === 'WIN' || signal.status === 'LOSS') {
            return signal;
          }

          // Check if time expired
          if (now > signal.expireTime) {
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;
            
            return {
              ...signal,
              status: pnl >= 0 ? 'WIN' : 'LOSS',
              pnl: parseFloat(pnl.toFixed(2)),
              currentPrice
            };
          }

          // Still active - update price and P/L
          const pnl = signal.direction === 'LONG' 
            ? ((currentPrice - signal.entry) / signal.entry) * 100
            : ((signal.entry - currentPrice) / signal.entry) * 100;

          return {
            ...signal,
            status: 'ACTIVE',
            currentPrice,
            pnl: parseFloat(pnl.toFixed(2))
          };
        });

        signalsRef.current = updated;
        return updated;
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, isLoading };
}