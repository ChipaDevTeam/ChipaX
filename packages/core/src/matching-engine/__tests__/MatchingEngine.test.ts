/**
 * FILE: packages/core/src/matching-engine/__tests__/MatchingEngine.test.ts
 * PURPOSE: Test suite for matching engine functionality
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Jest, MatchingEngine
 * 
 * DESCRIPTION:
 * Comprehensive test suite covering:
 * - Order matching (price-time priority)
 * - Partial fills
 * - Self-trade prevention
 * - Order book management
 */

import { MatchingEngine } from '../MatchingEngine';
import { OrderSide, OrderType, OrderStatus, TimeInForce } from '../../types/Order';
import type { Order, TradingPair, Decimal, OrderId, UserId } from '../../types/Order';
import { Some, None } from '../../types/Result';
import * as DecimalUtils from '../../utils/Decimal';

/**
 * Helper: Creates a test order
 */
function createTestOrder(params: {
  userId: string;
  side: OrderSide;
  price?: string;
  quantity: string;
  orderId?: string;
}): Order {
  const orderId = (params.orderId || `ORDER-${Date.now()}-${Math.random()}`) as OrderId;
  const userId = params.userId as UserId;
  const quantity = params.quantity as Decimal;
  
  return {
    id: orderId,
    userId,
    symbol: 'BTC/USDT' as TradingPair,
    side: params.side,
    type: OrderType.LIMIT,
    status: OrderStatus.PENDING,
    price: params.price ? Some(params.price as Decimal) : None(),
    stopPrice: None(),
    quantity,
    filledQuantity: DecimalUtils.ZERO,
    remainingQuantity: quantity,
    timeInForce: TimeInForce.GTC,
    createdAt: Date.now() as import('../../types/Order').Timestamp,
    updatedAt: Date.now() as import('../../types/Order').Timestamp,
    expiresAt: None(),
    clientOrderId: None(),
  };
}

