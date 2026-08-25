import { RawCandle } from './indicators';

export interface SignalResult {
  score: number;
  direction: 'LONG' | 'SHORT' | 'WAIT';
  trend: string;
  momentum: string;
  reasons: string[];
  invalidation: string;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
}

export function evaluateSignal(
  candles: RawCandle[],
  ema9: (number | null)[],
  ema21: (number | null)[],
  ema50: (number | null)[],
  rsi: (number | null)[]
): SignalResult {
  const last = candles[candles.length - 1];
  const lastEma9 = ema9[ema9.length - 1];
  const lastEma21 = ema21[ema21.length - 1];
  const lastEma50 = ema50[ema50.length - 1];
  const lastRsi = rsi[rsi.length - 1];

  let score = 0;
  const reasons: string[] = [];
  let trend = "Neutral";
  let momentum = "Neutral";

  if (!lastEma9 || !lastEma21 || !lastEma50 || !lastRsi) {
    return { 
      score: 0, direction: 'WAIT', trend, momentum, 
      reasons: ['Insufficient data for indicators'], invalidation: 'N/A',
      entry: 0, sl: 0, tp1: 0, tp2: 0, tp3: 0 
    };
  }

  // 1. Trend Analysis (Max 40 pts)
  if (last.close > lastEma50) { score += 10; reasons.push("Price above EMA 50"); trend = "Bullish"; }
  else { reasons.push("Price below EMA 50"); trend = "Bearish"; }

  if (lastEma50 > (ema50[ema50.length - 10] || 0)) { score += 10; reasons.push("EMA 50 trending up"); }
  
  if (lastEma9 > lastEma21) { score += 20; reasons.push("EMA 9 > EMA 21 (Short-term bullish)"); }
  else { score -= 10; reasons.push("EMA 9 < EMA 21 (Short-term bearish)"); trend = "Bearish"; }

  // 2. Momentum Analysis (Max 30 pts)
  if (lastRsi > 50 && lastRsi < 70) { score += 15; reasons.push(`RSI bullish (${lastRsi.toFixed(1)})`); momentum = "Strong"; }
  else if (lastRsi >= 70) { score -= 10; reasons.push(`RSI overbought (${lastRsi.toFixed(1)})`); momentum = "Exhausted"; }
  else if (lastRsi < 50 && lastRsi > 30) { score += 5; reasons.push(`RSI bearish (${lastRsi.toFixed(1)})`); momentum = "Weak"; }
  else { score -= 15; reasons.push(`RSI oversold (${lastRsi.toFixed(1)})`); momentum = "Exhausted"; }

  // 3. Volume & Structure (Max 30 pts)
  const avgVol = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
  if (last.volume > avgVol * 1.2) { score += 15; reasons.push("Volume expansion"); }
  
  if (last.close > last.open) { score += 15; reasons.push("Bullish candle close"); }
  else { score -= 5; reasons.push("Bearish candle close"); }

  // Determine Direction
  let direction: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
  if (score >= 70) direction = 'LONG';
  else if (score <= 30) direction = 'SHORT';

  // Calculate Levels (Simple Swing Low/High + RR)
  const recentLows = candles.slice(-10).map(c => c.low);
  const recentHighs = candles.slice(-10).map(c => c.high);
  const entry = last.close;
  
  let sl = 0, tp1 = 0, tp2 = 0, tp3 = 0, invalidation = 'N/A';

  if (direction === 'LONG') {
    sl = Math.min(...recentLows);
    const riskDistance = entry - sl;
    tp1 = entry + (riskDistance * 1.5);
    tp2 = entry + (riskDistance * 2.5);
    tp3 = entry + (riskDistance * 4.0);
    invalidation = sl.toFixed(2);
  } else if (direction === 'SHORT') {
    sl = Math.max(...recentHighs);
    const riskDistance = sl - entry;
    tp1 = entry - (riskDistance * 1.5);
    tp2 = entry - (riskDistance * 2.5);
    tp3 = entry - (riskDistance * 4.0);
    invalidation = sl.toFixed(2);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    direction, trend, momentum, reasons, invalidation,
    entry, sl, tp1, tp2, tp3
  };
}