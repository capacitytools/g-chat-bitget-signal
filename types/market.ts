export type MarketType = 'SPOT' | 'FUTURES';
export type DataStatus = 'LIVE' | 'STALE' | 'OFFLINE' | 'LOADING';

export interface MarketData {
  symbol: string;
  price: string;
  change24h: string; // Percentage as a decimal string e.g., "0.05" for 5%
  volume24h: string; // USDT volume
  marketType: MarketType;
}

export interface MarketsResponse {
  success: boolean;
  data: MarketData[];
  timestamp: number;
  error?: string;
}