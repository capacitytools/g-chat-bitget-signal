"use client";

import { useState, useEffect } from 'react';
import { FeedSignal, generateSignal, updateSignalStatus } from '@/lib/signalFeedEngine';
import { useLivePrice } from '@/context/LivePriceContext';

export function useSignalFeed() {
  const [signals, setSignals] = useState<FeedSignal[]>([]);
  const { prices, subscribe } = useLivePrice();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const generateSignals = async () => {
      setIsLoading(true);
      setDebugInfo('Fetching scanner...');
      
      try {
        const res = await fetch('/api/scanner');
        const json = await res.json();
        
        console.log('Scanner response:', json);
        setDebugInfo(`Scanner: ${json.data?.length || 0} assets found`);

        if (json.success && json.data && json.data.length > 0) {
          const newSignals: FeedSignal[] = [];

          // Try to find ANY futures assets, not just high score
          for (const asset of json.data) {
            console.log('Checking asset:', asset);
            
            if (asset.marketType === 'FUTURES') {
              const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
              const timeframe: '1m' | '3m' | '5m' = '5m'; // Default to 5m
              
              const signal = generateSignal(
                asset.symbol,
                parseFloat(asset.price),
                direction,
                timeframe,
                Math.max(60, asset.score || 70) // Ensure minimum score
              );

              newSignals.push(signal);
              subscribe(asset.symbol, 'FUTURES');
              
              if (newSignals.length >= 3) break; // Get first 3
            }
          }
          // If no futures found, try SPOT
          if (newSignals.length === 0) {
            setDebugInfo('No FUTURES found, trying SPOT...');
            for (const asset of json.data) {
              if (asset.marketType === 'SPOT' && asset.score >= 50) {
                const direction = asset.trend === 'Bullish' ? 'LONG' : 'SHORT';
                
                const signal = generateSignal(
                  asset.symbol,
                  parseFloat(asset.price),
                  direction,
                  '5m',
                  Math.max(60, asset.score || 70)
                );

                newSignals.push(signal);
                subscribe(asset.symbol, 'SPOT');
                
                if (newSignals.length >= 3) break;
              }
            }
          }

          if (newSignals.length > 0) {
            setSignals(newSignals);
            setDebugInfo(`Generated ${newSignals.length} signals!`);
          } else {
            setDebugInfo('No suitable assets found');
          }
        } else {
          setDebugInfo('Scanner failed: ' + (json.error || 'Unknown error'));
        }
      } catch (e) {
        console.error('Signal generation error:', e);
        setDebugInfo('Error: ' + (e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    generateSignals();
  }, [subscribe]);

  // Update signals with live prices
  useEffect(() => {
    if (Object.keys(prices).length === 0 || signals.length === 0) return;

    setSignals(prevSignals => 
      prevSignals.map(signal => {
        const currentPrice = prices[signal.asset];        if (!currentPrice) return signal;
        return updateSignalStatus(signal, currentPrice);
      })
    );
  }, [prices, signals]);

  return { signals, isLoading, debugInfo };
}