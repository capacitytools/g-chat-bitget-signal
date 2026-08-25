import { MTFResult } from './mtfEngine';
import { SignalResult } from './signalEngine';

export function generateBriefing(mtfData: MTFResult[], signal: SignalResult, asset: string): string {
  if (!signal || signal.direction === 'WAIT') {
    return `${asset} is currently in a choppy or unclear market structure. The signal engine recommends waiting. Patience is a trading strategy.`;
  }

  const bullishCount = mtfData.filter(m => m.trend === 'BULLISH').length;
  const bearishCount = mtfData.filter(m => m.trend === 'BEARISH').length;
  const direction = signal.direction;

  let summary = `G-Chat Analysis for ${asset}: `;

  if (direction === 'LONG') {
    if (bullishCount >= 3) {
      summary += `Strong bullish alignment across multiple timeframes. Momentum is in your favor for a long setup. `;
    } else {
      summary += `Potential long setup detected, but higher timeframes are mixed. Proceed with caution and tight risk management. `;
    }
  } else if (direction === 'SHORT') {
    if (bearishCount >= 3) {
      summary += `Strong bearish alignment. The market structure is favoring sellers. `;
    } else {
      summary += `Potential short setup detected, but be careful of a higher timeframe trend reversal. `;
    }
  }

  summary += `Key invalidation level is at ${signal.invalidation}. If price closes beyond this level, the setup is void.`;

  return summary;
}