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

  if (!lastEma9 || !lastEma21 || !lastEma50 || !lastRsi) {
    return { 
      score: 0, direction: 'WAIT', trend: 'Unknown', momentum: 'Unknown', 
      reasons: ['Insufficient data for indicators'], invalidation: 'N/A',
      entry: 0, sl: 0, tp1: 0, tp2: 0, tp3: 0 
    };
  }

  // We will calculate a Bullish Score and a Bearish Score separately
  let longScore = 0;
  let shortScore = 0;
  const reasons: string[] = [];
  let trend = "Neutral";
  let momentum = "Neutral";

  // --- TREND ANALYSIS ---
  if (last.close > lastEma50) { 
    longScore += 20; 
    trend = "Bullish"; 
  } else { 
    shortScore += 20;
    trend = "Bearish"; 
  }

  if (lastEma9 > lastEma21) { 
    longScore += 20; 
    reasons.push("EMA 9 > EMA 21 (Bullish cross)"); 
  } else { 
    shortScore += 20; 
    reasons.push("EMA 9 < EMA 21 (Bearish cross)"); 
  }

  // --- MOMENTUM (RSI) ---
  if (lastRsi > 50 && lastRsi < 70) { 
    longScore += 20; 
    momentum = "Strong Bullish"; 
  } else if (lastRsi < 50 && lastRsi > 30) { 
    shortScore += 20; 
    momentum = "Strong Bearish"; 
  } else if (lastRsi >= 70) { 
    shortScore += 10; // Potential reversal short
    reasons.push(`RSI Overbought (${lastRsi.toFixed(1)}) - Reversal risk`);
  } else if (lastRsi <= 30) { 
    longScore += 10; // Potential reversal long
    reasons.push(`RSI Oversold (${lastRsi.toFixed(1)}) - Bounce risk`);
  }

  // --- VOLUME & CANDLE STRUCTURE ---
  const avgVol = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
  const isBullishCandle = last.close > last.open;
  
  if (last.volume > avgVol * 1.2) {
    if (isBullishCandle) {
      longScore += 20;
      reasons.push("High volume on Green candle");
    } else {
      shortScore += 20;
      reasons.push("High volume on Red candle");
    }
  } else {
    reasons.push("Volume is average/low");
  }

  // --- DETERMINE DIRECTION & FINAL SCORE ---
  let direction: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
  let finalScore = 0;

  if (longScore > shortScore && longScore >= 60) {
    direction = 'LONG';
    finalScore = longScore;
  } else if (shortScore > longScore && shortScore >= 60) {
    direction = 'SHORT';
    finalScore = shortScore;
  } else {
    direction = 'WAIT';
    finalScore = Math.max(longScore, shortScore); // Show the highest potential, but advise wait
    reasons.push("Conflicting signals. Market is choppy.");
  }

  // Clamp score to 100
  finalScore = Math.min(100, finalScore);

  // --- CALCULATE LEVELS ---
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
  } else {
    // If WAIT, just use recent high/low for display
    sl = Math.min(...recentLows);
    tp1 = Math.max(...recentHighs);
  }

  return {
    score: finalScore,
    direction, trend, momentum, reasons, invalidation,
    entry, sl, tp1, tp2, tp3
  };
}
