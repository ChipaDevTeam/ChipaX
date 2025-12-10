/**
 * FILE: apps/exchange/src/components/trading/Chart.tsx
 * PURPOSE: TradingView chart integration with custom datafeed
 * AUTHOR: ChipaTrade Core Team
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { datafeed } from '@/lib/tradingview-datafeed';

// TradingView types - available globally after script loads
declare const TradingView: any;

type ResolutionString = string;
type ChartingLibraryWidgetOptions = any;

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);
  const [resolution, setResolution] = useState<ResolutionString>('60' as ResolutionString);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: 'BTCUSDT',
      datafeed: datafeed,
      interval: resolution,
      container: chartContainerRef.current,
      library_path: '/charting_library/',
      locale: 'en',
      disabled_features: ['use_localstorage_for_settings', 'header_symbol_search'],
      enabled_features: ['study_templates'],
      custom_css_url: '/tradingview-custom.css',
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'chipax.exchange',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      theme: 'Dark',
      overrides: {
        // Main chart pane background
        'paneProperties.background': '#131149',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.backgroundGradientStartColor': '#131149',
        'paneProperties.backgroundGradientEndColor': '#131149',
        
        // Grid lines
        'paneProperties.vertGridProperties.color': '#1e1b5c',
        'paneProperties.horzGridProperties.color': '#1e1b5c',
        
        // Candle styles
        'mainSeriesProperties.candleStyle.upColor': '#22c55e',
        'mainSeriesProperties.candleStyle.downColor': '#ef4444',
        'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
        
        // Scale (axis) properties
        'scalesProperties.backgroundColor': '#131149',
        'scalesProperties.textColor': '#9ca3af',
        'scalesProperties.lineColor': '#1e1b5c',
        
        // Volume pane background
        'volumePaneSize': 'medium',
        
        // Toolbar background
        'symbolWatermarkProperties.color': 'rgba(99, 102, 241, 0.05)',
      },
      loading_screen: {
        backgroundColor: '#131149',
        foregroundColor: '#6366f1',
      },
    };

    // Access TradingView widget from global scope
    const TradingViewWidget = (window as any).TradingView?.widget;
    
    if (!TradingViewWidget) {
      console.error('TradingView library not loaded');
      setIsLoading(false);
      return;
    }

    tvWidgetRef.current = new TradingViewWidget(widgetOptions);

    tvWidgetRef.current.onChartReady(() => {
      console.log('TradingView chart ready');
      setIsLoading(false);
    });

    return () => {
      if (tvWidgetRef.current !== null) {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      }
    };
  }, [resolution]);

  const handleResolutionChange = (newResolution: ResolutionString) => {
    setResolution(newResolution);
    if (tvWidgetRef.current) {
      tvWidgetRef.current.setSymbol('BTCUSDT', newResolution, () => {
        console.log('Resolution changed to:', newResolution);
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131149] border border-[#1e1b5c] rounded">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e1b5c]">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-white">BTC/USDT</h3>
          <div className="flex items-center gap-2 text-xs">
            <button 
              onClick={() => handleResolutionChange('1' as ResolutionString)}
              className={resolution === '1' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              1m
            </button>
            <button 
              onClick={() => handleResolutionChange('5' as ResolutionString)}
              className={resolution === '5' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              5m
            </button>
            <button 
              onClick={() => handleResolutionChange('15' as ResolutionString)}
              className={resolution === '15' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              15m
            </button>
            <button 
              onClick={() => handleResolutionChange('60' as ResolutionString)}
              className={resolution === '60' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              1H
            </button>
            <button 
              onClick={() => handleResolutionChange('240' as ResolutionString)}
              className={resolution === '240' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              4H
            </button>
            <button 
              onClick={() => handleResolutionChange('1D' as ResolutionString)}
              className={resolution === '1D' ? 'text-indigo-400' : 'text-indigo-300 hover:text-white'}
            >
              1D
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-indigo-300 hover:text-white">Indicators</button>
          <button className="text-xs text-indigo-300 hover:text-white">Settings</button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131149] z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-indigo-300">Loading chart...</p>
            </div>
          </div>
        )}
        <div 
          ref={chartContainerRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
