"use client";

import { useState, useEffect } from 'react';
import { RawCandle } from '@/lib/indicators';
import { analyzeTimeframe, MTFResult } from '@/lib/mtfEngine';

export function useMTFAnalysis(symbol: string, marketType: 'SPOT' | 'FUTURES') {
  const [mtfData, setMtfData] = useState<MTFResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllTimeframes = async () => {
      setIsLoading(true);
      const timeframes = ['1m', '5m', '15m', '1h'];
      
      try {
        const promises = timeframes.map(async (tf) => {
          const res = await fetch(`/api/klines?symbol=${symbol}&marketType=${marketType}&interval=${tf}`);
          const json = await res.json();
          if (json.success && json.data) {
            return analyzeTimeframe(json.data as RawCandle[], tf);
          }
          return { timeframe: tf, trend: 'NEUTRAL' as const, price: 0, ema21: 0 };
        });

        const results = await Promise.all(promises);
        setMtfData(results);
      } catch (error) {
        console.error('MTF Fetch Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchAllTimeframes();
    }
  }, [symbol, marketType]);

  return { mtfData, isLoading };
}