import { NextResponse } from 'next/server';
import { quickScore, ScannerResult } from '@/lib/scannerEngine';

export async function GET() {
  try {
    const allResults: ScannerResult[] = [];

    // 1. Fetch Top Spot Pairs by Volume
    const spotRes = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
    const spotJson = await spotRes.json();
    
    let spotPairs: any[] = [];
    if (spotJson.code === '00000' && spotJson.data) {
      spotPairs = spotJson.data
        .filter((t: any) => t.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 15); // Top 15 to stay within rate limits and timeouts
    }

    // 2. Fetch Top Futures Pairs by Volume
    const futRes = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES');
    const futJson = await futRes.json();
    
    let futPairs: any[] = [];
    if (futJson.code === '00000' && futJson.data) {
      futPairs = futJson.data
        .filter((t: any) => t.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 15);
    }

    // 3. Fetch 1h Candles and Score (Concurrently for speed)
    const fetchAndScore = async (pair: any, marketType: 'SPOT' | 'FUTURES') => {
      try {
        const symbol = pair.symbol.replace('_UMCBL', '');
        const url = marketType === 'FUTURES'
          ? `https://api.bitget.com/api/v2/mix/market/candles?symbol=${symbol}&productType=USDT-FUTURES&granularity=1h&limit=100`
          : `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=1h&limit=100`;
        
        const kRes = await fetch(url);
        const kJson = await kRes.json();

        if (kJson.code === '00000' && kJson.data) {
          const candles = kJson.data.map((c: string[]) => ({
            time: Math.floor(parseInt(c[0]) / 1000),
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
            volume: parseFloat(c[5] || '0')
          })).filter((c: any) => !isNaN(c.close)).sort((a: any, b: any) => a.time - b.time);

          return quickScore(symbol, marketType, candles, pair.lastPr, pair.change24h, pair.quoteVolume);
        }
      } catch (e) {
        console.error(`Scanner error for ${pair.symbol}:`, e);
      }
      return null;
    };

    const promises = [
      ...spotPairs.map(p => fetchAndScore(p, 'SPOT')),
      ...futPairs.map(p => fetchAndScore(p, 'FUTURES'))
    ];

    const results = await Promise.all(promises);
    
    // Filter nulls, sort by score descending, take top 10
    const top10 = results
      .filter((r): r is ScannerResult => r !== null && r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ success: true, data: top10, timestamp: Date.now() });

  } catch (error) {
    console.error('Scanner API Error:', error);
    return NextResponse.json({ success: false, data: [], error: 'Scanner failed' }, { status: 500 });
  }
}