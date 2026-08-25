"use client";

import { useState } from "react";
import { Search, RefreshCw, AlertTriangle } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarketCard } from "./MarketCard";
import { ScannerList } from "./ScannerList";

type TabType = 'TOP 10' | 'ALL' | 'SPOT' | 'FUTURES';

export function MarketList() {
  const [activeTab, setActiveTab] = useState<TabType>('TOP 10');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Only fetch markets if we are not on the TOP 10 tab to save resources
  const { markets, status, refetch } = useMarkets(activeTab === 'TOP 10' ? 'ALL' : activeTab);

  const filteredMarkets = useState(() => {
    if (!searchQuery) return markets;
    return markets.filter(m => m.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  })[0]; // Simple state derivation

  const tabs: TabType[] = ['TOP 10', 'ALL', 'SPOT', 'FUTURES'];

  return (
    <div className="p-4 space-y-4">
      {/* Header with Search and Status */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets (BTC, ETH...)"
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {activeTab !== 'TOP 10' && <StatusBadge status={status} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(""); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab                ? "bg-primary-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
        
        {activeTab !== 'TOP 10' && (
          <button 
            onClick={() => refetch()}
            className="ml-auto p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'LOADING' ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-3">
        {activeTab === 'TOP 10' ? (
          <ScannerList />
        ) : status === 'OFFLINE' && markets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Connection Lost</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Unable to fetch market data.</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg active:scale-95 transition-transform"
            >
              Retry Connection
            </button>
          </div>
        ) : status === 'LOADING' && markets.length === 0 ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No markets found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <MarketCard key={`${market.marketType}-${market.symbol}`} market={market} />          ))
        )}
      </div>
    </div>
  );
}