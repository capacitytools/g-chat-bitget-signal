"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScannerResult } from '@/lib/scannerEngine';

export function ScannerList() {
  const router = useRouter();
  const [data, setData] = useState<ScannerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScanner = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/scanner');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'Scanner failed');
        }
      } catch (e) {
        setError('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchScanner();
  }, []);

  const handleClick = (symbol: string, marketType: string) => {
    router.push(`/signal?asset=${symbol}&type=${marketType}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Scanning top assets...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />        <p className="text-sm font-semibold text-gray-900 dark:text-white">Scanner Unavailable</p>
        <p className="text-xs text-gray-500">{error || "No high-scoring setups found right now."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top 10 Opportunities</h3>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">Based on 1h structure</span>
      </div>
      
      {data.map((item, index) => {
        const changePercent = (parseFloat(item.change24h) * 100).toFixed(2);
        const isPositive = parseFloat(item.change24h) >= 0;
        const TrendIcon = item.trend === 'Bullish' ? TrendingUp : item.trend === 'Bearish' ? TrendingDown : Minus;
        const trendColor = item.trend === 'Bullish' ? 'text-green-500' : item.trend === 'Bearish' ? 'text-red-500' : 'text-gray-500';

        return (
          <div 
            key={`${item.marketType}-${item.symbol}`} 
            onClick={() => handleClick(item.symbol, item.marketType)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400 dark:text-gray-600 w-6">#{index + 1}</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.symbol}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.marketType} • ${parseFloat(item.price).toLocaleString(undefined, {maximumFractionDigits: 4})}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  <span className={`text-xs font-bold ${trendColor}`}>{item.score}/100</span>
                </div>
                <p className={`text-[10px] font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{changePercent}% (24h)
                </p>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full ${item.score >= 70 ? 'bg-green-500' : item.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                style={{ width: `${item.score}%` }}
              ></div>
            </div>          </div>
        );
      })}
    </div>
  );
}