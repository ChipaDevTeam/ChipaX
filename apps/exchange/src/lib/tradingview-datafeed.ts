/**
 * TradingView Datafeed Implementation
 * Provides real-time and historical data to TradingView charts
 */

// Types will be available globally after TradingView script loads
type IBasicDataFeed = any;
type LibrarySymbolInfo = any;
type ResolutionString = string;
type Bar = any;
type HistoryCallback = any;
type SubscribeBarsCallback = any;
type SearchSymbolsCallback = any;
type ResolveCallback = any;
type ErrorCallback = any;

interface SymbolConfig {
  symbol: string;
  full_name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  ticker: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  currency_code: string;
}

const supportedResolutions = ['1', '5', '15', '30', '60', '240', '1D'] as ResolutionString[];

const configurationData = {
  supported_resolutions: supportedResolutions,
  exchanges: [
    { value: 'ChipaX', name: 'ChipaX', desc: 'ChipaX Exchange' },
  ],
  symbols_types: [
    { name: 'crypto', value: 'crypto' },
  ],
};

// Mock symbol database
const symbolsDatabase: Record<string, SymbolConfig> = {
  'BTCUSDT': {
    symbol: 'BTCUSDT',
    full_name: 'ChipaX:BTCUSDT',
    description: 'Bitcoin / USDT',
    type: 'crypto',
    session: '24x7',
    timezone: 'Etc/UTC',
    ticker: 'BTCUSDT',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    has_daily: true,
    has_weekly_and_monthly: true,
    currency_code: 'USDT',
  },
  'ETHUSDT': {
    symbol: 'ETHUSDT',
    full_name: 'ChipaX:ETHUSDT',
    description: 'Ethereum / USDT',
    type: 'crypto',
    session: '24x7',
    timezone: 'Etc/UTC',
    ticker: 'ETHUSDT',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    has_daily: true,
    has_weekly_and_monthly: true,
    currency_code: 'USDT',
  },
  'SOLUSDT': {
    symbol: 'SOLUSDT',
    full_name: 'ChipaX:SOLUSDT',
    description: 'Solana / USDT',
    type: 'crypto',
    session: '24x7',
    timezone: 'Etc/UTC',
    ticker: 'SOLUSDT',
    minmov: 1,
    pricescale: 100,
    has_intraday: true,
    has_daily: true,
    has_weekly_and_monthly: true,
    currency_code: 'USDT',
  },
};

// Generate realistic candle data
function generateCandleData(symbol: string, from: number, to: number, resolution: string): Bar[] {
  const bars: Bar[] = [];
  
  // Base prices for different symbols
  const basePrices: Record<string, number> = {
    'BTCUSDT': 43500,
    'ETHUSDT': 2280,
    'SOLUSDT': 98.5,
  };
  
  const basePrice = basePrices[symbol] || 100;
  
  // Calculate interval in seconds
  let intervalSeconds = 60; // 1 minute default
  if (resolution === '5') intervalSeconds = 300;
  else if (resolution === '15') intervalSeconds = 900;
  else if (resolution === '30') intervalSeconds = 1800;
  else if (resolution === '60') intervalSeconds = 3600;
  else if (resolution === '240') intervalSeconds = 14400;
  else if (resolution === '1D' || resolution === 'D') intervalSeconds = 86400;
  
  let currentTime = from;
  let currentPrice = basePrice;
  
  while (currentTime < to) {
    // Generate realistic price movement
    const volatility = basePrice * 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    bars.push({
      time: currentTime * 1000, // TradingView expects milliseconds
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000 + 500,
    });
    
    currentPrice = close;
    currentTime += intervalSeconds;
  }
  
  return bars;
}

export class TradingViewDatafeed implements IBasicDataFeed {
  private lastBarsCache = new Map<string, Bar>();

  onReady(callback: (configuration: any) => void): void {
    console.log('[Datafeed] onReady called');
    setTimeout(() => callback(configurationData), 0);
  }

