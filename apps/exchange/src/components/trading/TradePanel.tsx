/**
 * FILE: apps/exchange/src/components/trading/TradePanel.tsx
 * PURPOSE: Order placement panel with buy/sell forms
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState, useEffect } from 'react';
import { useTrading, useBalance, usePrice } from '@/hooks/useTrading';
import { useAuth } from '@/contexts/AuthContext';

type OrderType = 'limit' | 'market';
type OrderSide = 'buy' | 'sell';

interface TradePanelProps {
  symbol?: string;
}

export default function TradePanel({ symbol = 'BTC' }: TradePanelProps) {
  const { isAuthenticated } = useAuth();
  const { placeLimitOrder, placeMarketOrder, isSubmitting } = useTrading();
  const { balance } = useBalance();
  const { price: currentPrice } = usePrice(symbol);

  const [activeTab, setActiveTab] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update price from current market price
  useEffect(() => {
    if (currentPrice && orderType === 'limit' && !price) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType, price]);

  const availableBalance = balance?.available_balance || 0;

  const handlePercentClick = (percent: number) => {
    const calculatedTotal = (availableBalance * percent) / 100;
    setTotal(calculatedTotal.toFixed(2));
    
    if (orderType === 'limit' && price) {
      const priceNum = parseFloat(price.replace(/,/g, ''));
      if (priceNum > 0) {
        setAmount((calculatedTotal / priceNum).toFixed(6));
      }
    } else if (orderType === 'market' && currentPrice) {
      setAmount((calculatedTotal / currentPrice).toFixed(6));
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to trade');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const amountNum = parseFloat(amount);
      
      if (!amountNum || amountNum <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (orderType === 'limit') {
        const priceNum = parseFloat(price.replace(/,/g, ''));
        if (!priceNum || priceNum <= 0) {
          setError('Please enter a valid price');
          return;
        }

        await placeLimitOrder({
          coin: symbol,
          is_buy: activeTab === 'buy',
          size: amountNum,
          price: priceNum,
        });
      } else {
        await placeMarketOrder({
          coin: symbol,
          is_buy: activeTab === 'buy',
          size: amountNum,
        });
      }

      setSuccess('Order placed successfully!');
      setAmount('');
      setTotal('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
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
          <span className="text-white">
            {availableBalance.toFixed(2)} USDT
          </span>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
            {success}
          </div>
        )}

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
          onClick={handleSubmit}
          disabled={isSubmitting || !isAuthenticated}
          className={`w-full py-3 rounded font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            activeTab === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Submitting...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
        </button>

        {!isAuthenticated && (
          <p className="text-xs text-center text-indigo-400">
            Please login to trade
          </p>
        )}
      </div>
    </div>
  );
}
