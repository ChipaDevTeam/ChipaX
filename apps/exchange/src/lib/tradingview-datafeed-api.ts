/**
 * TradingView Datafeed Implementation with ChipaTrade API
 * Provides real-time and historical data from ChipaTrade
 */

import { apiClient } from '@/services/api-client';

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
    { value: 'ChipaTrade', name: 'ChipaTrade', desc: 'ChipaTrade Exchange' },
  ],
  symbols_types: [
    { name: 'crypto', value: 'crypto' },
  ],
};

// Resolution mapping for API
const resolutionMap: Record<string, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  'D': '1d',
};

export class ChipaTradeDatafeed implements IBasicDataFeed {
  private lastBarsCache = new Map<string, Bar>();
  private symbolsCache: SymbolConfig[] | null = null;
  private subscriptions = new Map<string, any>();

  onReady(callback: (configuration: any) => void): void {
    console.log('[ChipaTrade Datafeed] onReady called');
    setTimeout(() => callback(configurationData), 0);
  }

  async searchSymbols(
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: SearchSymbolsCallback
  ): Promise<void> {
    console.log('[ChipaTrade Datafeed] searchSymbols:', userInput);
    
    try {
      // Get market meta from API
      if (!this.symbolsCache) {
        const response = await apiClient.getMarketMeta();
        const markets = response.data || [];
        
        this.symbolsCache = markets.map((market: any) => ({
          symbol: market.symbol || market.coin,
          full_name: `ChipaTrade:${market.symbol || market.coin}`,
          description: `${market.base_currency || market.coin} / ${market.quote_currency || 'USDT'}`,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          ticker: market.symbol || market.coin,
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          currency_code: market.quote_currency || 'USDT',
        }));
      }

      const symbols = (this.symbolsCache || []).filter(symbol => {
        return symbol.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
               symbol.description.toLowerCase().includes(userInput.toLowerCase());
      });
      
      const result = symbols.map(symbol => ({
        symbol: symbol.symbol,
        full_name: symbol.full_name,
        description: symbol.description,
        exchange: 'ChipaTrade',
        ticker: symbol.ticker,
        type: symbol.type,
      }));
      
      onResult(result);
    } catch (error) {
      console.error('[ChipaTrade Datafeed] searchSymbols error:', error);
      onResult([]);
    }
  }

