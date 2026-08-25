import { RawCandle, calculateEMA } from './indicators';

export type TimeframeTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface MTFResult {
  timeframe: string;
  trend: TimeframeTrend;
  price: number;
  ema21: number;
}

export function analyzeTimeframe(candles: RawCandle[], timeframe: string): MTFResult {
  if (candles.length < 25) {
    return { timeframe, trend: 'NEUTRAL', price: 0, ema21: 0 };
  }

  const closes = candles.map(c => c.close);
  const ema21Array = calculateEMA(closes, 21);
  const lastPrice = closes[closes.length - 1];
  const lastEma21 = ema21Array[ema21Array.length - 1] || 0;

  let trend: TimeframeTrend = 'NEUTRAL';
  
  // Simple but effective trend logic: Price vs EMA 21
  if (lastPrice > lastEma21 * 1.002) { // 0.2% buffer to avoid chop
    trend = 'BULLISH';
  } else if (lastPrice < lastEma21 * 0.998) {
    trend = 'BEARISH';
  }

  return {
    timeframe,
    trend,
    price: lastPrice,
    ema21: lastEma21
  };
}