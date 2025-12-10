/**
 * FILE: apps/exchange/src/components/layout/TickerStrip.tsx
 * PURPOSE: Price ticker strip showing market stats
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

interface TickerData {
  symbol: string;
  price: string;
  change24h: string;
  changePercent: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export default function TickerStrip() {
  // Mock data - will be replaced with real-time data
  const ticker: TickerData = {
    symbol: 'BTC/USDT',
    price: '43,850.50',
    change24h: '+1,250.30',
    changePercent: '+2.93',
    high24h: '44,200.00',
    low24h: '42,100.00',
    volume24h: '1,234.56',
  };

  const isPositive = ticker.changePercent.startsWith('+');

  return (
    <div className="h-12 bg-[#131149] border-b border-[#1e1b5c] flex items-center px-4 gap-6 text-sm">
      {/* Symbol */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">{ticker.symbol}</span>
        <span className="text-xs text-indigo-400">Perpetual</span>
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <span className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          ${ticker.price}
        </span>
        <span className="text-xs text-indigo-400">Mark Price</span>
      </div>

      {/* 24h Change */}
      <div className="flex flex-col">
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {ticker.change24h} ({ticker.changePercent}%)
        </span>
        <span className="text-xs text-indigo-400">24h Change</span>
      </div>

      {/* 24h High */}
      <div className="flex flex-col">
        <span className="text-sm text-white">${ticker.high24h}</span>
        <span className="text-xs text-indigo-400">24h High</span>
      </div>

      {/* 24h Low */}
      <div className="flex flex-col">
        <span className="text-sm text-white">${ticker.low24h}</span>
        <span className="text-xs text-indigo-400">24h Low</span>
      </div>

      {/* 24h Volume */}
      <div className="flex flex-col">
        <span className="text-sm text-white">{ticker.volume24h} BTC</span>
        <span className="text-xs text-indigo-400">24h Volume</span>
      </div>
    </div>
  );
}
