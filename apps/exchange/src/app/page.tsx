import Header from '@/components/layout/Header';
import TickerStrip from '@/components/layout/TickerStrip';
import MarketsList from '@/components/layout/MarketsList';
import OrderBook from '@/components/trading/OrderBook';
import Chart from '@/components/trading/Chart';
import TradePanel from '@/components/trading/TradePanel';
import RecentTrades from '@/components/trading/RecentTrades';
import OrderHistory from '@/components/trading/OrderHistory';
import Positions from '@/components/trading/Positions';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-[#131149]">
      {/* Header */}
      <Header />
      
      {/* Ticker Strip */}
      <TickerStrip />

      {/* Main Trading Interface */}
      <div className="flex-1 flex gap-1 p-1 overflow-hidden">
        {/* Far Left - Markets List (Compact) */}
        <div className="w-44">
          <MarketsList />
        </div>

        {/* Center Column - Chart takes most space */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Chart - Maximum vertical space */}
          <div className="flex-1 min-h-0">
            <Chart />
          </div>
          {/* Bottom panels - Very compact side by side */}
          <div className="h-28 flex gap-1">
            <div className="flex-1">
              <Positions />
            </div>
            <div className="flex-1">
              <OrderHistory />
            </div>
          </div>
        </div>

        {/* Right Column - Order Book, Trade Panel, Recent Trades */}
        <div className="w-60 flex flex-col gap-1">
          <div className="h-72">
            <OrderBook />
          </div>
          <div className="flex-1 min-h-0">
            <TradePanel />
          </div>
          <div className="h-56">
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
