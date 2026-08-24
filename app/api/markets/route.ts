import { NextResponse } from 'next/server';
import { MarketData } from '@/types/market';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'ALL'; 

  try {
    let spotData: any[] = [];
    let futuresData: any[] = [];

    // 1. Fetch Spot Data
    if (type === 'ALL' || type === 'SPOT') {
      const spotRes = await fetch('https://api.bitget.com/api/v2/spot/market/tickers', {
        next: { revalidate: 15 } // Cache for 15 seconds to respect rate limits
      });
      const spotJson = await spotRes.json();
      if (spotJson.code === '00000' && spotJson.data) {
        spotData = spotJson.data
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .map((t: any) => ({
            symbol: t.symbol,
            price: t.lastPr,
            change24h: t.change24h || '0',
            volume24h: t.quoteVolume || '0',
            marketType: 'SPOT'
          }));
      }
    }

    // 2. Fetch Futures Data
    if (type === 'ALL' || type === 'FUTURES') {
      const futRes = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES', {
        next: { revalidate: 15 }
      });
      const futJson = await futRes.json();
      if (futJson.code === '00000' && futJson.data) {
        futuresData = futJson.data
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .map((t: any) => ({
            // Clean up symbol just in case Bitget appends _UMCBL
            symbol: t.symbol.replace('_UMCBL', ''), 
            price: t.lastPr,
            change24h: t.change24h || '0',
            volume24h: t.quoteVolume || '0',
            marketType: 'FUTURES'
          }));
      }
    }

    // 3. Combine and sort by USDT Volume (Descending)
    const combined: MarketData[] = [...spotData, ...futuresData].sort((a, b) => {
      return parseFloat(b.volume24h) - parseFloat(a.volume24h);
    });

    return NextResponse.json({ 
      success: true, 
      data: combined, 
      timestamp: Date.now() 
    });

  } catch (error) {
    console.error('Bitget API Proxy Error:', error);
    return NextResponse.json(
      { success: false, data: [], timestamp: Date.now(), error: 'Failed to fetch market data' }, 
      { status: 500 }
    );
  }
}