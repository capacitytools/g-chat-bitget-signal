"use client";

import { useState, useEffect } from 'react';
import { calculateRisk, RiskInputs, RiskResults } from '@/lib/riskCalculator';
import { useTrading } from '@/context/TradingContext';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface RiskCalculatorProps {
  defaultEntry: number;
  defaultSL: number;
  defaultTP: number;
  direction: 'LONG' | 'SHORT' | 'WAIT';
  asset: string;
  marketType: 'SPOT' | 'FUTURES';
}

export function RiskCalculator({ defaultEntry, defaultSL, defaultTP, direction, asset, marketType }: RiskCalculatorProps) {
  const { balance, riskPercent, executeTrade } = useTrading();
  const [isOpen, setIsOpen] = useState(false);
  
  const [entry, setEntry] = useState(defaultEntry);
  const [sl, setSl] = useState(defaultSL);
  const [tp, setTp] = useState(defaultTP);
  const [leverage, setLeverage] = useState(marketType === 'FUTURES' ? 2 : 1);

  const [results, setResults] = useState<RiskResults | null>(null);

  useEffect(() => {
    setEntry(defaultEntry);
    setSl(defaultSL);
    setTp(defaultTP);
  }, [defaultEntry, defaultSL, defaultTP]);

  useEffect(() => {
    if (entry > 0 && sl > 0 && tp > 0) {
      const inputs: RiskInputs = { balance, riskPercent, entryPrice: entry, stopLoss: sl, takeProfit: tp, leverage };
      setResults(calculateRisk(inputs));
    }
  }, [entry, sl, tp, leverage, balance, riskPercent]);

  if (direction === 'WAIT') return null;

  return (
    <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold text-primary-600 dark:text-primary-400"
      >
        <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Risk & Position Sizing</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400">Entry</label>
              <input type="number" value={entry} onChange={e => setEntry(parseFloat(e.target.value))} className="w-full p-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400">Stop Loss</label>
              <input type="number" value={sl} onChange={e => setSl(parseFloat(e.target.value))} className="w-full p-1.5 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded text-red-700 dark:text-red-300" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400">Take Profit</label>
              <input type="number" value={tp} onChange={e => setTp(parseFloat(e.target.value))} className="w-full p-1.5 text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded text-green-700 dark:text-green-300" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">Leverage:</label>
            <input 
              type="range" min="1" max={marketType === 'FUTURES' ? 10 : 1} value={leverage} 
              onChange={e => setLeverage(parseInt(e.target.value))}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-xs font-bold w-8 text-right">{leverage}x</span>
          </div>

          {results && (
            <div className={`p-3 rounded-lg ${results.isValid ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/50' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50'}`}>
              {results.isValid ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-500">Risk:</span> <span className="font-bold">${results.riskAmount.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Pos Size:</span> <span className="font-bold">${results.positionSize.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">Margin:</span> <span className="font-bold">${results.marginRequired.toFixed(2)}</span></div>
                  <div><span className="text-gray-500">R:R:</span> <span className="font-bold text-primary-600">1:{results.riskRewardRatio.toFixed(1)}</span></div>
                </div>
              ) : (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{results.errorMessage}</p>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (results?.isValid) {
                executeTrade({ asset, marketType, direction, entry, sl, tp, positionSize: results.positionSize, leverage });
                alert('Paper Trade Executed! Check the Trades tab.');
              }            }}
            disabled={!results?.isValid}
            className="w-full py-2.5 bg-primary-500 text-white text-sm font-bold rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Execute Paper Trade
          </button>
        </div>
      )}
    </div>
  );
}