describe('MatchingEngine', () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine('BTC/USDT' as TradingPair);
  });

  describe('Order Book Management', () => {
    it('should add buy order to order book', () => {
      const order = createTestOrder({
        userId: 'user1',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      });

      const result = engine.processOrder(order);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(0);
        expect(result.value.updatedOrder.status).toBe(OrderStatus.OPEN);
      }
    });

    it('should add sell order to order book', () => {
      const order = createTestOrder({
        userId: 'user1',
        side: OrderSide.SELL,
        price: '51000',
        quantity: '1.0',
      });

      const result = engine.processOrder(order);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(0);
        expect(result.value.updatedOrder.status).toBe(OrderStatus.OPEN);
      }
    });

    it('should maintain best bid and ask prices', () => {
      // Add buy orders
      engine.processOrder(createTestOrder({
        userId: 'user1',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      }));

      engine.processOrder(createTestOrder({
        userId: 'user2',
        side: OrderSide.BUY,
        price: '50100',
        quantity: '1.0',
      }));

      // Add sell orders
      engine.processOrder(createTestOrder({
        userId: 'user3',
        side: OrderSide.SELL,
        price: '51000',
        quantity: '1.0',
      }));

      engine.processOrder(createTestOrder({
        userId: 'user4',
        side: OrderSide.SELL,
        price: '50900',
        quantity: '1.0',
      }));

      const prices = engine.getBestPrices();
      
      expect('some' in prices.bestBid && prices.bestBid.some).toBe(true);
      expect('some' in prices.bestAsk && prices.bestAsk.some).toBe(true);

      if ('some' in prices.bestBid && prices.bestBid.some) {
        expect(prices.bestBid.value).toBe('50100');
      }

      if ('some' in prices.bestAsk && prices.bestAsk.some) {
        expect(prices.bestAsk.value).toBe('50900');
      }
    });
  });

  describe('Order Matching', () => {
    it('should match buy order with sell order at same price', () => {
      // Add sell order first
      const sellOrder = createTestOrder({
        userId: 'seller',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '1.0',
      });
      engine.processOrder(sellOrder);

      // Add matching buy order
      const buyOrder = createTestOrder({
        userId: 'buyer',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      });

      const result = engine.processOrder(buyOrder);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(1);
        expect(result.value.updatedOrder.status).toBe(OrderStatus.FILLED);
        
        const trade = result.value.trades[0]!;
        expect(trade.price).toBe('50000');
        expect(trade.quantity).toBe('1.0');
        expect(trade.side).toBe(OrderSide.BUY);
      }
    });

    it('should match buy order with multiple sell orders (partial fills)', () => {
      // Add multiple sell orders
      engine.processOrder(createTestOrder({
        userId: 'seller1',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '0.5',
      }));

      engine.processOrder(createTestOrder({
        userId: 'seller2',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '0.3',
      }));

      engine.processOrder(createTestOrder({
        userId: 'seller3',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '0.4',
      }));

      // Add buy order for total quantity
      const buyOrder = createTestOrder({
        userId: 'buyer',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      });

      const result = engine.processOrder(buyOrder);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(3);
        expect(result.value.updatedOrder.status).toBe(OrderStatus.FILLED);
        
        const totalMatched = result.value.trades.reduce(
          (sum, trade) => DecimalUtils.add(sum, trade.quantity as Decimal),
          DecimalUtils.ZERO
        );
        expect(totalMatched).toBe('1');
      }
    });

    it('should handle price-time priority correctly', () => {
      // Add orders at same price in sequence
      const order1 = createTestOrder({
        userId: 'seller1',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '1.0',
        orderId: 'ORDER-1',
      });
      engine.processOrder(order1);

      const order2 = createTestOrder({
        userId: 'seller2',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '1.0',
        orderId: 'ORDER-2',
      });
      engine.processOrder(order2);

      // Buy less than total available
      const buyOrder = createTestOrder({
        userId: 'buyer',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '0.5',
      });

      const result = engine.processOrder(buyOrder);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(1);
        // Should match with first order (time priority)
        expect(result.value.trades[0]!.makerOrderId).toBe('ORDER-1' as OrderId);
      }
    });

    it('should match across multiple price levels', () => {
      // Add sell orders at different prices
      engine.processOrder(createTestOrder({
        userId: 'seller1',
        side: OrderSide.SELL,
        price: '50000',
        quantity: '0.5',
      }));

      engine.processOrder(createTestOrder({
        userId: 'seller2',
        side: OrderSide.SELL,
        price: '50100',
        quantity: '0.5',
      }));

      // Buy order crosses multiple levels
      const buyOrder = createTestOrder({
        userId: 'buyer',
        side: OrderSide.BUY,
        price: '50200',
        quantity: '1.0',
      });

      const result = engine.processOrder(buyOrder);
      expect(result.ok).toBe(true);

      if (result.ok) {
        expect(result.value.trades.length).toBe(2);
        expect(result.value.updatedOrder.status).toBe(OrderStatus.FILLED);
        
        // First trade at 50000
        expect(result.value.trades[0]!.price).toBe('50000');
        // Second trade at 50100
        expect(result.value.trades[1]!.price).toBe('50100');
      }
    });
  });

  describe('Self-Trade Prevention', () => {
    it('should prevent self-trade with CANCEL_TAKER mode', () => {
      const userId = 'trader1';

      // Add sell order
      const sellOrder = createTestOrder({
        userId,
        side: OrderSide.SELL,
        price: '50000',
        quantity: '1.0',
      });
      engine.processOrder(sellOrder);

      // Try to buy from own sell order
      const buyOrder = createTestOrder({
        userId, // Same user
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      });

      const result = engine.processOrder(buyOrder);
      expect(result.ok).toBe(false);
    });
  });

  describe('Order Cancellation', () => {
    it('should cancel an open order', () => {
      const order = createTestOrder({
        userId: 'user1',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      });

      const processResult = engine.processOrder(order);
      expect(processResult.ok).toBe(true);

      const cancelResult = engine.cancelOrder(order.id);
      expect(cancelResult.ok).toBe(true);

      if (cancelResult.ok) {
        expect(cancelResult.value.status).toBe(OrderStatus.CANCELLED);
      }
    });
  });

  describe('Order Book Snapshot', () => {
    it('should generate correct order book snapshot', () => {
      // Add orders
      engine.processOrder(createTestOrder({
        userId: 'user1',
        side: OrderSide.BUY,
        price: '50000',
        quantity: '1.0',
      }));

      engine.processOrder(createTestOrder({
        userId: 'user2',
        side: OrderSide.SELL,
        price: '51000',
        quantity: '2.0',
      }));

      const snapshot = engine.getOrderBookSnapshot(10);

      expect(snapshot.symbol).toBe('BTC/USDT');
      expect(snapshot.bids.length).toBe(1);
      expect(snapshot.asks.length).toBe(1);

      expect(snapshot.bids[0]!.price).toBe('50000');
      expect(snapshot.bids[0]!.quantity).toBe('1.0');

      expect(snapshot.asks[0]!.price).toBe('51000');
      expect(snapshot.asks[0]!.quantity).toBe('2.0');
    });
  });
});