  async resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): Promise<void> {
    console.log('[ChipaTrade Datafeed] resolveSymbol:', symbolName);
    
    try {
      // Get market meta from API
      const response = await apiClient.getMarketMeta();
      let markets = response.data || [];
      
      // Ensure markets is an array
      if (!Array.isArray(markets)) {
        console.warn('[ChipaTrade Datafeed] markets is not an array, using empty array');
        markets = [];
      }
      
      // If no markets from API, use default symbols
      if (markets.length === 0) {
        markets = [
          { symbol: 'BTC', coin: 'BTC', base_currency: 'BTC', quote_currency: 'USDT' },
          { symbol: 'ETH', coin: 'ETH', base_currency: 'ETH', quote_currency: 'USDT' },
          { symbol: 'SOL', coin: 'SOL', base_currency: 'SOL', quote_currency: 'USDT' },
        ];
      }
      
      const marketInfo = markets.find((m: any) => 
        (m.symbol || m.coin) === symbolName || 
        (m.symbol || m.coin) === symbolName.replace('USDT', '') ||
        (m.symbol || m.coin) === symbolName.replace('USD', '')
      );
      
      if (!marketInfo) {
        // Use default symbol info if not found
        const symbol = symbolName.replace('USDT', '').replace('USD', '');
        const resolvedSymbol: LibrarySymbolInfo = {
          name: symbol,
          description: `${symbol} / USDT`,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          ticker: symbol,
          exchange: 'ChipaTrade',
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: true,
          supported_resolutions: supportedResolutions,
          volume_precision: 2,
          data_status: 'streaming',
          currency_code: 'USDT',
          format: 'price',
          listed_exchange: 'ChipaTrade',
          full_name: `ChipaTrade:${symbol}`,
        };
        setTimeout(() => onResolve(resolvedSymbol), 0);
        return;
      }

      const symbol = marketInfo.symbol || marketInfo.coin;
      
      const resolvedSymbol: LibrarySymbolInfo = {
        name: symbol,
        description: `${marketInfo.base_currency || symbol} / ${marketInfo.quote_currency || 'USDT'}`,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        ticker: symbol,
        exchange: 'ChipaTrade',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: supportedResolutions,
        volume_precision: 2,
        data_status: 'streaming',
        currency_code: marketInfo.quote_currency || 'USDT',
        format: 'price',
        listed_exchange: 'ChipaTrade',
        full_name: `ChipaTrade:${symbol}`,
      };
      
      setTimeout(() => onResolve(resolvedSymbol), 0);
    } catch (error) {
      console.error('[ChipaTrade Datafeed] resolveSymbol error:', error);
      onError('Failed to resolve symbol');
    }
  }

  async getBars(
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
  ): Promise<void> {
    console.log('[ChipaTrade Datafeed] getBars:', symbolInfo.name, resolution, periodParams);
    
    try {
      const interval = resolutionMap[resolution] || '1h';
      const coin = symbolInfo.name;
      
      // Try to get candles from API
      let bars: Bar[] = [];
      
      const response = await apiClient.getCandles(
        coin,
        interval,
        periodParams.from * 1000,
        periodParams.to * 1000
      );
      
      let candles = response.data || [];
      
      // Ensure candles is an array
      if (!Array.isArray(candles)) {
        console.warn('[ChipaTrade Datafeed] candles is not an array, using empty array');
        candles = [];
      }
      
      if (candles.length > 0) {
        bars = candles.map((candle: any) => ({
          time: candle.time || candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume || 0,
        }));
        
        // Cache the last bar for real-time updates
        const lastBar = bars[bars.length - 1];
        this.lastBarsCache.set(`${symbolInfo.name}_${resolution}`, lastBar);
      }
      
      onResult(bars, { noData: bars.length === 0 });
    } catch (error) {
      console.error('[ChipaTrade Datafeed] getBars error:', error);
      onError('Failed to fetch candles from API');
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void
  ): void {
    console.log('[ChipaTrade Datafeed] subscribeBars:', symbolInfo.name, resolution, listenerGuid);
    
    const cacheKey = `${symbolInfo.name}_${resolution}`;
    
    // Poll for price updates
    const updateInterval = setInterval(async () => {
      try {
        const response = await apiClient.getPrice(symbolInfo.name);
        const currentPrice = response.data?.price;
        
        if (currentPrice) {
          const lastBar = this.lastBarsCache.get(cacheKey);
          const now = Date.now();
          
          let newBar: Bar;
          
          if (lastBar) {
            // Check if we need to create a new bar or update the existing one
            const barDuration = this.getBarDuration(resolution);
            const timeSinceLastBar = now - lastBar.time;
            
            if (timeSinceLastBar >= barDuration) {
              // Create new bar
              newBar = {
                time: now,
                open: currentPrice,
                high: currentPrice,
                low: currentPrice,
                close: currentPrice,
                volume: 0,
              };
            } else {
              // Update existing bar
              newBar = {
                ...lastBar,
                high: Math.max(lastBar.high, currentPrice),
                low: Math.min(lastBar.low, currentPrice),
                close: currentPrice,
              };
            }
          } else {
            // First bar
            newBar = {
              time: now,
              open: currentPrice,
              high: currentPrice,
              low: currentPrice,
              close: currentPrice,
              volume: 0,
            };
          }
          
          this.lastBarsCache.set(cacheKey, newBar);
          onTick(newBar);
        }
      } catch (error) {
        console.error('[ChipaTrade Datafeed] subscribeBars update error:', error);
      }
    }, 2000); // Update every 2 seconds
    
    this.subscriptions.set(listenerGuid, updateInterval);
  }

  unsubscribeBars(listenerGuid: string): void {
    console.log('[ChipaTrade Datafeed] unsubscribeBars:', listenerGuid);
    
    const interval = this.subscriptions.get(listenerGuid);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(listenerGuid);
    }
  }

  private getBarDuration(resolution: ResolutionString): number {
    // Return duration in milliseconds
    switch (resolution) {
      case '1': return 60 * 1000;
      case '5': return 5 * 60 * 1000;
      case '15': return 15 * 60 * 1000;
      case '30': return 30 * 60 * 1000;
      case '60': return 60 * 60 * 1000;
      case '240': return 4 * 60 * 60 * 1000;
      case '1D':
      case 'D': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

}

export const datafeed = new ChipaTradeDatafeed();
