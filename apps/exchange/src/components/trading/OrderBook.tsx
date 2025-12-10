/**
 * FILE: apps/exchange/src/components/trading/OrderBook.tsx
 * PURPOSE: Real-time order book display with bids and asks
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState, useEffect } from 'react';

interface OrderBookLevel {
  price: string;
  quantity: string;
  total: string;
}

export default function OrderBook() {
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [bids, setBids] = useState<OrderBookLevel[]>([]);

  // Mock data - will be replaced with WebSocket real-time data
  useEffect(() => {
    const mockAsks: OrderBookLevel[] = [
      { price: '43,875.50', quantity: '0.245', total: '10.754' },
      { price: '43,870.00', quantity: '1.234', total: '54.142' },
      { price: '43,865.50', quantity: '0.876', total: '38.426' },
      { price: '43,860.00', quantity: '2.145', total: '94.099' },
      { price: '43,855.50', quantity: '0.567', total: '24.866' },
      { price: '43,852.00', quantity: '1.890', total: '82.880' },
      { price: '43,851.50', quantity: '0.432', total: '18.944' },
    ];

    const mockBids: OrderBookLevel[] = [
      { price: '43,850.00', quantity: '1.567', total: '68.730' },
      { price: '43,845.50', quantity: '0.890', total: '39.022' },
      { price: '43,840.00', quantity: '2.345', total: '102.828' },
      { price: '43,835.50', quantity: '1.234', total: '54.093' },
      { price: '43,830.00', quantity: '0.678', total: '29.717' },
      { price: '43,825.50', quantity: '1.456', total: '63.817' },
      { price: '43,820.00', quantity: '0.987', total: '43.250' },
    ];

    setAsks(mockAsks);
    setBids(mockBids);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e1b5c]">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
        <div className="flex items-center gap-2">
          <button className="text-xs text-indigo-300 hover:text-white">0.01</button>
          <button className="text-xs text-indigo-300 hover:text-white">0.1</button>
          <button className="text-xs text-indigo-400">1</button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-indigo-400 border-b border-[#1e1b5c]">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount (BTC)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-1">
          {asks.reverse().map((ask, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-[#1a1660]/50 cursor-pointer relative"
            >
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 h-full bg-red-900/20"
                style={{ width: `${Math.random() * 60 + 20}%` }}
              />
              <div className="text-red-500 relative z-10">{ask.price}</div>
              <div className="text-right text-white relative z-10">{ask.quantity}</div>
              <div className="text-right text-indigo-300 relative z-10">{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-3 py-2 bg-[#131149]/50 border-y border-[#1e1b5c]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-500 font-semibold">43,850.50</span>
            <span className="text-indigo-400">Spread: 0.50</span>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="px-3 py-1">
          {bids.map((bid, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-[#1a1660]/50 cursor-pointer relative"
            >
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 h-full bg-green-900/20"
                style={{ width: `${Math.random() * 60 + 20}%` }}
              />
              <div className="text-green-500 relative z-10">{bid.price}</div>
              <div className="text-right text-white relative z-10">{bid.quantity}</div>
              <div className="text-right text-indigo-300 relative z-10">{bid.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
