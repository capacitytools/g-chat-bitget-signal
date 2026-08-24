import { NextResponse } from 'next/server';

// Map our UI intervals to Bitget's expected granularity strings
const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1H',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const marketType = searchParams.get('marketType') || 'SPOT';
  const interval = searchParams.get('interval') || '15m';

  const granularity = INTERVAL_MAP[interval] || '15m';

  try {
    let url = '';
    if (marketType === 'FUTURES') {
      url = `https://api.bitget.com/api/v2/mix/market/candles?symbol=${symbol}&productType=USDT-FUTURES&granularity=${granularity}&limit=500`;
    } else {
      url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${granularity}&limit=500`;
    }

    const res = await fetch(url, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    const json = await res.json();

    if (json.code === '00000' && json.data) {
      // Bitget returns: [timestamp(ms), open, high, low, close, baseVol, quoteVol]
      // lightweight-charts requires time in SECONDS (Unix timestamp)
      const formattedData = json.data.map((candle: string[]) => {
        const time = Math.floor(parseInt(candle[0]) / 1000);
        const open = parseFloat(candle[1]);
        const high = parseFloat(candle[2]);
        const low = parseFloat(candle[3]);
        const close = parseFloat(candle[4]);
        const volume = parseFloat(candle[5]);

        return { time, open, high, low, close, volume };
      });

      // lightweight-charts requires data to be sorted in ascending chronological order
      formattedData.sort((a: any, b: any) => a.time - b.time);

      return NextResponse.json({ success: true, data: formattedData });
    }

    return NextResponse.json({ success: false, data: [], error: 'Invalid API response' }, { status: 500 });

  } catch (error) {
    console.error('Klines API Proxy Error:', error);
    return NextResponse.json({ success: false, data: [], error: 'Failed to fetch klines' }, { status: 500 });
  }
}