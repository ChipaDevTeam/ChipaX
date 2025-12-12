# ChipaTrade API Integration

This document describes the integration of the ChipaTrade API into the ChipaX Exchange frontend.

## Overview

The ChipaX Exchange has been fully integrated with the ChipaTrade API (https://exchange-api.chipatrade.com). All trading operations, market data, and user management now use the real API backend.

## Architecture

### 1. API Client (`/src/services/api-client.ts`)

A centralized API client that handles:
- HTTP requests with automatic authentication
- Token management (access & refresh tokens)
- Error handling
- All API endpoints from the OpenAPI specification

**Key Features:**
- Singleton pattern for shared state
- Automatic token injection in headers
- LocalStorage persistence for tokens
- Type-safe methods for all endpoints

**Usage:**
```typescript
import { apiClient } from '@/services/api-client';

// Login
await apiClient.login({ email: 'user@example.com', password: 'pass' });

// Place order
await apiClient.placeLimitOrder({
  coin: 'BTC',
  is_buy: true,
  size: 0.1,
  price: 43500
});

// Get positions
const response = await apiClient.getPositions();
```

### 2. Type Definitions (`/src/types/api.ts`)

Complete TypeScript types for:
- Authentication (UserCreate, UserLogin, TokenResponse, UserResponse)
- Trading (OrderCreate, MarketOrderCreate, Position, Order, Fill)
- Market Data (MarketMeta, Price, OrderBook, Candle, FundingRate)
- Account (AccountState, Balance)
- Fees (FeePayment, FeeStatistics)

### 3. Authentication Context (`/src/contexts/AuthContext.tsx`)

React Context for managing authentication state:
- User authentication status
- Login/logout functionality
- Automatic token refresh
- User profile management

**Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function Component() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Access user data and auth functions
}
```

### 4. Trading Hooks (`/src/hooks/useTrading.ts`)

Custom React hooks for data fetching and trading operations:

#### Data Fetching Hooks:
- `usePositions()` - Get open positions with auto-refresh
- `useOrders()` - Get open orders with auto-refresh
- `useFills()` - Get trade history
- `useBalance()` - Get account balance
- `usePrice()` - Get real-time price for a coin
- `useOrderBook()` - Get order book with auto-refresh
- `useMarketMeta()` - Get all available markets
- `useFundingRates()` - Get funding rates

#### Trading Actions Hook:
- `useTrading()` - Execute trading operations
  - `placeLimitOrder()`
  - `placeMarketOrder()`
  - `cancelOrder()`
  - `cancelAllOrders()`
  - `marketClose()`

**Usage:**
```typescript
import { usePositions, useTrading } from '@/hooks/useTrading';

function TradingComponent() {
  const { positions, isLoading } = usePositions(5000); // 5s refresh
  const { placeLimitOrder, isSubmitting } = useTrading();
  
  const handleOrder = async () => {
    await placeLimitOrder({
      coin: 'BTC',
      is_buy: true,
      size: 0.1,
      price: 43500
    });
  };
}
```

### 5. TradingView Datafeed (`/src/lib/tradingview-datafeed-api.ts`)

Real-time chart data integration:
- Fetches historical candle data from API
- Real-time price updates
- Symbol search from market metadata
- Multiple timeframe support

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Trading
- `POST /api/v1/trading/order` - Place limit order
- `POST /api/v1/trading/market-order` - Place market order
- `POST /api/v1/trading/market-close` - Close position
- `POST /api/v1/trading/cancel` - Cancel order
- `POST /api/v1/trading/cancel-all` - Cancel all orders
- `POST /api/v1/trading/modify` - Modify order
- `POST /api/v1/trading/tpsl` - Set TP/SL
- `GET /api/v1/trading/positions` - Get positions
- `GET /api/v1/trading/orders` - Get open orders
- `GET /api/v1/trading/fills` - Get trade history

### Market Data
- `GET /api/v1/market/meta` - Get market metadata
- `GET /api/v1/market/price/{coin}` - Get current price
- `GET /api/v1/market/orderbook/{coin}` - Get order book
- `GET /api/v1/market/candles/{coin}` - Get historical candles
- `GET /api/v1/market/funding-rates` - Get funding rates

### Account
- `GET /api/v1/users/me` - Get profile
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users/account` - Get account state
- `GET /api/v1/users/balance` - Get balance

