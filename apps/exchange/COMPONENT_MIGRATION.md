# Component Migration Guide

This guide shows how to update each component to use the ChipaTrade API.

## OrderBook Component

**Location:** `/src/components/trading/OrderBook.tsx`

### Current Implementation
Uses mock data

### Updated Implementation
```typescript
'use client';

import { useOrderBook } from '@/hooks/useTrading';

interface OrderBookProps {
  symbol?: string;
}

export default function OrderBook({ symbol = 'BTC' }: OrderBookProps) {
  const { orderBook, isLoading, error } = useOrderBook(symbol, 20, 1000);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading order book</div>;
  
  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];
  
  return (
    <div className="orderbook-container">
      {/* Asks (Sells) - reversed to show highest first */}
      {asks.reverse().map(([price, size], idx) => (
        <div key={`ask-${idx}`} className="ask-row">
          <span className="text-red-500">{price.toFixed(2)}</span>
          <span>{size.toFixed(6)}</span>
        </div>
      ))}
      
      {/* Spread */}
      <div className="spread">Spread</div>
      
      {/* Bids (Buys) */}
      {bids.map(([price, size], idx) => (
        <div key={`bid-${idx}`} className="bid-row">
          <span className="text-green-500">{price.toFixed(2)}</span>
          <span>{size.toFixed(6)}</span>
        </div>
      ))}
    </div>
  );
}
```

## Positions Component

**Location:** `/src/components/trading/Positions.tsx`

### Updated Implementation
```typescript
'use client';

import { usePositions, useTrading } from '@/hooks/useTrading';
import { useAuth } from '@/contexts/AuthContext';

export default function Positions() {
  const { isAuthenticated } = useAuth();
  const { positions, isLoading } = usePositions(5000);
  const { marketClose, isSubmitting } = useTrading();
  
  if (!isAuthenticated) {
    return <div className="p-4 text-center text-indigo-400">Login to view positions</div>;
  }
  
  if (isLoading) return <div>Loading positions...</div>;
  
  const handleClose = async (coin: string) => {
    try {
      await marketClose(coin);
    } catch (error) {
      console.error('Failed to close position:', error);
    }
  };
  
  return (
    <div className="positions-table">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Size</th>
            <th>Entry</th>
            <th>Mark</th>
            <th>PnL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position: any) => (
            <tr key={position.coin}>
              <td>{position.coin}</td>
              <td className={position.size > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(position.size).toFixed(4)}
              </td>
              <td>{position.entry_price?.toFixed(2)}</td>
              <td>{position.mark_price?.toFixed(2)}</td>
              <td className={position.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                ${position.unrealized_pnl?.toFixed(2)}
              </td>
              <td>
                <button 
                  onClick={() => handleClose(position.coin)}
                  disabled={isSubmitting}
                  className="btn-close"
                >
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {positions.length === 0 && (
        <div className="p-4 text-center text-indigo-400">No open positions</div>
      )}
    </div>
  );
}
```

## OrderHistory Component

**Location:** `/src/components/trading/OrderHistory.tsx`

### Updated Implementation
```typescript
'use client';

import { useState } from 'react';
import { useOrders, useFills, useTrading } from '@/hooks/useTrading';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'open' | 'history';

export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('open');
  
  const { orders, isLoading: ordersLoading } = useOrders(undefined, 3000);
  const { fills, isLoading: fillsLoading } = useFills(undefined, 50);
  const { cancelOrder, isSubmitting } = useTrading();
  
  if (!isAuthenticated) {
    return <div className="p-4 text-center text-indigo-400">Login to view orders</div>;
  }
  
  const handleCancel = async (coin: string, orderId: string) => {
    try {
      await cancelOrder(coin, orderId);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };
  
  return (
    <div className="order-history">
      {/* Tabs */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('open')}
          className={activeTab === 'open' ? 'active' : ''}
        >
          Open Orders
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history' ? 'active' : ''}
        >
          Order History
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'open' ? (
        <div className="open-orders">
          {ordersLoading ? (
            <div>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Filled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.order_id}>
                    <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                    <td>{order.coin}</td>
                    <td>{order.type}</td>
                    <td className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      {order.side}
                    </td>
                    <td>{order.price?.toFixed(2)}</td>
                    <td>{order.size?.toFixed(6)}</td>
                    <td>{order.filled_size?.toFixed(6)}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        onClick={() => handleCancel(order.coin, order.order_id)}
                        disabled={isSubmitting}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {orders.length === 0 && !ordersLoading && (
            <div className="p-4 text-center text-indigo-400">No open orders</div>
          )}
        </div>
      ) : (
        <div className="order-fills">
          {fillsLoading ? (
            <div>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {fills.map((fill: any) => (
                  <tr key={fill.fill_id}>
                    <td>{new Date(fill.timestamp).toLocaleString()}</td>
                    <td>{fill.coin}</td>
                    <td className={fill.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      {fill.side}
                    </td>
                    <td>{fill.price?.toFixed(2)}</td>
                    <td>{fill.size?.toFixed(6)}</td>
                    <td>${fill.fee?.toFixed(2)}</td>
                    <td>${(fill.price * fill.size)?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {fills.length === 0 && !fillsLoading && (
            <div className="p-4 text-center text-indigo-400">No trade history</div>
          )}
        </div>
      )}
    </div>
  );
}
```

