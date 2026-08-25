import { NextResponse } from 'next/server';

const INTERVAL_MAP: Record<string, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '1h': '1h',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const marketType = searchParams.get('marketType') || 'SPOT';
  const interval = searchParams.get('interval') || '15m';

  const granularity = INTERVAL_MAP[interval] || '15min';

  try {
    let url = '';
    
    if (marketType === 'FUTURES') {
      url = `https://api.bitget.com/api/v2/mix/market/candles?symbol=${symbol}&productType=USDT-FUTURES&granularity=${granularity}&limit=500`;
    } else {
      url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${granularity}&limit=500`;
    }

    const res = await fetch(url, {
      next: { revalidate: 30 }
    });
    
    const json = await res.json();

    if (json.code === '00000' && json.data && json.data.length > 0) {
      const formattedData = json.data.map((candle: string[]) => {
        const time = Math.floor(parseInt(candle[0]) / 1000);
        const open = parseFloat(candle[1]);
        const high = parseFloat(candle[2]);
        const low = parseFloat(candle[3]);
        const close = parseFloat(candle[4]);
        const volume = parseFloat(candle[5] || '0');

        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
          return null;
        }

        return { time, open, high, low, close, volume };
      }).filter(Boolean);

      formattedData.sort((a: any, b: any) => a.time - b.time);

      return NextResponse.json({ success: true, data: formattedData });
    }

    const errorMsg = json.msg || json.code || 'Unknown API error';
    console.error('Bitget API Error:', errorMsg);
    return NextResponse.json(
      { success: false, data: [], error: `Bitget API: ${errorMsg}` }, 
      { status: 500 }
    );

  } catch (error) {
    console.error('Klines API Proxy Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, data: [], error: `Fetch error: ${errorMessage}` }, 
      { status: 500 }
    );
  }
}