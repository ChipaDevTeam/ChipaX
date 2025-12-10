/**
 * FILE: apps/exchange/src/components/trading/Positions.tsx
 * PURPOSE: Display user's open positions and balances
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';

type TabType = 'positions' | 'assets';

interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  liquidationPrice: string;
  margin: string;
  unrealizedPnL: string;
  pnlPercent: string;
}

interface Asset {
  asset: string;
  total: string;
  available: string;
  inOrder: string;
  btcValue: string;
}

export default function Positions() {
  const [activeTab, setActiveTab] = useState<TabType>('positions');

  // Mock data
  const positions: Position[] = [
    {
      symbol: 'BTC/USDT',
      side: 'long',
      size: '0.5',
      entryPrice: '43,200.00',
      markPrice: '43,850.50',
      liquidationPrice: '40,100.00',
      margin: '2,160.00',
      unrealizedPnL: '+325.25',
      pnlPercent: '+15.05',
    },
  ];

  const assets: Asset[] = [
    { asset: 'USDT', total: '12,450.32', available: '10,290.32', inOrder: '2,160.00', btcValue: '0.28' },
    { asset: 'BTC', total: '0.5000', available: '0.0000', inOrder: '0.5000', btcValue: '0.50' },
    { asset: 'ETH', total: '2.5000', available: '2.5000', inOrder: '0.0000', btcValue: '0.13' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Tabs */}
      <div className="flex border-b border-[#1e1b5c]">
        <button
          onClick={() => setActiveTab('positions')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'positions'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Positions (1)
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'assets'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-indigo-300 hover:text-white'
          }`}
        >
          Assets
        </button>
      </div>

      {/* Content */}
      {activeTab === 'positions' && (
        <div className="flex-1 overflow-auto">
          {positions.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Size</th>
                  <th className="p-3 font-normal">Entry Price</th>
                  <th className="p-3 font-normal">Mark Price</th>
                  <th className="p-3 font-normal">Liq. Price</th>
                  <th className="p-3 font-normal">Margin</th>
                  <th className="p-3 font-normal">PnL (ROE%)</th>
                  <th className="p-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => {
                  const isProfit = position.unrealizedPnL.startsWith('+');
                  return (
                    <tr key={index} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                      <td className="p-3 text-white font-medium">{position.symbol}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            position.side === 'long'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {position.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-white">{position.size}</td>
                      <td className="p-3 text-white">{position.entryPrice}</td>
                      <td className="p-3 text-white">{position.markPrice}</td>
                      <td className="p-3 text-yellow-500">{position.liquidationPrice}</td>
                      <td className="p-3 text-white">{position.margin}</td>
                      <td className={`p-3 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {position.unrealizedPnL} ({position.pnlPercent}%)
                      </td>
                      <td className="p-3">
                        <button className="text-indigo-400 hover:text-blue-400 text-xs">Close</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex-1 flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">No open positions</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
              <tr className="text-indigo-400 text-left">
                <th className="p-3 font-normal">Asset</th>
                <th className="p-3 font-normal text-right">Total</th>
                <th className="p-3 font-normal text-right">Available</th>
                <th className="p-3 font-normal text-right">In Order</th>
                <th className="p-3 font-normal text-right">BTC Value</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                  <td className="p-3 text-white font-medium">{asset.asset}</td>
                  <td className="p-3 text-white text-right">{asset.total}</td>
                  <td className="p-3 text-white text-right">{asset.available}</td>
                  <td className="p-3 text-indigo-300 text-right">{asset.inOrder}</td>
                  <td className="p-3 text-indigo-300 text-right">{asset.btcValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
