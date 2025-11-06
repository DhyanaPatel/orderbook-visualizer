# Real-Time Order Book Visualizer

A high-performance, real-time stock order book visualizer built with Next.js and the Binance WebSocket API. This application displays live order book data and recent trades for the BTC/USDT trading pair on Binance.

## Features

### 1. Real-Time Order Book
- **Two-column layout**: Bids (buy orders) on the left, Asks (sell orders) on the right
- **Live updates**: Order book updates every 100ms via WebSocket
- **Three columns per side**:
  - **Price**: The price level in USDT
  - **Amount**: The quantity available at that price level in BTC
  - **Total**: Cumulative total from the most competitive price down to that row
- **Smart sorting**:
  - Bids sorted by price in descending order (highest bid at the top)
  - Asks sorted by price in ascending order (lowest ask at the top)
- **Depth visualization**: Background bars showing relative depth (green for bids, red for asks)
- **Spread display**: Shows the difference between the lowest ask and highest bid

### 2. Recent Trades Feed
- Displays the 50 most recent trades in real-time
- **Flash highlighting**: New trades flash green (market buy) or red (market sell)
- Shows price, amount, and timestamp for each trade
- Auto-scrolling list with the newest trades at the top

### 3. Connection Management
- **Auto-connect**: Automatically connects to Binance WebSocket API on load
- **Auto-reconnect**: Gracefully handles disconnections and reconnects
- **Connection status indicator**: Visual indicator showing connection state
- **Error handling**: Displays error messages if connection fails

## Technical Implementation

### WebSocket Integration
- Connects to Binance WebSocket API (`wss://stream.binance.com:9443`)
- Subscribes to two data streams:
  - **Depth Stream** (`btcusdt@depth@100ms`): Order book deltas
  - **Aggregate Trade Stream** (`btcusdt@aggTrade`): Completed trades
- Fetches initial order book snapshot from REST API
- Properly handles delta updates with sequence validation

### State Management
- Custom React hook (`useBinanceSocket`) manages WebSocket connection
- Efficient order book updates using Map data structures for O(1) lookups
- Buffers depth updates during initialization
- Validates update sequence IDs to maintain data integrity

### Performance Optimizations
- Uses `useMemo` to minimize recalculations
- Efficient Map operations for order book updates
- Throttled UI updates to prevent blocking
- Background reconnection logic

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)
- **API**: Binance WebSocket API

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
orderbook-visualizer/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and animations
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page component
│   ├── components/
│   │   ├── OrderBook.tsx         # Order book display component
│   │   └── RecentTrades.tsx      # Recent trades component
│   ├── hooks/
│   │   └── useBinanceSocket.ts   # WebSocket connection hook
│   ├── types/
│   │   └── binance.ts            # TypeScript type definitions
│   └── utils/
│       └── orderbook.ts          # Order book processing utilities
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Key Components

### useBinanceSocket Hook
Custom React hook that:
- Manages WebSocket connection lifecycle
- Fetches initial order book snapshot (with rate limit fallback)
- Processes depth update deltas
- Aggregates trade events
- Handles reconnection logic
- **Rate Limit Fallback**: If the REST API returns a rate limit error, the hook automatically falls back to building the order book from WebSocket deltas only, ensuring the app continues to work

### OrderBook Component
Displays the live order book with:
- Sorted bid/ask lists
- Depth visualization bars
- Cumulative totals
- Spread calculation

### RecentTrades Component
Shows recent market activity with:
- Flash animations for new trades
- Buy/sell color coding
- Scrollable list of trades
- Timestamps

## API Documentation

### Binance WebSocket Streams Used

1. **Depth Stream**: `<symbol>@depth@100ms`
   - Provides order book delta updates every 100ms
   - Returns bids and asks that changed

2. **Aggregate Trade Stream**: `<symbol>@aggTrade`
   - Provides real-time trade information
   - Aggregates trades for a single taker order

### REST API Endpoint

- **Order Book Snapshot**: `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=1000`
  - Used to fetch initial order book state
  - Required before processing WebSocket deltas

## How It Works

1. **Initialization**:
   - Component mounts and hook initiates WebSocket connection
   - Fetches initial order book snapshot from REST API
   - Buffers incoming depth updates during initialization

2. **Order Book Updates**:
   - Receives depth update deltas via WebSocket
   - Validates update sequence IDs
   - Updates local order book state (add/update/remove price levels)
   - Triggers UI re-render with new data

3. **Trade Updates**:
   - Receives aggregate trade events via WebSocket
   - Adds new trades to the top of the list
   - Maintains max 50 trades in memory
   - Triggers flash animation for new entries

4. **Reconnection**:
   - Detects connection loss
   - Waits 3 seconds before attempting reconnection
   - Reinitializes order book on successful reconnection

## Customization

### Change Trading Pair
Edit `src/app/page.tsx`:
```typescript
const { orderBook, trades, isConnected, error } = useBinanceSocket('ethusdt');
```

### Adjust Order Book Depth
Edit the depth parameter in `src/components/OrderBook.tsx`:
```typescript
const bids = processBids(orderBook.bids, 30); // Show 30 levels instead of 20
```

### Change Update Frequency
Edit the stream subscription in `src/hooks/useBinanceSocket.ts`:
```typescript
`${symbol.toLowerCase()}@depth@1000ms` // Update every 1 second instead of 100ms
```

## Performance Considerations

- Order book updates are processed efficiently using Map data structures
- UI updates are optimized with React's useMemo hook
- Maximum of 50 trades kept in memory
- Background bars calculated as percentages for smooth rendering

## Troubleshooting

### "Building order book from live data" Warning

If you see a yellow warning message saying "Building order book from live data (API rate limit reached)", this means:

- The Binance REST API has rate-limited your IP address
- The application automatically falls back to building the order book from WebSocket delta updates only
- **The app will still work perfectly** - it just takes a few seconds to build up the initial order book state
- The warning will disappear after 5 seconds
- This is not an error - it's a graceful degradation mechanism

**Why does this happen?**
Binance has strict rate limits on their REST API to prevent abuse. If you refresh the page too many times or if multiple people on your network are accessing Binance APIs, you may hit the rate limit.

**What to do?**
- Wait for the order book to populate from live updates (takes 2-5 seconds)
- The WebSocket connection provides real-time updates, so you'll still see live data
- Avoid refreshing the page repeatedly
- The rate limit typically expires after a few minutes

### Connection Issues

If you see "Disconnected" status:
- Check your internet connection
- Verify that WebSocket connections aren't blocked by your firewall
- The app will automatically attempt to reconnect every 3 seconds

## License

This project is for educational purposes only. Use at your own risk.

## Acknowledgments

- Binance for providing the WebSocket API
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
