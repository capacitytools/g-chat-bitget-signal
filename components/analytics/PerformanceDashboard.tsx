"use client";

import { PaperTrade } from '@/context/TradingContext';
import { calculateAnalytics } from '@/lib/analyticsEngine';
import { EquityCurve } from './EquityCurve';
import { TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';

interface PerformanceDashboardProps {
  trades: PaperTrade[];
}

export function PerformanceDashboard({ trades }: PerformanceDashboardProps) {
  const stats = calculateAnalytics(trades, 100); // Assuming 100 starting balance

  if (stats.totalTrades === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
        <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">No Performance Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Execute some paper trades to see your analytics.</p>
      </div>
    );
  }

  const MetricCard = ({ label, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {subValue && <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <EquityCurve trades={trades} initialBalance={100} />
      
      <div className="grid grid-cols-2 gap-3">
        <MetricCard 
          label="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`} 
          subValue={`${stats.wins}W / ${stats.losses}L`}
          icon={Target} 
          color="text-primary-500" 
        />
        <MetricCard 
          label="Net P/L" 
          value={`${stats.netPnl >= 0 ? '+' : ''}$${stats.netPnl.toFixed(2)}`} 
          subValue={`From $100.00`}
          icon={stats.netPnl >= 0 ? TrendingUp : TrendingDown} 
          color={stats.netPnl >= 0 ? "text-green-500" : "text-red-500"} 
        />
        <MetricCard 
          label="Profit Factor" 
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} 
          subValue="Gross Profit / Loss"
          icon={TrendingUp} 
          color="text-blue-500" 
        />
        <MetricCard 
          label="Max Drawdown" 
          value={`${stats.maxDrawdown.toFixed(1)}%`} 
          subValue="Peak to Trough"
          icon={ShieldAlert} 
          color="text-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Avg Win</span>
          <p className="text-base font-bold text-green-500 mt-1">+${stats.avgWin.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Avg Loss</span>
          <p className="text-base font-bold text-red-500 mt-1">-${stats.avgLoss.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Asset Performance</h4>
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Best</p>
            <p className="font-bold text-gray-900 dark:text-white">{stats.bestAsset}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 dark:text-gray-400 text-xs">Worst</p>
            <p className="font-bold text-gray-900 dark:text-white">{stats.worstAsset}</p>
          </div>
        </div>
      </div>
    </div>
  );
}