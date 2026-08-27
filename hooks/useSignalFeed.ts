"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const isGenerating = useRef(false);

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
              tp: direction === 'LONG' 
                ? entryPrice * 1.015                 : entryPrice * 0.985,
              sl: direction === 'LONG' 
                ? entryPrice * 0.995 
                : entryPrice * 1.015,
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

  useEffect(() => {
    generateSignals();
    const interval = setInterval(generateSignals, 120000);
    return () => clearInterval(interval);
  }, [generateSignals]);

  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const updateInterval = setInterval(() => {
      setSignals(prevSignals => {
        const now = Date.now();
        
        return prevSignals.map(signal => {
          const currentPrice = prices[signal.asset];
          if (!currentPrice) return signal;
          
          if (signal.status === 'WIN' || signal.status === 'LOSS') {
            return signal;          }

          if (now > signal.expireTime) {
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;
            
            const finalPnl = parseFloat(pnl.toFixed(2));
            
            return {
              ...signal,
              status: (finalPnl >= 0 ? 'WIN' : 'LOSS') as 'WIN' | 'LOSS',
              pnl: finalPnl,
              currentPrice
            };
          }

          const pnl = signal.direction === 'LONG' 
            ? ((currentPrice - signal.entry) / signal.entry) * 100
            : ((signal.entry - currentPrice) / signal.entry) * 100;

          return {
            ...signal,
            status: 'ACTIVE' as 'FRESH' | 'ACTIVE' | 'WIN' | 'LOSS',
            currentPrice,
            pnl: parseFloat(pnl.toFixed(2))
          };
        });
      });
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, isLoading };
}