"use client";

import { useState, useEffect } from 'react';
import { FeedSignal, generateSignal, updateSignalStatus } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe, unsubscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSignals = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching scanner data...');
        const res = await fetch('/api/scanner');
        const json = await res.json();
        console.log('Scanner response:', json);

        if (json.success && json.data && json.data.length > 0) {
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
              console.log('Generated signal:', signal);
            }
          }

          if (newSignals.length > 0) {
            setSignals(prev => {
              const combined = [...newSignals, ...prev].slice(0, 10);
              return combined;
            });
          } else {
            setError('No high-quality signals found. Waiting for better setups...');
          }
        } else {
          setError('Scanner returned no data. Retrying...');
        }
      } catch (e) {
        console.error('Signal generation error:', e);
        setError('Error fetching signals. Retrying...');
      } finally {
        setIsLoading(false);
      }
    };

    // Generate immediately
    generateSignals();
    
    // Then retry every 2 minutes
    const interval = setInterval(generateSignals, 120000);

    return () => clearInterval(interval);
  }, [subscribe]);

  // Update signals with live prices
  useEffect(() => {
    if (Object.keys(prices).length === 0 || signals.length === 0) return;

    setSignals(prevSignals => 
      prevSignals.map(signal => {
        const currentPrice = prices[signal.asset];
        if (!currentPrice) return signal;
        return updateSignalStatus(signal, currentPrice);
      })
    );
  }, [prices, signals]);

  // Cleanup
  useEffect(() => {
    return () => {
      signals.forEach(s => unsubscribe(s.asset));
    };
  }, [signals, unsubscribe]);

  return { signals, isLoading, error };
}