## RecentTrades Component

**Location:** `/src/components/trading/RecentTrades.tsx`

### Updated Implementation
```typescript
'use client';

import { useFills } from '@/hooks/useTrading';

interface RecentTradesProps {
  symbol?: string;
}

export default function RecentTrades({ symbol = 'BTC' }: RecentTradesProps) {
  const { fills, isLoading } = useFills(symbol, 20);
  
  if (isLoading) return <div>Loading trades...</div>;
  
  return (
    <div className="recent-trades">
      <h3 className="text-sm font-semibold mb-2">Recent Trades</h3>
      <div className="trades-list">
        {fills.map((fill: any, idx: number) => (
          <div key={fill.fill_id || idx} className="trade-row">
            <span className={fill.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {fill.price?.toFixed(2)}
            </span>
            <span className="text-indigo-300">{fill.size?.toFixed(6)}</span>
            <span className="text-xs text-indigo-400">
              {new Date(fill.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      {fills.length === 0 && (
        <div className="p-4 text-center text-indigo-400">No recent trades</div>
      )}
    </div>
  );
}
```

## MarketsList Component

**Location:** `/src/components/layout/MarketsList.tsx`

### Updated Implementation
```typescript
'use client';

import { useMarketMeta, usePrice } from '@/hooks/useTrading';
import { useState } from 'react';

export default function MarketsList() {
  const { markets, isLoading } = useMarketMeta();
  const [selectedMarket, setSelectedMarket] = useState('BTC');
  
  if (isLoading) return <div>Loading markets...</div>;
  
  return (
    <div className="markets-list">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search markets..."
          className="search-input"
        />
      </div>
      
      <div className="markets-grid">
        {markets.map((market: any) => {
          const coin = market.symbol || market.coin;
          return (
            <MarketRow 
              key={coin} 
              coin={coin}
              isSelected={coin === selectedMarket}
              onClick={() => setSelectedMarket(coin)}
            />
          );
        })}
      </div>
    </div>
  );
}

function MarketRow({ coin, isSelected, onClick }: any) {
  const { price } = usePrice(coin, 5000);
  
  return (
    <div 
      className={`market-row ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="market-info">
        <span className="font-semibold">{coin}</span>
        <span className="text-xs text-indigo-400">/USDT</span>
      </div>
      <div className="market-price">
        <span className="text-white">{price?.toFixed(2) || '---'}</span>
      </div>
    </div>
  );
}
```

## Header Component (with Auth)

**Location:** `/src/components/layout/Header.tsx`

### Implementation with Authentication
```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useBalance } from '@/hooks/useTrading';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { balance } = useBalance();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  return (
    <header className="header">
      <div className="logo">ChipaX Exchange</div>
      
      <div className="header-right">
        {isAuthenticated ? (
          <>
            <div className="balance-display">
              <span className="text-indigo-400">Balance:</span>
              <span className="text-white font-semibold">
                ${balance?.available_balance?.toFixed(2) || '0.00'}
              </span>
            </div>
            
            <div className="user-menu">
              <span className="text-white">{user?.username}</span>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => setShowLoginModal(true)}
            className="btn-login"
          >
            Login / Register
          </button>
        )}
      </div>
      
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  );
}
```

## Key Points

1. **Always check authentication** - Use `useAuth()` hook
2. **Handle loading states** - Show loading indicators
3. **Handle errors gracefully** - Display error messages
4. **Use appropriate refresh intervals** - Balance data freshness vs API load
5. **Clean up subscriptions** - Hooks automatically handle cleanup
6. **Type safety** - Use TypeScript types from `/src/types/api.ts`

## Testing Each Component

After updating a component, test:
1. Loading state displays correctly
2. Data fetches and displays properly
3. Error states show appropriate messages
4. User interactions trigger correct API calls
5. Real-time updates work (if applicable)
6. Component handles unauthenticated state

## Common Issues

### "Cannot find module 'react'"
The TypeScript errors you're seeing are compilation issues. They should resolve when the project is built. If persistent, check your `tsconfig.json` and ensure React is installed.

### Data not updating
- Check refresh intervals in hooks
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure user is authenticated for protected routes

### Performance issues
- Increase refresh intervals
- Implement data caching
- Use React.memo for expensive components
- Consider WebSocket for real-time updates
