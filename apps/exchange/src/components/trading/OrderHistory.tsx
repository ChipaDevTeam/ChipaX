/**
 * FILE: apps/exchange/src/components/trading/OrderHistory.tsx
 * PURPOSE: Display user's order history and open orders
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';

type TabType = 'open' | 'history' | 'trades';

interface Order {
  symbol: string;
  side: 'buy' | 'sell';
  type: string;
  price: string;
  amount: string;
  filled: string;
  status: string;
  time: string;
}

export default function OrderHistory() {
  const [activeTab, setActiveTab] = useState<TabType>('open');

  // Mock data
  const openOrders: Order[] = [
    {
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'Limit',
      price: '43,500.00',
      amount: '0.500',
      filled: '0.000',
      status: 'Open',
      time: '16:30:45',
    },
    {
      symbol: 'ETH/USDT',
      side: 'sell',
      type: 'Limit',
      price: '2,350.00',
      amount: '2.000',
      filled: '0.500',
      status: 'Partial',
      time: '15:20:12',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Tabs */}
      <div className="flex border-b border-[#1e1b5c]">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'open'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Open Orders (2)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'history'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Order History
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'trades'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Trade History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'open' && (
        <div className="flex-1 overflow-auto">
          {openOrders.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Type</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Price</th>
                  <th className="p-3 font-normal">Amount</th>
                  <th className="p-3 font-normal">Filled</th>
                  <th className="p-3 font-normal">Status</th>
                  <th className="p-3 font-normal">Time</th>
                  <th className="p-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order, index) => (
                  <tr key={index} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                    <td className="p-3 text-white">{order.symbol}</td>
                    <td className="p-3 text-indigo-300">{order.type}</td>
                    <td className={`p-3 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {order.side.toUpperCase()}
                    </td>
                    <td className="p-3 text-white">{order.price}</td>
                    <td className="p-3 text-white">{order.amount}</td>
                    <td className="p-3 text-indigo-300">{order.filled}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.status === 'Open'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-indigo-300">{order.time}</td>
                    <td className="p-3">
                      <button className="text-red-500 hover:text-red-400 text-xs">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex-1 flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">No open orders</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-indigo-400 text-sm">No order history</p>
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-indigo-400 text-sm">No trade history</p>
        </div>
      )}
    </div>
  );
}
