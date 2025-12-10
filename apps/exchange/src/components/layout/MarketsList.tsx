/**
 * FILE: apps/exchange/src/components/layout/MarketsList.tsx
 * PURPOSE: Trading pairs list with search and favorites
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';

interface Market {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: string;
  change24h: string;
  volume24h: string;
}

export default function MarketsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Mock data
  const markets: Market[] = [
    {
      symbol: 'BTC/USDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      price: '43,850.50',
      change24h: '+2.93',
      volume24h: '1,234.56',
    },
    {
      symbol: 'ETH/USDT',
      baseAsset: 'ETH',
      quoteAsset: 'USDT',
      price: '2,345.80',
      change24h: '+1.45',
      volume24h: '8,765.43',
    },
    {
      symbol: 'SOL/USDT',
      baseAsset: 'SOL',
      quoteAsset: 'USDT',
      price: '98.45',
      change24h: '-0.87',
      volume24h: '2,345.67',
    },
    {
      symbol: 'XRP/USDT',
      baseAsset: 'XRP',
      quoteAsset: 'USDT',
      price: '0.6234',
      change24h: '+5.23',
      volume24h: '5,678.90',
    },
  ];

  const filteredMarkets = markets.filter((market) =>
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1b5c]">
        <h3 className="text-sm font-semibold text-white mb-3">Markets</h3>
        
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-[#131149] border border-[#1e1b5c] rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-3 py-2 border-b border-[#1e1b5c] text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2 py-1 rounded ${
            activeCategory === 'all'
              ? 'bg-[#1a1660] text-white'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('favorites')}
          className={`px-2 py-1 rounded ${
            activeCategory === 'favorites'
              ? 'bg-[#1a1660] text-white'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          ⭐ Favorites
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-indigo-400 border-b border-[#1e1b5c]">
        <div className="text-left">Pair</div>
        <div className="text-right">Price</div>
        <div className="text-right">Change</div>
      </div>

      {/* Markets List */}
      <div className="flex-1 overflow-auto">
        {filteredMarkets.map((market) => {
          const isPositive = market.change24h.startsWith('+');
          const isActive = market.symbol === 'BTC/USDT';

          return (
            <div
              key={market.symbol}
              className={`grid grid-cols-3 gap-2 px-3 py-2.5 text-xs hover:bg-[#1a1660]/50 cursor-pointer transition-colors ${
                isActive ? 'bg-[#1a1660]/30' : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="text-white font-medium">{market.baseAsset}</span>
                <span className="text-indigo-400 text-xs">/{market.quoteAsset}</span>
              </div>
              <div className="text-right text-white">{market.price}</div>
              <div className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {market.change24h}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
