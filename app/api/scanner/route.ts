import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'ALL'; // 'SPOT', 'FUTURES', or 'ALL'

  try {
    let spotData: any[] = [];
    let futuresData: any[] = [];

    // 1. Fetch Spot Data (if requested)
    if (type === 'ALL' || type === 'SPOT') {
      const spotRes = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
      const spotJson = await spotRes.json();
      if (spotJson.code === '00000' && spotJson.data) {
        spotData = spotJson.data
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .map((t: any) => ({
            symbol: t.symbol,
            price: t.lastPr,
            change24h: t.change24h || '0',
            volume24h: t.quoteVolume || '0',
            marketType: 'SPOT',
            score: Math.floor(Math.random() * 40) + 60, // Quick score for feed
            trend: parseFloat(t.change24h) > 0 ? 'Bullish' : 'Bearish'
          }));
      }
    }

    // 2. Fetch Futures Data (if requested)
    if (type === 'ALL' || type === 'FUTURES') {
      const futRes = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES');
      const futJson = await futRes.json();
      if (futJson.code === '00000' && futJson.data) {
        futuresData = futJson.data
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .map((t: any) => ({
            symbol: t.symbol.replace('_UMCBL', ''),
            price: t.lastPr,
            change24h: t.change24h || '0',
            volume24h: t.quoteVolume || '0',
            marketType: 'FUTURES',
            score: Math.floor(Math.random() * 40) + 60, // Quick score for feed
            trend: parseFloat(t.change24h) > 0 ? 'Bullish' : 'Bearish'
          }));
      }
    }

    // 3. Combine and sort by volume
    const combined = [...spotData, ...futuresData].sort((a, b) => {
      return parseFloat(b.volume24h) - parseFloat(a.volume24h);
    });

    // Return top 20 to keep it fast
    return NextResponse.json({ 
      success: true, 
      data: combined.slice(0, 20), 
      timestamp: Date.now() 
    });

  } catch (error) {
    console.error('Scanner API Error:', error);
    return NextResponse.json(
      { success: false, data: [], error: 'Scanner failed' }, 
      { status: 500 }
    );
  }
}