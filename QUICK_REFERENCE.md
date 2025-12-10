# ChipaX Exchange - Quick Reference Guide

## 🚀 Running the Application

```powershell
# Start development server
cd e:\chipa\ChipaX\apps\exchange
npm run dev

# Access the application
Open browser: http://localhost:3000
```

## 📂 Project Structure

```
ChipaX/
├── apps/
│   └── exchange/                    # Next.js Trading App
│       ├── src/
│       │   ├── app/                # Next.js App Router
│       │   │   ├── api/internal/  # Internal API routes
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── layout/        # Layout components
│       │   │   └── trading/       # Trading components
│       │   └── services/
│       │       └── MatchingEngineService.ts
│       └── .env.local
├── packages/
│   ├── core/                       # Core matching engine
│   │   └── dist/                  # Built output
│   └── database/
│       └── prisma/
└── config/
    ├── exchange.json
    ├── trading-pairs.json
    └── api-limits.json
```

## 🧩 Components Overview

### Layout Components
| Component | Path | Purpose |
|-----------|------|---------|
| Header | `layout/Header.tsx` | Top navigation with branding |
| TickerStrip | `layout/TickerStrip.tsx` | Price ticker with 24h stats |
| MarketsList | `layout/MarketsList.tsx` | Trading pairs sidebar |

### Trading Components
| Component | Path | Purpose |
|-----------|------|---------|
| OrderBook | `trading/OrderBook.tsx` | Live order book display |
| Chart | `trading/Chart.tsx` | Chart placeholder (TradingView) |
| TradePanel | `trading/TradePanel.tsx` | Buy/Sell order form |
| RecentTrades | `trading/RecentTrades.tsx` | Recent trades feed |
| OrderHistory | `trading/OrderHistory.tsx` | User's orders table |
| Positions | `trading/Positions.tsx` | Positions & balances |

## 🔌 API Endpoints

### Internal API (Backend Only)
```typescript
// Create Order
POST /api/internal/orders
Headers: { "x-internal-api-key": "dev-internal-key-123456" }
Body: {
  userId: string,
  symbol: "BTC/USDT" | "ETH/USDT" | "SOL/USDT" | "XRP/USDT",
  side: "BUY" | "SELL",
  type: "LIMIT" | "MARKET",
  price?: string,
  quantity: string
}

// Cancel Order
POST /api/internal/orders/[orderId]/cancel
Headers: { "x-internal-api-key": "dev-internal-key-123456" }
Body: { symbol: string }

// Get Order Book
GET /api/internal/orderbook?symbol=BTC/USDT&depth=20
Headers: { "x-internal-api-key": "dev-internal-key-123456" }
```

## 🎨 Color System

```css
/* Backgrounds */
--bg-main: #0a0e1a;        /* Page background */
--bg-panel: #0d1117;       /* Panel background */
--bg-hover: rgba(31, 41, 55, 0.5);  /* Hover state */

/* Borders */
--border: #1f2937;         /* gray-800 */

/* Trading Colors */
--green: #10b981;          /* Buy / Profit / Up */
--red: #ef4444;            /* Sell / Loss / Down */
--blue: #3b82f6;           /* Active / Info */

/* Text */
--text-primary: #ffffff;
--text-secondary: #9ca3af;
--text-muted: #6b7280;
```

## 🔧 Common Tasks

### Add a New Component
```typescript
// 1. Create component file
// apps/exchange/src/components/trading/NewComponent.tsx

'use client';

export default function NewComponent() {
  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded">
      {/* Component content */}
    </div>
  );
}

// 2. Import in page.tsx
import NewComponent from '@/components/trading/NewComponent';

// 3. Add to layout
<NewComponent />
```

### Connect to API
```typescript
// In your component
const handlePlaceOrder = async () => {
  try {
    const response = await fetch('/api/internal/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY!,
      },
      body: JSON.stringify(orderData),
    });
    
    const result = await response.json();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Fetch Order Book
```typescript
const fetchOrderBook = async (symbol: string) => {
  const response = await fetch(
    `/api/internal/orderbook?symbol=${symbol}&depth=20`,
    {
      headers: {
        'x-internal-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY!,
      },
    }
  );
  
  const orderBook = await response.json();
  return orderBook;
};
```

## 🧪 Testing

```powershell
# Test API endpoint
cd apps/exchange
node test-api.ts

# Or use curl
curl -X POST http://localhost:3000/api/internal/orders `
  -H "Content-Type: application/json" `
  -H "x-internal-api-key: dev-internal-key-123456" `
  -d '{"userId":"test","symbol":"BTC/USDT","side":"BUY","type":"LIMIT","price":"43000","quantity":"0.1"}'
```

## 📦 Build & Deploy

```powershell
# Build core package
cd packages/core
npm run build

# Build Next.js app
cd apps/exchange
npm run build

# Start production server
npm start
```

## 🐛 Common Issues

### Issue: "Cannot find module '@chipatrade/core'"
**Solution:**
```powershell
cd packages/core
npm run build
cd ../..
npm install
```

### Issue: "Port 3000 already in use"
**Solution:**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Or use different port
npm run dev -- -p 3001
```

### Issue: TypeScript errors in components
**Solution:**
```powershell
# Check tsconfig.json paths
# Restart TypeScript server in VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 📈 Next Steps

### Option 1: Connect UI to Backend
1. Add order placement functionality
2. Fetch real order book data
3. Display user balances
4. Implement order cancellation

### Option 2: Add WebSocket
1. Create WebSocket server
2. Stream order book updates
3. Broadcast trades
4. Real-time price updates

### Option 3: Database Integration
1. Start Docker containers
2. Run Prisma migrations
3. Store orders in database
4. Persist user data

### Option 4: TradingView Chart
1. Download TradingView library
2. Create datafeed
3. Integrate with Chart component
4. Add indicators and tools

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **TailwindCSS:** https://tailwindcss.com/docs
- **TradingView:** https://www.tradingview.com/charting-library-docs/
- **Prisma:** https://www.prisma.io/docs

---

**Current Status:** UI Complete, API Functional, Ready for Real-time Integration! 🎉