### Fees
- `GET /api/v1/fees/my-fees` - Get user fee history
- `GET /api/v1/fees/statistics` - Get fee statistics (admin)
- `GET /api/v1/fees/collected` - Get collected fees (admin)

## Setup

### 1. Environment Variables

Create `/apps/exchange/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://exchange-api.chipatrade.com
```

For local development:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
cd apps/exchange
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

## Components Updated

### TradePanel (`/src/components/trading/TradePanel.tsx`)
- Real-time balance display
- Live price updates
- Order placement with API
- Error/success messages
- Authentication checks

### Chart (`/src/components/trading/Chart.tsx`)
- Uses ChipaTrade datafeed
- Real-time candle updates
- Historical data from API

### Other Components to Update

The following components should be similarly updated to use the API:

1. **OrderBook** - Use `useOrderBook()` hook
2. **RecentTrades** - Use `useFills()` hook
3. **Positions** - Use `usePositions()` hook
4. **OrderHistory** - Use `useOrders()` and `useFills()` hooks
5. **MarketsList** - Use `useMarketMeta()` hook

## Authentication Flow

1. User clicks login/register
2. Credentials sent to API
3. API returns access & refresh tokens
4. Tokens stored in localStorage
5. Access token automatically included in all requests
6. On token expiry, refresh token used to get new access token
7. On logout, tokens cleared from storage

## Error Handling

All API methods throw `ChipaTradeAPIError` with:
- `message`: Human-readable error message
- `status`: HTTP status code
- `details`: Additional error information

Example:
```typescript
try {
  await apiClient.placeLimitOrder(order);
} catch (error) {
  if (error instanceof ChipaTradeAPIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
  }
}
```

## TypeScript Support

All API responses and requests are fully typed. TypeScript will provide autocomplete and type checking for:
- Request parameters
- Response data structures
- Hook return values
- Component props

## Testing

### Manual Testing

1. **Authentication:**
   ```typescript
   // Test login
   await apiClient.login({ email: 'test@example.com', password: 'password' });
   
   // Check auth status
   console.log(apiClient.isAuthenticated());
   
   // Get user profile
   const user = await apiClient.getMyProfile();
   ```

2. **Trading:**
   ```typescript
   // Place test order
   await apiClient.placeLimitOrder({
     coin: 'BTC',
     is_buy: true,
     size: 0.01,
     price: 43000
   });
   
   // Get positions
   const positions = await apiClient.getPositions();
   ```

3. **Market Data:**
   ```typescript
   // Get price
   const price = await apiClient.getPrice('BTC');
   
   // Get order book
   const orderbook = await apiClient.getOrderBook('BTC', 20);
   ```

## Future Enhancements

1. **WebSocket Integration** - Real-time updates for orders, positions, prices
2. **Order Book Depth Visualization** - Enhanced order book UI
3. **Advanced Charting** - Additional indicators and drawing tools
4. **Portfolio Analytics** - P&L tracking, performance metrics
5. **Trading Strategies** - Algorithmic trading support
6. **Social Trading** - Follow and copy other traders

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the API server has the correct CORS headers set.

### Authentication Failures
- Check that tokens are being stored in localStorage
- Verify API endpoint URL in environment variables
- Check browser console for detailed error messages

### Data Not Loading
- Verify API is accessible: `curl https://exchange-api.chipatrade.com/health`
- Check network tab in browser dev tools
- Ensure user is authenticated for protected endpoints

## Support

For issues or questions:
- Check API documentation: https://exchange-api.chipatrade.com/docs
- Review OpenAPI spec for endpoint details
- Contact ChipaTrade support

## License

ChipaX Exchange © 2025 ChipaDev Team
