"use client";

import { useState, useEffect, useRef } from 'react';
import { FeedSignal } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed(marketType: 'FUTURES' | 'SPOT' = 'FUTURES') {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const isGenerating = useRef(false);

  const generateSignals = async () => {
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
              tp: direction === 'LONG' 
                ? entryPrice * 1.015 
                : entryPrice * 0.985,
              sl: direction === 'LONG' 
                ? entryPrice * 0.995                 : entryPrice * 1.015,
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
          // ONLY add new signals, never replace existing ones
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
      setIsLoading(false);
      isGenerating.current = false;
    }
  };

  // Generate signals on mount
  useEffect(() => {
    generateSignals();
  }, [marketType]);

  // Check every 10 seconds if we need new signals (only when all expired)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      setSignals(prev => {
        const hasActive = prev.some(s => s.status === 'FRESH' || s.status === 'ACTIVE');
        if (!hasActive && prev.length > 0) {
          // All signals expired, generate new batch
          setTimeout(() => generateSignals(), 1000);
        }
        return prev;
      });
    }, 10000);
    return () => clearInterval(checkInterval);
  }, []);

  // Update prices and countdown every second
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const updateInterval = setInterval(() => {
      setSignals(prevSignals => {
        const now = Date.now();
        
        return prevSignals.map(signal => {
          const currentPrice = prices[signal.asset];
          if (!currentPrice) return signal;
          
          // If already expired, don't touch it
          if (signal.status === 'WIN' || signal.status === 'LOSS') {
            return signal;
          }

          // Check if time expired
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

          // Still active - update price and P/L only
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
      });    }, 1000);

    return () => clearInterval(updateInterval);
  }, [prices]);

  return { signals, isLoading, isScanning };
}