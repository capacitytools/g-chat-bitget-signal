export type ChatAction = 
  | { type: 'HELP' }
  | { type: 'SCAN'; market: 'ALL' | 'SPOT' | 'FUTURES' }
  | { type: 'ANALYZE'; asset: string; market: 'SPOT' | 'FUTURES' }
  | { type: 'UNKNOWN' };

export function parseCommand(input: string): ChatAction {
  const text = input.toLowerCase().trim();

  if (text.includes('help') || text.includes('commands')) {
    return { type: 'HELP' };
  }

  if (text.includes('scan') || text.includes('top 10') || text.includes('find')) {
    if (text.includes('fut')) return { type: 'SCAN', market: 'FUTURES' };
    if (text.includes('spot')) return { type: 'SCAN', market: 'SPOT' };
    return { type: 'SCAN', market: 'ALL' };
  }

  // Check for specific assets
  const assets = ['btc', 'eth', 'sol', 'xrp', 'doge', 'ada', 'avax', 'link', 'matic', 'dot'];
  for (const asset of assets) {
    if (text.includes(asset)) {
      // Default to futures for major assets if not specified, as user prefers futures
      const market = text.includes('spot') ? 'SPOT' : 'FUTURES';
      return { type: 'ANALYZE', asset: `${asset.toUpperCase()}USDT`, market };
    }
  }

  return { type: 'UNKNOWN' };
}

export function getHelpText(): string {
  return `Here are some commands you can try:\n\n• "Scan futures" (Find top setups)\n• "Check BTC" (Analyze Bitcoin)\n• "Top 10" (Show best opportunities)\n• "Help" (Show this menu)`;
}