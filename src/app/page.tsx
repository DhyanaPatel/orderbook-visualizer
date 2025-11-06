'use client';

import { useBinanceSocket } from '@/hooks/useBinanceSocket';
import OrderBook from '@/components/OrderBook';
import RecentTrades from '@/components/RecentTrades';

export default function Home() {
  const { orderBook, trades, isConnected, error } = useBinanceSocket('btcusdt');

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Real-Time Order Book Visualizer
              </h1>
              <p className="text-gray-400 text-sm">BTC/USDT - Binance Spot Market</p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Error/Warning Display */}
          {error && (
            <div className={`mt-4 p-4 rounded-lg ${
              error.includes('live data') || error.includes('rate limit')
                ? 'bg-yellow-500/10 border border-yellow-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className={`text-sm ${
                error.includes('live data') || error.includes('rate limit')
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {error.includes('live data') || error.includes('rate limit') ? '⚠️ ' : ''}
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Book - Takes 2 columns */}
          <div className="lg:col-span-2">
            <OrderBook orderBook={orderBook} />
          </div>

          {/* Recent Trades - Takes 1 column */}
          <div className="lg:col-span-1">
            <RecentTrades trades={trades} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Data provided by Binance WebSocket API (wss://stream.binance.com:9443)
            </p>
            <p>
              Order book updates every 100ms • Showing top 20 levels per side
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
