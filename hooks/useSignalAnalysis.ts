"use client";

import { useState, useEffect } from 'react';
import { RawCandle, calculateEMA, calculateRSI } from '@/lib/indicators';
import { evaluateSignal, SignalResult } from '@/lib/signalEngine';
import { CandlestickData, LineData, Time } from 'lightweight-charts';

export function useSignalAnalysis(symbol: string, marketType: 'SPOT' | 'FUTURES', interval: string) {
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [ema9, setEma9] = useState<LineData[]>([]);
  const [ema21, setEma21] = useState<LineData[]>([]);
  const [ema50, setEma50] = useState<LineData[]>([]);
  const [analysis, setAnalysis] = useState<SignalResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/klines?symbol=${symbol}&marketType=${marketType}&interval=${interval}`);
        const json = await res.json();

        if (json.success && json.data && json.data.length > 50) {
          const rawCandles: RawCandle[] = json.data;
          
          const chartCandles: CandlestickData[] = rawCandles.map(d => ({
            time: d.time as Time, 
            open: d.open, 
            high: d.high, 
            low: d.low, 
            close: d.close
          }));
          setCandles(chartCandles);

          const closes = rawCandles.map(c => c.close);
          const calcEma9 = calculateEMA(closes, 9);
          const calcEma21 = calculateEMA(closes, 21);
          const calcEma50 = calculateEMA(closes, 50);
          const calcRsi = calculateRSI(closes, 14);

          const formatLine = (data: (number | null)[]): LineData[] => 
            data.map((val, i) => {
              if (val !== null && !isNaN(val)) {
                return { time: rawCandles[i].time as Time, value: val };
              }
              return null;
            })
            .filter((v): v is LineData => v !== null);

          setEma9(formatLine(calcEma9));
          setEma21(formatLine(calcEma21));
          setEma50(formatLine(calcEma50));

          const signalResult = evaluateSignal(rawCandles, calcEma9, calcEma21, calcEma50, calcRsi);
          setAnalysis(signalResult);
        } else {
          setError(json.error || 'Not enough data to calculate indicators.');
          setAnalysis({
            score: 0,
            direction: 'WAIT',
            trend: 'Unknown',
            momentum: 'Unknown',
            reasons: ['Unable to fetch sufficient market data.'],
            invalidation: 'N/A'
          });
        }
      } catch (err) {
        console.error("Analysis error:", err);
        setError('Network error while fetching data.');
        setAnalysis({
          score: 0,
          direction: 'WAIT',
          trend: 'Unknown',
          momentum: 'Unknown',
          reasons: ['Network connection failed.'],
          invalidation: 'N/A'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, marketType, interval]);

  return { candles, ema9, ema21, ema50, analysis, isLoading, error };
}