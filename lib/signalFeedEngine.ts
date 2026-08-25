export interface FeedSignal {
  id: string;
  asset: string;
  marketType: 'FUTURES';
  direction: 'LONG' | 'SHORT';
  entry: number;
  tp: number;
  sl: number;
  timeframe: '1m' | '3m' | '5m';
  signalTime: number;
  expireTime: number;
  confidence: number;
  status: 'FRESH' | 'ACTIVE' | 'WIN' | 'LOSS';
  currentPrice?: number;
  pnl?: number;
}

export function generateSignal(
  asset: string,
  entry: number,
  direction: 'LONG' | 'SHORT',
  timeframe: '1m' | '3m' | '5m',
  confidence: number
): FeedSignal {
  const now = Date.now();
  const timeframeMs = timeframe === '1m' ? 60000 : timeframe === '3m' ? 180000 : 300000;
  
  const riskPercent = 0.005;
  const rr = 1.5;
  const riskDistance = entry * riskPercent;
  
  const sl = direction === 'LONG' ? entry - riskDistance : entry + riskDistance;
  const tp = direction === 'LONG' ? entry + (riskDistance * rr) : entry - (riskDistance * rr);

  return {
    id: `${asset}-${now}-${Math.random().toString(36).substr(2, 5)}`,
    asset,
    marketType: 'FUTURES',
    direction,
    entry,
    tp,
    sl,
    timeframe,
    signalTime: now,
    expireTime: now + timeframeMs,
    confidence,
    status: 'FRESH'
  };
}
export function updateSignalStatus(signal: FeedSignal, currentPrice: number): FeedSignal {
  const updated: FeedSignal = { ...signal, currentPrice };

  if (Date.now() > signal.expireTime) {
    if (signal.direction === 'LONG') {
      if (currentPrice >= signal.tp) {
        updated.status = 'WIN';
        updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
      } else if (currentPrice <= signal.sl) {
        updated.status = 'LOSS';
        updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
      } else {
        if (currentPrice > signal.entry) {
          updated.status = 'WIN';
          updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
        } else {
          updated.status = 'LOSS';
          updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
        }
      }
    } else {
      if (currentPrice <= signal.tp) {
        updated.status = 'WIN';
        updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
      } else if (currentPrice >= signal.sl) {
        updated.status = 'LOSS';
        updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
      } else {
        if (currentPrice < signal.entry) {
          updated.status = 'WIN';
          updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
        } else {
          updated.status = 'LOSS';
          updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
        }
      }
    }
    return updated;
  }

  if (signal.direction === 'LONG') {
    if (currentPrice >= signal.tp || currentPrice <= signal.sl) {
      if (currentPrice >= signal.tp) {
        updated.status = 'WIN';
        updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
      } else {
        updated.status = 'LOSS';
        updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
      }
    } else {      updated.status = 'ACTIVE';
      updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
    }
  } else {
    if (currentPrice <= signal.tp || currentPrice >= signal.sl) {
      if (currentPrice <= signal.tp) {
        updated.status = 'WIN';
        updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
      } else {
        updated.status = 'LOSS';
        updated.pnl = ((currentPrice - signal.entry) / signal.entry) * 100;
      }
    } else {
      updated.status = 'ACTIVE';
      updated.pnl = ((signal.entry - currentPrice) / signal.entry) * 100;
    }
  }

  return updated;
}