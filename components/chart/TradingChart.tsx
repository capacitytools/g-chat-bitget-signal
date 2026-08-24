"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, HistogramData, Time } from "lightweight-charts";
import { ChartControls } from "./ChartControls";
import { Loader2 } from "lucide-react";

interface TradingChartProps {
  symbol: string;
  marketType: "SPOT" | "FUTURES";
}

export function TradingChart({ symbol, marketType }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  const [interval, setInterval] = useState("15m");
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // 1. Initialize Chart & Handle Resize
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1f2937' : '#ffffff' },
        textColor: isDarkMode ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#374151' : '#f3f4f6' },
        horzLines: { color: isDarkMode ? '#374151' : '#f3f4f6' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      },
      timeScale: {
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#10b981',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // Set to empty string to overlay on main scale
    });
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }, // Push volume to bottom 20%
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Responsive resizing for mobile
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [isDark]); // Re-run if dark mode changes (handled by theme toggle in Phase 1)

  // 2. Fetch and Update Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/klines?symbol=${symbol}&marketType=${marketType}&interval=${interval}`);
        const json = await res.json();
        if (json.success && json.data.length > 0 && candleSeriesRef.current && volumeSeriesRef.current) {
          const candleData: CandlestickData[] = json.data.map((d: any) => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));

          const volumeData: HistogramData[] = json.data.map((d: any) => ({
            time: d.time as Time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
          }));

          candleSeriesRef.current.setData(candleData);
          volumeSeriesRef.current.setData(volumeData);
          
          chartRef.current?.timeScale().fitContent();
        }
      } catch (error) {
        console.error("Failed to load chart data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, marketType, interval]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      {/* Header / Controls */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{symbol}</h3>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {marketType}
          </span>
        </div>
        <ChartControls activeInterval={interval} onIntervalChange={setInterval} />
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-64 sm:h-80">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        )}        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}