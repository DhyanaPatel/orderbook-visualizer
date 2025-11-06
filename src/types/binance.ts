// Binance WebSocket API Types

export interface DepthUpdateEvent {
  e: 'depthUpdate'; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID in event
  u: number; // Final update ID in event
  b: [string, string][]; // Bids to update [price, quantity]
  a: [string, string][]; // Asks to update [price, quantity]
}

export interface AggTradeEvent {
  e: 'aggTrade'; // Event type
  E: number; // Event time
  s: string; // Symbol
  a: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  f: number; // First trade ID
  l: number; // Last trade ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export interface DepthSnapshot {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface Trade {
  id: number;
  price: string;
  quantity: string;
  time: number;
  isBuyerMaker: boolean;
}

export interface OrderBookLevel {
  price: string;
  quantity: string;
  total?: number;
}

export interface OrderBook {
  bids: Map<string, string>;
  asks: Map<string, string>;
  lastUpdateId: number;
}
