'use client';

import React, { useMemo } from 'react';
import { OrderBook as OrderBookType } from '@/types/binance';
import {
  processBids,
  processAsks,
  calculateSpread,
  formatPrice,
  formatQuantity,
  formatTotal,
  ProcessedOrderBookLevel,
} from '@/utils/orderbook';

interface OrderBookProps {
  orderBook: OrderBookType;
}

interface OrderBookRowProps {
  level: ProcessedOrderBookLevel;
  type: 'bid' | 'ask';
}

const OrderBookRow: React.FC<OrderBookRowProps> = ({ level, type }) => {
  const bgColor = type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10';
  const textColor = type === 'bid' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="relative h-6 text-xs font-mono">
      {/* Background depth bar */}
      <div
        className={`absolute inset-y-0 right-0 ${bgColor} transition-all duration-100`}
        style={{ width: `${level.percentage}%` }}
      />

      {/* Content */}
      <div className="relative grid grid-cols-3 gap-2 px-2 h-full items-center">
        <span className={`${textColor} font-medium`}>
          {formatPrice(level.price, 2)}
        </span>
        <span className="text-gray-300 text-right">
          {formatQuantity(level.quantity, 4)}
        </span>
        <span className="text-gray-400 text-right">
          {formatTotal(level.total, 2)}
        </span>
      </div>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ orderBook }) => {
  const { processedBids, processedAsks, spread, spreadPercentage } = useMemo(() => {
    const bids = processBids(orderBook.bids, 20);
    const asks = processAsks(orderBook.asks, 20);
    const { spread: calculatedSpread, spreadPercentage: calculatedSpreadPercentage } =
      calculateSpread(bids, asks);

    return {
      processedBids: bids,
      processedAsks: asks,
      spread: calculatedSpread,
      spreadPercentage: calculatedSpreadPercentage,
    };
  }, [orderBook]);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-200">Order Book</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Bids (Buy Orders) - Left Side */}
        <div>
          <div className="grid grid-cols-3 gap-2 px-2 pb-2 text-xs font-medium text-gray-500 border-b border-gray-800">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Total</span>
          </div>

          <div className="space-y-0.5 mt-2">
            {processedBids.length > 0 ? (
              processedBids.map((level, index) => (
                <OrderBookRow key={`bid-${index}`} level={level} type="bid" />
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                Loading bids...
              </div>
            )}
          </div>
        </div>

        {/* Asks (Sell Orders) - Right Side */}
        <div>
          <div className="grid grid-cols-3 gap-2 px-2 pb-2 text-xs font-medium text-gray-500 border-b border-gray-800">
            <span>Price (USDT)</span>
            <span className="text-right">Amount (BTC)</span>
            <span className="text-right">Total</span>
          </div>

          <div className="space-y-0.5 mt-2">
            {processedAsks.length > 0 ? (
              processedAsks.map((level, index) => (
                <OrderBookRow key={`ask-${index}`} level={level} type="ask" />
              ))
            ) : (
              <div className="text-gray-500 text-sm text-center py-4">
                Loading asks...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spread Display */}
      {processedBids.length > 0 && processedAsks.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/80">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Spread:</span>
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-mono font-medium">
                {formatPrice(spread.toString(), 2)} USDT
              </span>
              <span className="text-gray-500">
                ({spreadPercentage.toFixed(3)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderBook;
