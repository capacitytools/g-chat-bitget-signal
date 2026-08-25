"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PaperTrade {
  id: string;
  asset: string;
  marketType: 'SPOT' | 'FUTURES';
  direction: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp: number;
  positionSize: number;
  leverage: number;
  status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  timestamp: number;
  pnl?: number;
}

interface TradingContextType {
  balance: number;
  riskPercent: number;
  trades: PaperTrade[];
  setBalance: (b: number) => void;
  setRiskPercent: (r: number) => void;
  executeTrade: (trade: Omit<PaperTrade, 'id' | 'status' | 'timestamp' | 'pnl'>) => void;
  closeTrade: (id: string, exitPrice: number) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
  const [balance, setBalanceState] = useState(100);
  const [riskPercent, setRiskPercentState] = useState(0.5);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBalance = localStorage.getItem('gchat_balance');
    const savedRisk = localStorage.getItem('gchat_risk');
    const savedTrades = localStorage.getItem('gchat_trades');

    if (savedBalance) setBalanceState(parseFloat(savedBalance));
    if (savedRisk) setRiskPercentState(parseFloat(savedRisk));
    if (savedTrades) setTrades(JSON.parse(savedTrades));
    
    setIsLoaded(true);
  }, []);
  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('gchat_balance', balance.toString());
    localStorage.setItem('gchat_risk', riskPercent.toString());
    localStorage.setItem('gchat_trades', JSON.stringify(trades));
  }, [balance, riskPercent, trades, isLoaded]);

  const setBalance = (b: number) => setBalanceState(b);
  const setRiskPercent = (r: number) => setRiskPercentState(r);

  const executeTrade = (tradeData: Omit<PaperTrade, 'id' | 'status' | 'timestamp' | 'pnl'>) => {
    const newTrade: PaperTrade = {
      ...tradeData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'OPEN',
      timestamp: Date.now()
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const closeTrade = (id: string, exitPrice: number) => {
    setTrades(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      let pnl = 0;
      let status: 'WIN' | 'LOSS' | 'BREAKEVEN' = 'BREAKEVEN';

      if (t.direction === 'LONG') {
        pnl = (exitPrice - t.entry) * (t.positionSize / t.entry);
      } else {
        pnl = (t.entry - exitPrice) * (t.positionSize / t.entry);
      }

      // Apply leverage to PnL
      pnl = pnl * t.leverage;

      if (pnl > 0) status = 'WIN';
      else if (pnl < 0) status = 'LOSS';

      return { ...t, status, pnl };
    }));
  };

  return (
    <TradingContext.Provider value={{ balance, riskPercent, trades, setBalance, setRiskPercent, executeTrade, closeTrade }}>
      {children}
    </TradingContext.Provider>
  );
}
export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
}