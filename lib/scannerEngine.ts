import { RawCandle, calculateEMA, calculateRSI } from './indicators';

export interface ScannerResult {
  symbol: string;
  marketType: 'SPOT' | 'FUTURES';
  score: number;
  price: string;
  change24h: string;
  volume24h: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
}

export function quickScore(
  symbol: string,
  marketType: 'SPOT' | 'FUTURES',
  candles: RawCandle[],
  price: string,
  change24h: string,
  volume24h: string
): ScannerResult {
  if (candles.length < 50) {
    return { symbol, marketType, score: 0, price, change24h, volume24h, trend: 'Neutral' };
  }

  const closes = candles.map(c => c.close);
  const lastPrice = closes[closes.length - 1];
  
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  
  const lastEma50 = ema50[ema50.length - 1];
  const lastRsi = rsi[rsi.length - 1];

  let score = 0;
  let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';

  // 1. Trend (40 pts)
  if (lastEma50 !== null) {
    if (lastPrice > lastEma50) {
      score += 20;
      trend = 'Bullish';
      // Check if EMA is sloping up
      const prevEma50 = ema50[ema50.length - 10];
      if (prevEma50 !== null && lastEma50 > prevEma50) {
        score += 20;
      }
    } else {
      trend = 'Bearish';
      const prevEma50 = ema50[ema50.length - 10];
      if (prevEma50 !== null && lastEma50 < prevEma50) {
        score += 20; // Strong bearish trend gets points too, but we might filter for longs later. For now, just score strength.
      }
    }
  }

  // 2. Momentum (30 pts)
  if (lastRsi !== null) {
    if (lastRsi > 50 && lastRsi < 70) score += 30; // Healthy bullish momentum
    else if (lastRsi > 70) score += 10; // Overbought
    else if (lastRsi < 30) score += 10; // Oversold bounce potential
  }

  // 3. Volume (30 pts)
  const avgVol = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
  const lastVol = candles[candles.length - 1].volume;
  if (lastVol > avgVol * 1.5) score += 30;
  else if (lastVol > avgVol) score += 15;

  return {
    symbol,
    marketType,
    score: Math.min(100, Math.max(0, score)),
    price,
    change24h,
    volume24h,
    trend
  };
}