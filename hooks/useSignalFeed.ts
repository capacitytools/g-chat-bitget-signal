"use client";

import { useState, useEffect, useRef } from 'react';
import { FeedSignal, generateSignal, updateSignalStatus } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const isGenerating = useRef(false);

  useEffect(() => {
    const generateSignals = async () => {
      // Prevent duplicate runs
      if (isGenerating.current) return;
      isGenerating.current = true;

      // Only show loading on first run
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      
      try {
        const res = await fetch('/api/scanner');
        const json = await res.json();

        if (json.success && json.data && json.data.length > 0) {
          const newSignals: FeedSignal[] = [];

          for (const asset of json.data) {
            if (newSignals.length >= 8) break;
            
            if (asset.marketType === 'FUTURES' || asset.score >= 65) {
              const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
              const timeframe: '1m' | '3m' | '5m' = '5m';
              
              const signal = generateSignal(
                asset.symbol,
                parseFloat(asset.price),
                direction,
                timeframe,
                Math.max(65, asset.score || 70)
              );

              newSignals.push(signal);
              subscribe(asset.symbol, asset.marketType || 'FUTURES');
            }
          }
          if (newSignals.length > 0) {
            setSignals(prev => {
              // Only add if we don't already have these signals
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
        setHasLoadedOnce(true);
        isGenerating.current = false;
      }
    };

    generateSignals();
    const interval = setInterval(generateSignals, 120000);
    return () => clearInterval(interval);
  }, [subscribe, hasLoadedOnce]);

  // Update based on price changes
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    setSignals(prevSignals => 
      prevSignals.map(signal => {
        const currentPrice = prices[signal.asset];
        if (!currentPrice) return signal;
        
        const updated = updateSignalStatus(signal, currentPrice);
        return { ...updated, currentPrice };
      })
    );
  }, [prices]);

  // FORCE EXPIRATION CHECK EVERY SECOND
  useEffect(() => {
    const expirationTimer = setInterval(() => {
      setSignals(prevSignals => 
        prevSignals.map(signal => {
          if (signal.status === 'FRESH' || signal.status === 'ACTIVE') {
            const currentPrice = prices[signal.asset] || signal.entry;
            const updated = updateSignalStatus(signal, currentPrice);
            
            // Force expire if time is up
            if (Date.now() > signal.expireTime && updated.status !== 'WIN' && updated.status !== 'LOSS') {              const pnl = signal.direction === 'LONG' 
                ? ((currentPrice - signal.entry) / signal.entry) * 100
                : ((signal.entry - currentPrice) / signal.entry) * 100;
              return {
                ...updated,
                status: pnl >= 0 ? 'WIN' : 'LOSS',
                pnl,
                currentPrice
              };
            }
            
            return { ...updated, currentPrice };
          }
          return signal;
        })
      );
    }, 1000);

    return () => clearInterval(expirationTimer);
  }, [prices]);

  return { signals, isLoading };
}