"use client";

import { useState, useEffect } from 'react';
import { FeedSignal, generateSignal, updateSignalStatus } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe, unsubscribe } = useLivePrice();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateSignals = async () => {
      if (isGenerating) return;
      setIsGenerating(true);

      try {
        const res = await fetch('/api/scanner');
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          const topAssets = json.data.slice(0, 3);
          const newSignals: FeedSignal[] = [];

          for (const asset of topAssets) {
            if (asset.marketType === 'FUTURES' && asset.score >= 60) {
              const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
              const timeframe: '1m' | '3m' | '5m' = 
                asset.score >= 80 ? '1m' : asset.score >= 70 ? '3m' : '5m';
              
              const signal = generateSignal(
                asset.symbol,
                parseFloat(asset.price),
                direction,
                timeframe,
                asset.score
              );

              newSignals.push(signal);
              subscribe(asset.symbol, 'FUTURES');
            }
          }

          if (newSignals.length > 0) {
            setSignals(prev => {
              const combined = [...newSignals, ...prev].slice(0, 10);
              return combined;
            });
          }
        }
      } catch (e) {
        console.error('Signal generation error:', e);
      } finally {
        setIsGenerating(false);
        setIsLoading(false);
      }
    };

    generateSignals();
    const interval = setInterval(generateSignals, 120000);

    return () => clearInterval(interval);
  }, [isGenerating, subscribe]);

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

  useEffect(() => {
    return () => {
      signals.forEach(s => unsubscribe(s.asset));
    };
  }, [signals, unsubscribe]);

  return { signals, isLoading };
}
