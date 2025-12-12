/**
 * FILE: apps/exchange/src/components/trading/OrderHistory.tsx
 * PURPOSE: Display user's order history and open orders
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';
import { useOrders, useFills, useTrading } from '@/hooks/useTrading';

type TabType = 'open' | 'history' | 'trades';

export default function OrderHistory() {
  const [activeTab, setActiveTab] = useState<TabType>('open');
  const { orders, isLoading: ordersLoading } = useOrders(undefined, 3000);
  const { fills, isLoading: fillsLoading } = useFills(undefined, 100);
  const { cancelOrder } = useTrading();
  
  const handleCancelOrder = async (coin: string, orderId: string) => {
    try {
      await cancelOrder(coin, orderId);
      // Orders will be refetched automatically due to the polling
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

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
          Open Orders ({orders.length})
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
          {ordersLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Order ID</th>
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Price</th>
                  <th className="p-3 font-normal">Size</th>
                  <th className="p-3 font-normal">Status</th>
                  <th className="p-3 font-normal">Time</th>
                  <th className="p-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isBuy = order.is_buy;
                  const time = new Date(order.timestamp).toLocaleTimeString();
                  
                  return (
                    <tr key={order.oid} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                      <td className="p-3 text-indigo-300 font-mono text-xs">{order.oid.slice(0, 8)}...</td>
                      <td className="p-3 text-white">{order.coin}</td>
                      <td className={`p-3 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </td>
                      <td className="p-3 text-white">${parseFloat(order.limit_px).toFixed(2)}</td>
                      <td className="p-3 text-white">{parseFloat(order.sz).toFixed(6)}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs bg-blue-900/30 text-blue-400">
                          {order.order_type}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300">{time}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleCancelOrder(order.coin, order.oid)}
                          className="text-red-500 hover:text-red-400 text-xs"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
        <div className="flex-1 overflow-auto">
          {fillsLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Loading history...</p>
            </div>
          ) : fills.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Order ID</th>
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Price</th>
                  <th className="p-3 font-normal">Size</th>
                  <th className="p-3 font-normal">Fee</th>
                  <th className="p-3 font-normal">Time</th>
                </tr>
              </thead>
              <tbody>
                {fills.map((fill) => {
                  const isBuy = fill.side === 'buy';
                  const time = new Date(fill.time).toLocaleString();
                  
                  return (
                    <tr key={fill.tid} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                      <td className="p-3 text-indigo-300 font-mono text-xs">{fill.oid?.slice(0, 8) || 'N/A'}...</td>
                      <td className="p-3 text-white">{fill.coin}</td>
                      <td className={`p-3 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </td>
                      <td className="p-3 text-white">${parseFloat(fill.px).toFixed(2)}</td>
                      <td className="p-3 text-white">{parseFloat(fill.sz).toFixed(6)}</td>
                      <td className="p-3 text-indigo-300">${parseFloat(fill.fee || '0').toFixed(6)}</td>
                      <td className="p-3 text-indigo-300">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex-1 flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">No order history</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="flex-1 overflow-auto">
          {fillsLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Loading trades...</p>
            </div>
          ) : fills.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Trade ID</th>
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Price</th>
                  <th className="p-3 font-normal">Size</th>
                  <th className="p-3 font-normal">Total</th>
                  <th className="p-3 font-normal">Fee</th>
                  <th className="p-3 font-normal">Time</th>
                </tr>
              </thead>
              <tbody>
                {fills.map((fill) => {
                  const isBuy = fill.side === 'buy';
                  const price = parseFloat(fill.px);
                  const size = parseFloat(fill.sz);
                  const total = price * size;
                  const time = new Date(fill.time).toLocaleString();
                  
                  return (
                    <tr key={fill.tid} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                      <td className="p-3 text-indigo-300 font-mono text-xs">{fill.tid.slice(0, 8)}...</td>
                      <td className="p-3 text-white">{fill.coin}</td>
                      <td className={`p-3 ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </td>
                      <td className="p-3 text-white">${price.toFixed(2)}</td>
                      <td className="p-3 text-white">{size.toFixed(6)}</td>
                      <td className="p-3 text-white">${total.toFixed(2)}</td>
                      <td className="p-3 text-indigo-300">${parseFloat(fill.fee || '0').toFixed(6)}</td>
                      <td className="p-3 text-indigo-300">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex-1 flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">No trade history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
