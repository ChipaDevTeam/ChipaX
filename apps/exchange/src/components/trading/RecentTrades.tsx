/**
 * FILE: apps/exchange/src/components/trading/RecentTrades.tsx
 * PURPOSE: Display recent market trades
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useFills } from '@/hooks/useTrading';

interface RecentTradesProps {
  symbol?: string;
}

export default function RecentTrades({ symbol = 'BTC' }: RecentTradesProps) {
  const { fills, isLoading } = useFills(symbol, 20);

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e1b5c]">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-indigo-400 border-b border-[#1e1b5c]">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount (BTC)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-indigo-400 text-sm">Loading trades...</p>
          </div>
        ) : fills.length > 0 ? (
          <div className="px-3 py-1">
            {fills.slice(0, 20).map((fill) => {
              const isBuy = fill.side === 'buy';
              const time = new Date(fill.time).toLocaleTimeString();
              
              return (
                <div
                  key={fill.tid}
                  className="grid grid-cols-3 gap-2 py-1.5 text-xs hover:bg-[#1a1660]/50"
                >
                  <div className={isBuy ? 'text-green-500' : 'text-red-500'}>
                    ${parseFloat(fill.px).toFixed(2)}
                  </div>
                  <div className="text-right text-white">{parseFloat(fill.sz).toFixed(6)}</div>
                  <div className="text-right text-indigo-300">{time}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-indigo-400 text-sm">No recent trades</p>
          </div>
        )}
      </div>
    </div>
  );
}
