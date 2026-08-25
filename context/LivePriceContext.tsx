"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBitgetWebSocket } from '@/hooks/useBitgetWebSocket';

interface LivePriceContextType {
  prices: Record<string, number>;
  subscribe: (symbol: string, marketType: 'SPOT' | 'FUTURES') => void;
  unsubscribe: (symbol: string) => void;
}

const LivePriceContext = createContext<LivePriceContextType | undefined>(undefined);

export function LivePriceProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  const [prices, setPrices] = useState<Record<string, number>>({});

  const { connect, disconnect } = useBitgetWebSocket({
    onMessage: (symbol, price) => {
      setPrices(prev => ({ ...prev, [symbol]: price }));
    },
    subscriptions: Array.from(subscriptions)
  });

  useEffect(() => {
    if (subscriptions.size > 0) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [subscriptions]);

  const subscribe = (symbol: string, marketType: 'SPOT' | 'FUTURES') => {
    const key = `${symbol}:${marketType}`;
    setSubscriptions(prev => new Set(prev).add(key));
  };

  const unsubscribe = (symbol: string) => {
    setSubscriptions(prev => {
      const next = new Set(prev);
      // Remove all subscriptions for this symbol
      Array.from(next).forEach(key => {
        if (key.startsWith(`${symbol}:`)) {
          next.delete(key);
        }
      });
      return next;
    });
  };

  return (
    <LivePriceContext.Provider value={{ prices, subscribe, unsubscribe }}>
      {children}
    </LivePriceContext.Provider>
  );
}

export function useLivePrice() {
  const context = useContext(LivePriceContext);
  if (!context) throw new Error('useLivePrice must be used within a LivePriceProvider');
  return context;
}