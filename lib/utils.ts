import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
}

export function formatSymbol(symbol: string): string {
  // Convert BTCUSDT to BTC/USDT
  if (symbol.includes('/')) return symbol;
  const match = symbol.match(/^(.+?)(USDT|BTC|ETH|USDC)$/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return symbol;
}