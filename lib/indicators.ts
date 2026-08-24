export interface RawCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  if (data.length < period) return data.map(() => null);

  const k = 2 / (period + 1);
  let sum = 0;
  
  for (let i = 0; i < period; i++) {
    sum += data[i];
    ema.push(null);
  }
  ema[period - 1] = sum / period;
  
  for (let i = period; i < data.length; i++) {
    const val = (data[i] * k) + (ema[i - 1]! * (1 - k));
    ema.push(val);
  }
  return ema;
}

export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  if (data.length <= period) return data.map(() => null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
    rsi.push(null);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

export function calculateMACD(data: number[], fast: number = 12, slow: number = 26, signal: number = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);
  
  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      macdLine.push(emaFast[i]! - emaSlow[i]!);
    } else {
      macdLine.push(null);
    }
  }

  const validMacd = macdLine.filter(v => v !== null) as number[];
  const signalLineRaw = calculateEMA(validMacd, signal);
  
  const signalLine: (number | null)[] = [];
  let validIndex = 0;
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] !== null) {
      signalLine.push(signalLineRaw[validIndex] ?? null);
      validIndex++;
    } else {
      signalLine.push(null);
    }
  }

  return { macdLine, signalLine };
}