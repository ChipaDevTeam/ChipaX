/**
 * FILE: apps/exchange/src/components/trading/TradePanel.tsx
 * PURPOSE: Order placement panel with buy/sell forms
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';

type OrderType = 'limit' | 'market';
type OrderSide = 'buy' | 'sell';

export default function TradePanel() {
  const [activeTab, setActiveTab] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState('43,850.50');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');

  const handlePercentClick = (percent: number) => {
    // Calculate amount based on available balance percentage
    const mockBalance = 1000; // USDT
    const calculatedTotal = (mockBalance * percent) / 100;
    setTotal(calculatedTotal.toFixed(2));
    
    if (orderType === 'limit' && price) {
      const priceNum = parseFloat(price.replace(/,/g, ''));
      setAmount((calculatedTotal / priceNum).toFixed(6));
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Tabs */}
      <div className="flex border-b border-[#1e1b5c]">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'buy'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'sell'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 space-y-4">
        {/* Order Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 px-3 text-xs rounded transition-colors ${
              orderType === 'limit'
                ? 'bg-[#1a1660] text-white'
                : 'bg-transparent text-indigo-300 hover:text-white'
            }`}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 px-3 text-xs rounded transition-colors ${
              orderType === 'market'
                ? 'bg-[#1a1660] text-white'
                : 'bg-transparent text-indigo-300 hover:text-white'
            }`}
          >
            Market
          </button>
        </div>

        {/* Available Balance */}
        <div className="flex justify-between text-xs">
          <span className="text-indigo-400">Available</span>
          <span className="text-white">1,000.00 USDT</span>
        </div>

        {/* Price Input (for limit orders) */}
        {orderType === 'limit' && (
          <div className="space-y-1">
            <label className="text-xs text-indigo-400">Price</label>
            <div className="relative">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#131149] border border-[#1e1b5c] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400">
                USDT
              </span>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1">
          <label className="text-xs text-indigo-400">Amount</label>
          <div className="relative">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#131149] border border-[#1e1b5c] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400">
              BTC
            </span>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentClick(percent)}
              className="flex-1 py-1.5 text-xs bg-[#131149] hover:bg-[#1a1660] text-indigo-300 hover:text-white rounded transition-colors"
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="space-y-1">
          <label className="text-xs text-indigo-400">Total</label>
          <div className="relative">
            <input
              type="text"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#131149] border border-[#1e1b5c] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-400">
              USDT
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full py-3 rounded font-semibold text-sm transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {activeTab === 'buy' ? 'Buy' : 'Sell'} BTC
        </button>
      </div>
    </div>
  );
}
