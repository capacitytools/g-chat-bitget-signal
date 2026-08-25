"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  onMessage: (symbol: string, price: number) => void;
  subscriptions: string[]; // Format: "BTCUSDT:SPOT" or "BTCUSDT:FUTURES"
}

export function useBitgetWebSocket({ onMessage, subscriptions }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Bitget Public WebSocket URL
      wsRef.current = new WebSocket('wss://ws.bitget.com/mix/v1/stream');

      wsRef.current.onopen = () => {
        console.log('WebSocket Connected');
        
        // Subscribe to all requested channels
        const subscribeMsg = {
          op: 'subscribe',
          args: subscriptions.map(sub => {
            const [symbol, marketType] = sub.split(':');
            const channel = marketType === 'FUTURES' ? 'ticker' : 'spot-ticker';
            const instId = marketType === 'FUTURES' ? `${symbol}_UMCBL` : symbol;
            return {
              instType: marketType === 'FUTURES' ? 'mc' : 'sp',
              channel,
              instId
            };
          })
        };

        wsRef.current?.send(JSON.stringify(subscribeMsg));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.action === 'snapshot' || data.arg?.channel === 'ticker' || data.arg?.channel === 'spot-ticker') {
            const symbol = data.arg?.instId?.replace('_UMCBL', '') || data.data?.[0]?.instId?.replace('_UMCBL', '');
            const price = parseFloat(data.data?.[0]?.last || data.data?.[0]?.lastPr || '0');
            
            if (symbol && price > 0) {
              onMessage(symbol, price);
            }
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket Closed. Reconnecting in 5s...');
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [subscriptions, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connect, disconnect };
}