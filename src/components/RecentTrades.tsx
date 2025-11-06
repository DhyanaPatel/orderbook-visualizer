'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trade } from '@/types/binance';

interface RecentTradesProps {
  trades: Trade[];
}

interface TradeRowProps {
  trade: Trade;
  isNew: boolean;
}

const TradeRow: React.FC<TradeRowProps> = ({ trade, isNew }) => {
  const isBuy = !trade.isBuyerMaker; // If buyer is maker, it's a sell; otherwise it's a buy
  const color = isBuy ? 'text-green-400' : 'text-red-400';
  const flashColor = isBuy ? 'animate-flash-green' : 'animate-flash-red';

  const time = new Date(trade.time).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`grid grid-cols-3 gap-2 px-4 py-2 text-xs font-mono border-b border-gray-800/50 transition-colors ${
        isNew ? flashColor : ''
      }`}
    >
      <span className={`${color} font-medium`}>
        {parseFloat(trade.price).toFixed(2)}
      </span>
      <span className="text-gray-300 text-right">
        {parseFloat(trade.quantity).toFixed(6)}
      </span>
      <span className="text-gray-500 text-right text-[10px] leading-tight mt-0.5">
        {time}
      </span>
    </div>
  );
};

const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  const [newTradeIds, setNewTradeIds] = useState<Set<number>>(new Set());
  const prevTradesRef = useRef<Trade[]>([]);

  useEffect(() => {
    // Detect new trades by comparing with previous trades
    if (trades.length > 0 && prevTradesRef.current.length > 0) {
      const prevFirstId = prevTradesRef.current[0]?.id;
      const currentFirstId = trades[0]?.id;

      if (currentFirstId !== prevFirstId) {
        // New trade detected
        const newIds = new Set<number>();
        for (const trade of trades) {
          if (trade.id === prevFirstId) break;
          newIds.add(trade.id);
        }
        setNewTradeIds(newIds);

        // Clear flash effect after animation duration
        const timeout = setTimeout(() => {
          setNewTradeIds(new Set());
        }, 300);

        return () => clearTimeout(timeout);
      }
    }

    prevTradesRef.current = trades;
  }, [trades]);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-200">Recent Trades</h2>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-800">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {trades.length > 0 ? (
          trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              isNew={newTradeIds.has(trade.id)}
            />
          ))
        ) : (
          <div className="text-gray-500 text-sm text-center py-8">
            Waiting for trades...
          </div>
        )}
      </div>

      {/* Footer with trade count */}
      <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/80">
        <div className="text-xs text-gray-500">
          Showing {trades.length} most recent trades
        </div>
      </div>
    </div>
  );
};

export default RecentTrades;
