"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";
import { useLivePrice } from "@/context/LivePriceContext";

interface TradingChartProps {
  candles: CandlestickData[];
  ema9?: LineData[];
  ema21?: LineData[];
  ema50?: LineData[];
  symbol?: string;
  marketType?: 'SPOT' | 'FUTURES';
}

export function TradingChart({ candles, ema9, ema21, ema50, symbol, marketType }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [currentCandle, setCurrentCandle] = useState<CandlestickData | null>(null);

  const { subscribe, unsubscribe, prices } = useLivePrice();

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDarkMode = document.documentElement.classList.contains('dark');

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1f2937' : '#ffffff' },
        textColor: isDarkMode ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#374151' : '#f3f4f6' },
        horzLines: { color: isDarkMode ? '#374151' : '#f3f4f6' },
      },
      rightPriceScale: { borderColor: isDarkMode ? '#374151' : '#e5e7eb' },
      timeScale: { borderColor: isDarkMode ? '#374151' : '#e5e7eb', timeVisible: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#10b981', downColor: '#ef4444',
      borderDownColor: '#ef4444', borderUpColor: '#10b981',
      wickDownColor: '#ef4444', wickUpColor: '#10b981',
    });

    ema9SeriesRef.current = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    ema21SeriesRef.current = chart.addLineSeries({ color: '#3b82f6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    ema50SeriesRef.current = chart.addLineSeries({ color: '#8b5cf6', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update initial data
  useEffect(() => {
    if (candles.length > 0 && candleSeriesRef.current) {
      candleSeriesRef.current.setData(candles);
      if (ema9 && ema9SeriesRef.current) ema9SeriesRef.current.setData(ema9);
      if (ema21 && ema21SeriesRef.current) ema21SeriesRef.current.setData(ema21);
      if (ema50 && ema50SeriesRef.current) ema50SeriesRef.current.setData(ema50);
      chartRef.current?.timeScale().fitContent();
      
      // Set current candle to the last one
      setCurrentCandle(candles[candles.length - 1]);
    }
  }, [candles, ema9, ema21, ema50]);

  // Subscribe to live prices
  useEffect(() => {
    if (symbol && marketType) {
      subscribe(symbol, marketType);
    }
    return () => {
      if (symbol) {
        unsubscribe(symbol);
      }
    };
  }, [symbol, marketType, subscribe, unsubscribe]);

  // Update chart with live price
  useEffect(() => {
    if (symbol && prices[symbol] && candleSeriesRef.current && currentCandle) {
      const livePrice = prices[symbol];
      const now = Math.floor(Date.now() / 1000);
      
      // Update the current candle in real-time
      const updatedCandle = {
        ...currentCandle,
        close: livePrice,
        high: Math.max(currentCandle.high, livePrice),
        low: Math.min(currentCandle.low, livePrice)
      };
      
      candleSeriesRef.current.update(updatedCandle);
      setCurrentCandle(updatedCandle);
    }
  }, [prices, symbol, currentCandle]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
