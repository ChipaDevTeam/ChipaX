/**
 * FILE: apps/exchange/src/components/trading/RecentTrades.tsx
 * PURPOSE: Display recent market trades
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState, useEffect } from 'react';

interface Trade {
  price: string;
  amount: string;
  time: string;
  side: 'buy' | 'sell';
}

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Mock data - will be replaced with WebSocket real-time data
  useEffect(() => {
    const mockTrades: Trade[] = [
      { price: '43,851.50', amount: '0.234', time: '16:45:23', side: 'buy' },
      { price: '43,850.00', amount: '1.567', time: '16:45:22', side: 'sell' },
      { price: '43,852.50', amount: '0.890', time: '16:45:20', side: 'buy' },
      { price: '43,849.00', amount: '2.345', time: '16:45:18', side: 'sell' },
      { price: '43,851.00', amount: '0.678', time: '16:45:15', side: 'buy' },
      { price: '43,850.50', amount: '1.234', time: '16:45:12', side: 'buy' },
      { price: '43,848.00', amount: '0.456', time: '16:45:10', side: 'sell' },
      { price: '43,851.50', amount: '0.987', time: '16:45:08', side: 'buy' },
      { price: '43,849.50', amount: '1.456', time: '16:45:05', side: 'sell' },
      { price: '43,850.00', amount: '0.765', time: '16:45:02', side: 'buy' },
    ];

    setTrades(mockTrades);
  }, []);

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
        <div className="px-3 py-1">
          {trades.map((trade, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-2 py-1.5 text-xs hover:bg-[#1a1660]/50"
            >
              <div className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                {trade.price}
              </div>
              <div className="text-right text-white">{trade.amount}</div>
              <div className="text-right text-indigo-300">{trade.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
