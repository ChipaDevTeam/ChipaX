/**
 * FILE: apps/exchange/src/components/layout/Header.tsx
 * PURPOSE: Top navigation header with branding and user menu
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

export default function Header() {
  return (
    <header className="h-11 bg-[#131149] border-b border-[#1e1b5c] flex items-center justify-between px-3">
      {/* Logo */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            C
          </div>
          <span className="text-lg font-bold text-white">ChipaX</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 ml-6">
          <a href="/" className="text-xs text-indigo-200 hover:text-indigo-100 transition-colors">
            Trade
          </a>
          <a href="/markets" className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors">
            Markets
          </a>
          <a href="/wallet" className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors">
            Wallet
          </a>
          <a href="/orders" className="text-xs text-indigo-400 hover:text-indigo-200 transition-colors">
            Orders
          </a>
        </nav>
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 text-xs text-indigo-300 hover:text-indigo-100 transition-colors">
          Connect Wallet
        </button>
        <button className="px-3 py-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs rounded transition-colors">
          Sign In
        </button>
      </div>
    </header>
  );
}
