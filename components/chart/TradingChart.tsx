"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";

interface TradingChartProps {
  candles: CandlestickData[];
  ema9?: LineData[];
  ema21?: LineData[];
  ema50?: LineData[];
}

export function TradingChart({ candles, ema9, ema21, ema50 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // 1. Initialize Chart
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

  // 2. Update Data
  useEffect(() => {
    if (candles.length > 0 && candleSeriesRef.current) {
      candleSeriesRef.current.setData(candles);
      ema9SeriesRef.current?.setData(ema9 || []);
      ema21SeriesRef.current?.setData(ema21 || []);
      ema50SeriesRef.current?.setData(ema50 || []);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles, ema9, ema21, ema50]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}