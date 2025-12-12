/**
 * FILE: apps/exchange/src/components/trading/Positions.tsx
 * PURPOSE: Display user's open positions and balances
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';
import { usePositions, useBalance } from '@/hooks/useTrading';

type TabType = 'positions' | 'assets';

export default function Positions() {
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const { positions, isLoading: positionsLoading, error: positionsError } = usePositions(1000);
  const { balance, isLoading: balanceLoading } = useBalance();

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
          Positions ({positions.length})
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
          {positionsLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Loading positions...</p>
            </div>
          ) : positionsError ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-red-400 text-sm">Failed to load positions</p>
            </div>
          ) : positions.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Symbol</th>
                  <th className="p-3 font-normal">Side</th>
                  <th className="p-3 font-normal">Size</th>
                  <th className="p-3 font-normal">Entry Price</th>
                  <th className="p-3 font-normal">Leverage</th>
                  <th className="p-3 font-normal">Margin Used</th>
                  <th className="p-3 font-normal">PnL</th>
                  <th className="p-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const pnl = position.return_on_equity || position.unrealized_pnl || 0;
                  const isProfit = pnl >= 0;
                  return (
                    <tr key={position.coin} className="border-b border-[#1e1b5c] hover:bg-[#1a1660]/30">
                      <td className="p-3 text-white font-medium">{position.coin}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            parseFloat(position.szi) >= 0
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {parseFloat(position.szi) >= 0 ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="p-3 text-white">{Math.abs(parseFloat(position.szi)).toFixed(6)}</td>
                      <td className="p-3 text-white">${parseFloat(position.entry_px || '0').toFixed(2)}</td>
                      <td className="p-3 text-white">{parseFloat(position.leverage || '1').toFixed(1)}x</td>
                      <td className="p-3 text-white">${parseFloat(position.margin_used || '0').toFixed(2)}</td>
                      <td className={`p-3 ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}{pnl.toFixed(2)}%
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
          {balanceLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Loading balances...</p>
            </div>
          ) : balance ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[#1e1b5c] sticky top-0 bg-[#131149]">
                <tr className="text-indigo-400 text-left">
                  <th className="p-3 font-normal">Summary</th>
                  <th className="p-3 font-normal text-right">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1e1b5c]">
                  <td className="p-3 text-white font-medium">Total Account Value</td>
                  <td className="p-3 text-white text-right">${balance.total_account_value?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="border-b border-[#1e1b5c]">
                  <td className="p-3 text-white font-medium">Available Balance</td>
                  <td className="p-3 text-green-400 text-right">${balance.available_balance?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="border-b border-[#1e1b5c]">
                  <td className="p-3 text-white font-medium">Margin Used</td>
                  <td className="p-3 text-yellow-400 text-right">${balance.margin_used?.toFixed(2) || '0.00'}</td>
                </tr>
                <tr className="border-b border-[#1e1b5c]">
                  <td className="p-3 text-white font-medium">Withdrawable Balance</td>
                  <td className="p-3 text-indigo-300 text-right">${balance.withdrawable_balance?.toFixed(2) || '0.00'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-indigo-400 text-sm">Please sign in to view balances</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
