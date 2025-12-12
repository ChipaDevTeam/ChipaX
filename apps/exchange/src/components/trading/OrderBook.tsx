/**
 * FILE: apps/exchange/src/components/trading/OrderBook.tsx
 * PURPOSE: Real-time order book display with bids and asks
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useOrderBook } from '@/hooks/useTrading';

interface OrderBookProps {
  symbol?: string;
}

export default function OrderBook({ symbol = 'BTC' }: OrderBookProps) {
  const { orderBook, isLoading, error } = useOrderBook(symbol, 20, 1000);

  const asks = orderBook?.asks || [];
  const bids = orderBook?.bids || [];
  
  // Calculate spread
  const bestAsk = asks.length > 0 ? asks[0][0] : 0;
  const bestBid = bids.length > 0 ? bids[0][0] : 0;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : '0.00';
  const midPrice = bestAsk && bestBid ? ((bestAsk + bestBid) / 2).toFixed(2) : '0.00';

  // Calculate cumulative totals for depth visualization
  const maxTotal = Math.max(
    ...asks.map(([price, size]: [number, number]) => price * size),
    ...bids.map(([price, size]: [number, number]) => price * size)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
        <div className="flex items-center justify-center h-full">
          <div className="text-indigo-400 text-sm">Loading order book...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400 text-sm">Failed to load order book</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e1b5c]">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
        <div className="text-xs text-indigo-400">{symbol}/USDT</div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-indigo-400 border-b border-[#1e1b5c]">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount ({symbol})</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-1">
          {[...asks].reverse().slice(0, 10).map(([price, size]: [number, number], index: number) => {
            const total = price * size;
            const depthPercent = (total / maxTotal) * 100;
            
            return (
              <div
                key={`ask-${index}`}
                className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-[#1a1660]/50 cursor-pointer relative"
              >
                {/* Background bar */}
                <div
                  className="absolute right-0 top-0 h-full bg-red-900/20"
                  style={{ width: `${depthPercent}%` }}
                />
                <div className="text-red-500 relative z-10">{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-right text-white relative z-10">{size.toFixed(6)}</div>
                <div className="text-right text-indigo-300 relative z-10">{total.toFixed(2)}</div>
              </div>
            );
          })}
        </div>

        {/* Spread */}
        <div className="px-3 py-2 bg-[#131149]/50 border-y border-[#1e1b5c]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-500 font-semibold">{midPrice}</span>
            <span className="text-indigo-400">Spread: {spread}</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="px-3 py-1">
          {bids.slice(0, 10).map(([price, size]: [number, number], index: number) => {
            const total = price * size;
            const depthPercent = (total / maxTotal) * 100;
            
            return (
              <div
                key={`bid-${index}`}
                className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-[#1a1660]/50 cursor-pointer relative"
              >
                {/* Background bar */}
                <div
                  className="absolute right-0 top-0 h-full bg-green-900/20"
                  style={{ width: `${depthPercent}%` }}
                />
                <div className="text-green-500 relative z-10">{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-right text-white relative z-10">{size.toFixed(6)}</div>
                <div className="text-right text-indigo-300 relative z-10">{total.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {asks.length === 0 && bids.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="text-indigo-400 text-sm">No orders available</div>
        </div>
      )}
    </div>
  );
}
