"use client";

import { PaperTrade } from '@/context/TradingContext';

interface EquityCurveProps {
  trades: PaperTrade[];
  initialBalance: number;
}

export function EquityCurve({ trades, initialBalance }: EquityCurveProps) {
  const closedTrades = trades.filter(t => t.status !== 'OPEN').sort((a, b) => a.timestamp - b.timestamp);
  
  if (closedTrades.length === 0) return null;

  // Calculate data points
  let currentBalance = initialBalance;
  const dataPoints = [currentBalance];
  
  closedTrades.forEach(t => {
    currentBalance += (t.pnl || 0);
    dataPoints.push(currentBalance);
  });

  const minVal = Math.min(...dataPoints, initialBalance);
  const maxVal = Math.max(...dataPoints, initialBalance);
  const range = maxVal - minVal || 1;

  // SVG Dimensions
  const width = 100;
  const height = 40;
  const padding = 2;

  // Generate polyline points
  const points = dataPoints.map((val, i) => {
    const x = padding + (i / (dataPoints.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const isProfitable = currentBalance >= initialBalance;
  const color = isProfitable ? '#10b981' : '#ef4444'; // Green or Red

  return (
    <div className="w-full h-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Equity Curve</h4>
        <span className={`text-sm font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
          ${currentBalance.toFixed(2)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}