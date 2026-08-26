"use client";

import { useState, useEffect, useRef } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const isGenerating = useRef(false);

  useEffect(() => {
    const generateSignals = async () => {
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

          for (const asset of json.data) {
            if (newSignals.length >= 10) break;
            
            if (asset.marketType === marketType && asset.score >= 60) {
              const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
              const timeframe: '1m' | '3m' | '5m' = 
                asset.score >= 80 ? '1m' : asset.score >= 70 ? '3m' : '5m';
              
              const timeframeMs = timeframe === '1m' ? 60000 : timeframe === '3m' ? 180000 : 300000;
              const entryPrice = parseFloat(asset.price);
              
              // Create signal with proper type casting
              const signal: FeedSignal = {
                id: `${asset.symbol}-${signalGenerationTime}-${Math.random().toString(36).substr(2, 5)}`,
                asset: asset.symbol,
                marketType: marketType === 'FUTURES' ? 'FUTURES' : 'SPOT', // Explicit assignment
                direction,
                entry: entryPrice,
                tp: direction === 'LONG' 
                  ? entryPrice * 1.015                   : entryPrice * 0.985,
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
            setSignals(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const uniqueNew = newSignals.filter(s => !existingIds.has(s.id));
              return [...uniqueNew, ...prev].slice(0, 15);
            });
          }
        }
      } catch (e) {
        console.error('Signal generation error:', e);
      } finally {
        setIsLoading(false);
        hasLoadedOnce.current = true;
        isGenerating.current = false;
      }
    };

    generateSignals();
    const interval = setInterval(generateSignals, 120000);
    return () => clearInterval(interval);
  }, [subscribe, marketType]);

  // Update ONLY current price and status every second
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const updateInterval = setInterval(() => {
      setSignals(prevSignals => 
        prevSignals.map(signal => {
          const currentPrice = prices[signal.asset];
          if (!currentPrice || signal.status === 'WIN' || signal.status === 'LOSS') {
            return signal;
          }
          const now = Date.now();
          if (now > signal.expireTime) {
            const pnl = signal.direction === 'LONG' 
              ? ((currentPrice - signal.entry) / signal.entry) * 100
              : ((signal.entry - currentPrice) / signal.entry) * 100;
            
            return {
              ...signal,
              status: pnl >= 0 ? 'WIN' : 'LOSS',
              pnl,
              currentPrice
            };
          }

          const pnl = signal.direction === 'LONG' 
            ? ((currentPrice - signal.entry) / signal.entry) * 100
            : ((signal.entry - currentPrice) / signal.entry) * 100;

          return {
            ...signal,
            status: 'ACTIVE',
            currentPrice,
            pnl
          };
        })
      );
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, isLoading };
}