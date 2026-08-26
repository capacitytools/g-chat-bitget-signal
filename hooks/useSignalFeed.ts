"use client";

import { useState, useEffect } from 'react';
import { FeedSignal, generateSignal, updateSignalStatus } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSignals = async () => {
      setIsLoading(true);
      
      try {
        const res = await fetch('/api/scanner');
        const json = await res.json();

        if (json.success && json.data && json.data.length > 0) {
          const newSignals: FeedSignal[] = [];

          for (const asset of json.data) {
            if ((asset.marketType === 'FUTURES' || asset.score >= 70) && newSignals.length < 3) {
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
            setSignals(prev => [...newSignals, ...prev].slice(0, 10));
          }
        }
      } catch (e) {
        console.error('Signal generation error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    generateSignals();
    const interval = setInterval(generateSignals, 120000);
    return () => clearInterval(interval);
  }, [subscribe]);

  // Update based on price changes
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    setSignals(prevSignals => 
      prevSignals.map(signal => {
        const currentPrice = prices[signal.asset];
        if (!currentPrice) return signal;
        return updateSignalStatus(signal, currentPrice);
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
            if (Date.now() > signal.expireTime && updated.status !== 'WIN' && updated.status !== 'LOSS') {
              const pnl = signal.direction === 'LONG' 
                ? ((currentPrice - signal.entry) / signal.entry) * 100
                : ((signal.entry - currentPrice) / signal.entry) * 100;
              return {
                ...updated,
                status: pnl >= 0 ? 'WIN' : 'LOSS',
                pnl
              };
            }
            
            return updated;
          }
          return signal;
        })
      );
    }, 1000);

    return () => clearInterval(expirationTimer);
  }, [prices]);
  return { signals, isLoading };
}