/**
 * FILE: apps/exchange/src/app/api/internal/orders/[orderId]/cancel/route.ts
 * PURPOSE: Internal API endpoint for order cancellation
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: @chipax/core, Next.js
 * 
 * DESCRIPTION:
 * Cancels an existing order through the matching engine.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MatchingEngineService } from '@/services/MatchingEngineService';
import type { OrderId, TradingPair } from '@chipatrade/core';
import { z } from 'zod';

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
 * Request schema
 */
const cancelRequestSchema = z.object({
  symbol: z.enum(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT']),
});

/**
 * POST /api/internal/orders/[orderId]/cancel
 * Cancels an order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Validate internal API key
    if (!validateInternalKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = cancelRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { symbol } = validation.data;
    const orderId = params.orderId as OrderId;

    // Cancel order
    const matchingService = MatchingEngineService.getInstance();
    const result = matchingService.cancelOrder(symbol as TradingPair, orderId);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 404 }
      );
    }

    // Return cancelled order
    return NextResponse.json({
      order: result.value,
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
