import { PaperTrade } from '@/context/TradingContext';

export interface AnalyticsResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number; // Percentage
  netPnl: number;
  bestAsset: string;
  worstAsset: string;
}

export function calculateAnalytics(trades: PaperTrade[], initialBalance: number = 100): AnalyticsResult {
  const closedTrades = trades.filter(t => t.status !== 'OPEN');
  
  if (closedTrades.length === 0) {
    return {
      totalTrades: 0, wins: 0, losses: 0, winRate: 0,
      avgWin: 0, avgLoss: 0, profitFactor: 0, maxDrawdown: 0,
      netPnl: 0, bestAsset: 'N/A', worstAsset: 'N/A'
    };
  }

  const wins = closedTrades.filter(t => t.status === 'WIN');
  const losses = closedTrades.filter(t => t.status === 'LOSS');
  const winRate = (wins.length / closedTrades.length) * 100;

  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const netPnl = grossProfit - grossLoss;

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Calculate Max Drawdown
  let peakBalance = initialBalance;
  let currentBalance = initialBalance;
  let maxDrawdown = 0;

  // Sort trades chronologically
  const sortedTrades = [...closedTrades].sort((a, b) => a.timestamp - b.timestamp);

  for (const trade of sortedTrades) {
    currentBalance += (trade.pnl || 0);
    if (currentBalance > peakBalance) {
      peakBalance = currentBalance;
    }
    const drawdown = ((peakBalance - currentBalance) / peakBalance) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Best/Worst Asset
  const assetPnl: Record<string, number> = {};
  closedTrades.forEach(t => {
    assetPnl[t.asset] = (assetPnl[t.asset] || 0) + (t.pnl || 0);
  });

  const assets = Object.entries(assetPnl).sort((a, b) => b[1] - a[1]);
  const bestAsset = assets.length > 0 ? assets[0][0] : 'N/A';
  const worstAsset = assets.length > 0 ? assets[assets.length - 1][0] : 'N/A';

  return {
    totalTrades: closedTrades.length,
    wins: wins.length,
    losses: losses.length,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    maxDrawdown,
    netPnl,
    bestAsset,
    worstAsset
  };
}