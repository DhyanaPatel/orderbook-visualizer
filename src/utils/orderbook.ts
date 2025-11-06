import { OrderBookLevel } from '@/types/binance';

export interface ProcessedOrderBookLevel extends OrderBookLevel {
  total: number;
  percentage: number;
}

export function processBids(
  bids: Map<string, string>,
  depth: number = 20
): ProcessedOrderBookLevel[] {
  // Convert to array and sort by price descending (highest first)
  const sorted = Array.from(bids.entries())
    .map(([price, quantity]) => ({
      price,
      quantity,
      priceNum: parseFloat(price),
      quantityNum: parseFloat(quantity),
    }))
    .sort((a, b) => b.priceNum - a.priceNum)
    .slice(0, depth);

  // Calculate cumulative totals
  let cumulativeTotal = 0;
  const withTotals = sorted.map((item) => {
    cumulativeTotal += item.quantityNum;
    return {
      price: item.price,
      quantity: item.quantity,
      total: cumulativeTotal,
    };
  });

  // Calculate percentages for depth visualization
  const maxTotal = withTotals.length > 0 ? withTotals[withTotals.length - 1].total : 1;
  return withTotals.map((item) => ({
    ...item,
    percentage: (item.total / maxTotal) * 100,
  }));
}

export function processAsks(
  asks: Map<string, string>,
  depth: number = 20
): ProcessedOrderBookLevel[] {
  // Convert to array and sort by price ascending (lowest first)
  const sorted = Array.from(asks.entries())
    .map(([price, quantity]) => ({
      price,
      quantity,
      priceNum: parseFloat(price),
      quantityNum: parseFloat(quantity),
    }))
    .sort((a, b) => a.priceNum - b.priceNum)
    .slice(0, depth);

  // Calculate cumulative totals
  let cumulativeTotal = 0;
  const withTotals = sorted.map((item) => {
    cumulativeTotal += item.quantityNum;
    return {
      price: item.price,
      quantity: item.quantity,
      total: cumulativeTotal,
    };
  });

  // Calculate percentages for depth visualization
  const maxTotal = withTotals.length > 0 ? withTotals[withTotals.length - 1].total : 1;
  return withTotals.map((item) => ({
    ...item,
    percentage: (item.total / maxTotal) * 100,
  }));
}

export function calculateSpread(
  bids: ProcessedOrderBookLevel[],
  asks: ProcessedOrderBookLevel[]
): { spread: number; spreadPercentage: number } {
  if (bids.length === 0 || asks.length === 0) {
    return { spread: 0, spreadPercentage: 0 };
  }

  const highestBid = parseFloat(bids[0].price);
  const lowestAsk = parseFloat(asks[0].price);
  const spread = lowestAsk - highestBid;
  const spreadPercentage = (spread / lowestAsk) * 100;

  return { spread, spreadPercentage };
}

export function formatPrice(price: string, decimals: number = 2): string {
  return parseFloat(price).toFixed(decimals);
}

export function formatQuantity(quantity: string, decimals: number = 6): string {
  const num = parseFloat(quantity);
  if (num === 0) return '0';
  if (num < 0.01) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  return num.toFixed(decimals);
}

export function formatTotal(total: number, decimals: number = 2): string {
  if (total === 0) return '0';
  if (total < 0.01) return total.toFixed(8);
  if (total < 1) return total.toFixed(6);
  return total.toFixed(decimals);
}
