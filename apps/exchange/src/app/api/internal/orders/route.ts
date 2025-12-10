/**
 * FILE: apps/exchange/src/app/api/internal/orders/route.ts
 * PURPOSE: Internal API endpoint for order processing
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: @chipax/core, Next.js
 * 
 * DESCRIPTION:
 * Internal-only API route for processing orders through the matching engine.
 * Used by authenticated server-side components only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MatchingEngineService } from '@/services/MatchingEngineService';
import { OrderSide, OrderType, OrderStatus, TimeInForce } from '@chipatrade/core';
import type { Order, TradingPair, OrderId, UserId, Decimal, Timestamp } from '@chipatrade/core';
import { Some, None } from '@chipatrade/core';
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
const orderRequestSchema = z.object({
  userId: z.string(),
  symbol: z.enum(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT']),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['LIMIT', 'MARKET', 'STOP_LIMIT', 'STOP_MARKET']),
  price: z.string().optional(),
  stopPrice: z.string().optional(),
  quantity: z.string(),
  timeInForce: z.enum(['GTC', 'IOC', 'FOK', 'GTD']).default('GTC'),
  clientOrderId: z.string().optional(),
});

/**
 * POST /api/internal/orders
 * Processes a new order
 */
export async function POST(request: NextRequest) {
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
    const validation = orderRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as OrderId;
    const now = Date.now() as Timestamp;

    // Create order object
    const order: Order = {
      id: orderId,
      userId: data.userId as UserId,
      symbol: data.symbol as TradingPair,
      side: OrderSide[data.side],
      type: OrderType[data.type],
      status: OrderStatus.PENDING,
      price: data.price ? Some(data.price as Decimal) : None(),
      stopPrice: data.stopPrice ? Some(data.stopPrice as Decimal) : None(),
      quantity: data.quantity as Decimal,
      filledQuantity: '0' as Decimal,
      remainingQuantity: data.quantity as Decimal,
      timeInForce: TimeInForce[data.timeInForce],
      createdAt: now,
      updatedAt: now,
      expiresAt: None(),
      clientOrderId: data.clientOrderId ? Some(data.clientOrderId) : None(),
    };

    // Process order through matching engine
    const matchingService = MatchingEngineService.getInstance();
    const result = matchingService.processOrder(order);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    // Return result
    return NextResponse.json({
      order: result.value.updatedOrder,
      trades: result.value.trades,
    });
  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
