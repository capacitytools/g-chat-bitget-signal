"use client";

import { useState, useEffect, useRef } from 'react';
import { FeedSignal, generateSignal } from '@/lib/signalFeedEngine';
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
          const signalGenerationTime = Date.now(); // FIXED time for all signals

          for (const asset of json.data) {
            if (newSignals.length >= 10) break;
            
            if (asset.marketType === marketType && asset.score >= 60) {
              const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
              const timeframe: '1m' | '3m' | '5m' = 
                asset.score >= 80 ? '1m' : asset.score >= 70 ? '3m' : '5m';
              
              const timeframeMs = timeframe === '1m' ? 60000 : timeframe === '3m' ? 180000 : 300000;
              
              // Generate signal with FIXED parameters
              const signal: FeedSignal = {
                id: `${asset.symbol}-${signalGenerationTime}-${Math.random().toString(36).substr(2, 5)}`,
                asset: asset.symbol,
                marketType: marketType as 'FUTURES' | 'SPOT',
                direction,
                entry: parseFloat(asset.price),
                tp: direction === 'LONG' 
                  ? parseFloat(asset.price) * 1.015 
                  : parseFloat(asset.price) * 0.985,                sl: direction === 'LONG' 
                  ? parseFloat(asset.price) * 0.995 
                  : parseFloat(asset.price) * 1.015,
                timeframe,
                signalTime: signalGenerationTime, // FIXED
                expireTime: signalGenerationTime + timeframeMs, // FIXED
                confidence: Math.max(65, asset.score || 70), // FIXED
                status: 'FRESH',
                currentPrice: parseFloat(asset.price)
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
    // Generate new batch every 2 minutes
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
          // Check if expired
          const now = Date.now();
          if (now > signal.expireTime) {
            // Calculate final P/L
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

          // Still active - just update price
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
