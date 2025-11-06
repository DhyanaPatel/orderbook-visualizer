'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  DepthUpdateEvent,
  AggTradeEvent,
  DepthSnapshot,
  Trade,
  OrderBook,
} from '@/types/binance';

interface UseBinanceSocketReturn {
  orderBook: OrderBook;
  trades: Trade[];
  isConnected: boolean;
  error: string | null;
}

const WS_URL = 'wss://stream.binance.com:9443/ws';
const REST_API = 'https://api.binance.com/api/v3';
const RECONNECT_DELAY = 3000;
const MAX_TRADES = 50;

export function useBinanceSocket(symbol: string = 'btcusdt'): UseBinanceSocketReturn {
  const [orderBook, setOrderBook] = useState<OrderBook>({
    bids: new Map(),
    asks: new Map(),
    lastUpdateId: 0,
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const depthBufferRef = useRef<DepthUpdateEvent[]>([]);
  const isInitializedRef = useRef(false);

  // Fetch initial order book snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch(
        `${REST_API}/depth?symbol=${symbol.toUpperCase()}&limit=1000`
      );

      const data = await response.json();

      // Check for rate limit error
      if (data.code === -1003) {
        console.warn('Binance API rate limit reached. Building order book from WebSocket deltas only.');
        setError('Building order book from live data (API rate limit reached)');

        // Initialize with empty order book and start processing deltas
        isInitializedRef.current = true;

        // Process buffered depth updates without snapshot validation
        const buffered = depthBufferRef.current;
        depthBufferRef.current = [];

        const bids = new Map<string, string>();
        const asks = new Map<string, string>();
        let lastUpdateId = 0;

        // Apply all buffered updates to build initial state
        buffered.forEach((event) => {
          event.b.forEach(([price, quantity]) => {
            if (parseFloat(quantity) === 0) {
              bids.delete(price);
            } else {
              bids.set(price, quantity);
            }
          });

          event.a.forEach(([price, quantity]) => {
            if (parseFloat(quantity) === 0) {
              asks.delete(price);
            } else {
              asks.set(price, quantity);
            }
          });

          lastUpdateId = event.u;
        });

        setOrderBook({
          bids,
          asks,
          lastUpdateId,
        });

        // Clear error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);

        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch order book snapshot');
      }

      const snapshot: DepthSnapshot = data;

      // Initialize order book with snapshot
      const bids = new Map<string, string>();
      const asks = new Map<string, string>();

      snapshot.bids.forEach(([price, quantity]) => {
        if (parseFloat(quantity) > 0) {
          bids.set(price, quantity);
        }
      });

      snapshot.asks.forEach(([price, quantity]) => {
        if (parseFloat(quantity) > 0) {
          asks.set(price, quantity);
        }
      });

      setOrderBook({
        bids,
        asks,
        lastUpdateId: snapshot.lastUpdateId,
      });

      // Process buffered depth updates
      const buffered = depthBufferRef.current;
      depthBufferRef.current = [];

      buffered.forEach((event) => {
        if (event.U <= snapshot.lastUpdateId && event.u >= snapshot.lastUpdateId) {
          // This is the first valid event
          applyDepthUpdate(event, { bids, asks, lastUpdateId: snapshot.lastUpdateId });
        } else if (event.u > snapshot.lastUpdateId) {
          // Apply all subsequent events
          applyDepthUpdate(event, { bids, asks, lastUpdateId: snapshot.lastUpdateId });
        }
      });

      isInitializedRef.current = true;
      setError(null);
    } catch (err) {
      console.error('Error fetching snapshot:', err);

      // Fallback: build from deltas only
      console.warn('Failed to fetch snapshot. Building order book from WebSocket deltas only.');
      setError('Building order book from live data only');
      isInitializedRef.current = true;

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [symbol]);

  // Apply depth update to order book
  const applyDepthUpdate = useCallback(
    (event: DepthUpdateEvent, currentBook: OrderBook) => {
      // Validate event sequence
      if (event.u <= currentBook.lastUpdateId) {
        return; // Already processed
      }

      // Only enforce strict sequence if we have a proper snapshot (lastUpdateId > 0)
      if (currentBook.lastUpdateId > 0 && event.U > currentBook.lastUpdateId + 1) {
        console.warn('Out of sequence depth update detected');
        // Don't reinitialize if we're already in fallback mode
        // Just continue processing to build the book
      }

      // Update bids
      event.b.forEach(([price, quantity]) => {
        if (parseFloat(quantity) === 0) {
          currentBook.bids.delete(price);
        } else {
          currentBook.bids.set(price, quantity);
        }
      });

      // Update asks
      event.a.forEach(([price, quantity]) => {
        if (parseFloat(quantity) === 0) {
          currentBook.asks.delete(price);
        } else {
          currentBook.asks.set(price, quantity);
        }
      });

      currentBook.lastUpdateId = event.u;

      // Trigger state update
      setOrderBook({
        bids: new Map(currentBook.bids),
        asks: new Map(currentBook.asks),
        lastUpdateId: currentBook.lastUpdateId,
      });
    },
    []
  );

  // Handle WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.e === 'depthUpdate') {
          const depthUpdate = data as DepthUpdateEvent;

          if (!isInitializedRef.current) {
            // Buffer updates until snapshot is loaded
            depthBufferRef.current.push(depthUpdate);
          } else {
            applyDepthUpdate(depthUpdate, orderBook);
          }
        } else if (data.e === 'aggTrade') {
          const tradeEvent = data as AggTradeEvent;
          const newTrade: Trade = {
            id: tradeEvent.a,
            price: tradeEvent.p,
            quantity: tradeEvent.q,
            time: tradeEvent.T,
            isBuyerMaker: tradeEvent.m,
          };

          setTrades((prev) => {
            const updated = [newTrade, ...prev];
            return updated.slice(0, MAX_TRADES);
          });
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    },
    [applyDepthUpdate, orderBook]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const streams = [
        `${symbol.toLowerCase()}@depth@100ms`,
        `${symbol.toLowerCase()}@aggTrade`,
      ];
      const ws = new WebSocket(`${WS_URL}/${streams.join('/')}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);

        // Fetch initial snapshot after connection
        if (!isInitializedRef.current) {
          fetchSnapshot();
        }
      };

      ws.onmessage = handleMessage;

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);

        // Attempt to reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, RECONNECT_DELAY);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [symbol, handleMessage, fetchSnapshot]);

  // Initialize connection
  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      isInitializedRef.current = false;
      depthBufferRef.current = [];
    };
  }, [connect]);

  return {
    orderBook,
    trades,
    isConnected,
    error,
  };
}
