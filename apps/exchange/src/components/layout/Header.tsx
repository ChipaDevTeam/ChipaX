/**
 * FILE: apps/exchange/src/components/layout/Header.tsx
 * PURPOSE: Top navigation header with branding and user menu
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useTrading';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance } = useBalance();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="h-14 bg-gradient-to-r from-[#0f0d3d] via-[#131149] to-[#0f0d3d] border-b border-[#2d2a6f] flex items-center justify-between px-4 shadow-lg">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-lg group-hover:shadow-indigo-500/50 transition-all">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200">C</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 text-transparent bg-clip-text">
                ChipaX
              </span>
              <div className="text-[8px] text-indigo-400 font-semibold tracking-wider -mt-1">EXCHANGE</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <a 
              href="/" 
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600/30 rounded hover:bg-indigo-600/50 transition-all"
            >
              Trade
            </a>
            <a 
              href="/markets" 
              className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white hover:bg-indigo-600/30 rounded transition-all"
            >
              Markets
            </a>
            <a 
              href="/wallet" 
              className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white hover:bg-indigo-600/30 rounded transition-all"
            >
              Wallet
            </a>
            <a 
              href="/orders" 
              className="px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white hover:bg-indigo-600/30 rounded transition-all"
            >
              Orders
            </a>
          </nav>
        </div>

        {/* Right side - Auth & Balance */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Account Summary */}
              <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 bg-[#0a0836]/80 border border-[#2d2a6f] rounded-lg backdrop-blur-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] text-indigo-400 uppercase tracking-wider">Total Balance</span>
                  <span className="text-sm font-bold text-white">
                    ${balance?.total_account_value?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="w-px h-8 bg-[#2d2a6f]" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-green-400 uppercase tracking-wider">Available</span>
                  <span className="text-sm font-semibold text-green-400">
                    ${balance?.available_balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="w-px h-8 bg-[#2d2a6f]" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-yellow-400 uppercase tracking-wider">In Use</span>
                  <span className="text-sm font-semibold text-yellow-400">
                    ${balance?.margin_used?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Compact Balance for Mobile/Tablet */}
              <div className="flex lg:hidden items-center gap-2 px-3 py-1.5 bg-[#0a0836]/80 border border-[#2d2a6f] rounded-lg">
                <span className="text-[9px] text-indigo-400">Balance:</span>
                <span className="text-sm font-bold text-white">
                  ${balance?.available_balance?.toFixed(2) || '0.00'}
                </span>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0836]/80 border border-[#2d2a6f] rounded-lg hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:shadow-indigo-500/50">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-white font-medium">{user?.username}</span>
                  <svg className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0f0d3d] border border-[#2d2a6f] rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-[#2d2a6f] bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                      <div className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Account</div>
                      <div className="text-sm text-white font-semibold">{user?.username}</div>
                      <div className="text-xs text-indigo-300 truncate">{user?.email}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <div className="h-px bg-[#2d2a6f] my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Login/Register Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
