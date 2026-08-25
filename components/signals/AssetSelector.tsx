"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatSymbol } from "@/lib/utils";

export function AssetSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const asset = searchParams.get('asset') || 'BTCUSDT';
  const type = searchParams.get('type') || 'SPOT';

  const displayName = formatSymbol(asset);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          {type === 'SPOT' ? (
            <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{type}</p>
        </div>
      </div>
      
      <button 
        onClick={() => router.push('/markets')}
        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
      >
        Change
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}