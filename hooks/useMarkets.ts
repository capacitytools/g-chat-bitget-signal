"use client";

import { useState, useEffect, useCallback } from 'react';
import { MarketData, DataStatus, MarketsResponse } from '@/types/market';

const STALE_THRESHOLD_MS = 30000; // 30 seconds

export function useMarkets(filter: 'ALL' | 'SPOT' | 'FUTURES' = 'ALL') {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [status, setStatus] = useState<DataStatus>('LOADING');
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchMarkets = useCallback(async () => {
    setStatus('LOADING');
    try {
      const res = await fetch(`/api/markets?type=${filter}`);
      const json: MarketsResponse = await res.json();

      if (json.success) {
        setMarkets(json.data);
        setLastUpdated(json.timestamp);
        setStatus('LIVE');
      } else {
        setStatus('OFFLINE');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setStatus('OFFLINE');
    }
  }, [filter]);

  useEffect(() => {
    fetchMarkets();
    
    // Check for staleness every 5 seconds
    const interval = setInterval(() => {
      if (lastUpdated && Date.now() - lastUpdated > STALE_THRESHOLD_MS) {
        setStatus('STALE');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchMarkets, lastUpdated]);

  return { markets, status, refetch: fetchMarkets };
}