/**
 * FILE: apps/exchange/src/app/api/internal/orderbook/route.ts
 * PURPOSE: Internal API endpoint for order book data
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: @chipax/core, Next.js
 * 
 * DESCRIPTION:
 * Returns order book snapshot for a trading pair.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MatchingEngineService } from '@/services/MatchingEngineService';
import type { TradingPair } from '@chipatrade/core';

/**
 * Validates internal API key
 */
function validateInternalKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-internal-api-key');
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  if (!expectedKey) {
    console.error('INTERNAL_API_KEY not configured');
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * GET /api/internal/orderbook?symbol=BTC/USDT&depth=20
 * Gets order book snapshot
 */
export async function GET(request: NextRequest) {
  try {
    // Validate internal API key
    if (!validateInternalKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC/USDT';
    const depth = parseInt(searchParams.get('depth') || '20', 10);

    // Validate symbol
    const validSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT'];
    if (!validSymbols.includes(symbol)) {
      return NextResponse.json(
        { error: 'Invalid symbol' },
        { status: 400 }
      );
    }

    // Get order book snapshot
    const matchingService = MatchingEngineService.getInstance();
    const result = matchingService.getOrderBookSnapshot(symbol as TradingPair, depth);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    // Return snapshot
    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Order book fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