  searchSymbols(
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    console.log('[Datafeed] searchSymbols:', userInput);
    
    const symbols = Object.values(symbolsDatabase).filter(symbol => {
      return symbol.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
             symbol.description.toLowerCase().includes(userInput.toLowerCase());
    });
    
    const result = symbols.map(symbol => ({
      symbol: symbol.symbol,
      full_name: symbol.full_name,
      description: symbol.description,
      exchange: 'ChipaX',
      ticker: symbol.ticker,
      type: symbol.type,
    }));
    
    onResult(result);
  }

  resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): void {
    console.log('[Datafeed] resolveSymbol:', symbolName);
    
    const symbolInfo = symbolsDatabase[symbolName];
    
    if (!symbolInfo) {
      onError('Symbol not found');
      return;
    }
    
    const resolvedSymbol: LibrarySymbolInfo = {
      name: symbolInfo.symbol,
      description: symbolInfo.description,
      type: symbolInfo.type,
      session: symbolInfo.session,
      timezone: symbolInfo.timezone,
      ticker: symbolInfo.ticker,
      exchange: 'ChipaX',
      minmov: symbolInfo.minmov,
      pricescale: symbolInfo.pricescale,
      has_intraday: symbolInfo.has_intraday,
      has_daily: symbolInfo.has_daily,
      has_weekly_and_monthly: symbolInfo.has_weekly_and_monthly,
      supported_resolutions: supportedResolutions,
      volume_precision: 2,
      data_status: 'streaming',
      currency_code: symbolInfo.currency_code,
      format: 'price',
      listed_exchange: 'ChipaX',
      full_name: symbolInfo.full_name,
    };
    
    setTimeout(() => onResolve(resolvedSymbol), 0);
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: {
      from: number;
      to: number;
      firstDataRequest: boolean;
      countBack?: number;
    },
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    console.log('[Datafeed] getBars:', symbolInfo.name, resolution, periodParams);
    
    try {
      const bars = generateCandleData(
        symbolInfo.name,
        periodParams.from,
        periodParams.to,
        resolution
      );
      
      if (bars.length > 0) {
        const lastBar = bars[bars.length - 1];
        this.lastBarsCache.set(`${symbolInfo.name}_${resolution}`, lastBar);
      }
      
      onResult(bars, { noData: bars.length === 0 });
    } catch (error) {
      console.error('[Datafeed] getBars error:', error);
      onError('Failed to get bars');
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void
  ): void {
    console.log('[Datafeed] subscribeBars:', symbolInfo.name, resolution, listenerGuid);
    
    // Simulate real-time updates
    const cacheKey = `${symbolInfo.name}_${resolution}`;
    const intervalMs = resolution === '1D' ? 60000 : 5000; // Update every 5s for intraday, 1m for daily
    
    const updateInterval = setInterval(() => {
      const lastBar = this.lastBarsCache.get(cacheKey);
      
      if (lastBar) {
        const basePrices: Record<string, number> = {
          'BTCUSDT': 43500,
          'ETHUSDT': 2280,
          'SOLUSDT': 98.5,
        };
        
        const basePrice = basePrices[symbolInfo.name] || 100;
        const volatility = basePrice * 0.001;
        const change = (Math.random() - 0.5) * volatility;
        
        const newBar: Bar = {
          time: Date.now(),
          open: lastBar.close,
          high: Math.max(lastBar.close, lastBar.close + change) + Math.random() * volatility * 0.3,
          low: Math.min(lastBar.close, lastBar.close + change) - Math.random() * volatility * 0.3,
          close: lastBar.close + change,
          volume: Math.random() * 100 + 50,
        };
        
        this.lastBarsCache.set(cacheKey, newBar);
        onTick(newBar);
      }
    }, intervalMs);
    
    // Store interval for cleanup
    (this as any)[`interval_${listenerGuid}`] = updateInterval;
  }

  unsubscribeBars(listenerGuid: string): void {
    console.log('[Datafeed] unsubscribeBars:', listenerGuid);
    
    const interval = (this as any)[`interval_${listenerGuid}`];
    if (interval) {
      clearInterval(interval);
      delete (this as any)[`interval_${listenerGuid}`];
    }
  }
}

export const datafeed = new TradingViewDatafeed();
