/**
 * FILE: packages/core/src/matching-engine/MatchingEngine.ts
 * PURPOSE: Core order matching engine implementing price-time priority algorithm
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: OrderBook, Order types, Decimal utils
 * 
 * DESCRIPTION:
 * Matches incoming orders against the order book using price-time priority.
 * Generates trades when orders match. Handles partial fills.
 * Implements self-trade prevention.
 */

import type { Order, OrderId, Trade, TradeId, TradingPair, Decimal } from '../types/Order';
import { OrderSide, OrderStatus, OrderType } from '../types/Order';
import type { Result } from '../types/Result';
import { Ok, Err } from '../types/Result';
import { MatchingError, SelfTradeError } from '../types/Errors';
import { OrderBook } from './OrderBook';
import * as DecimalUtils from '../utils/Decimal';
import { randomUUID } from 'crypto';

/**
 * Trade generation result
 */
export interface TradeResult {
  readonly trades: readonly Trade[];
  readonly updatedOrder: Order;
}

/**
 * Self-trade prevention mode
 */
type SelfTradePreventionMode = 'CANCEL_TAKER' | 'CANCEL_MAKER' | 'CANCEL_BOTH';

/**
 * Matching engine for a single trading pair
 */
export class MatchingEngine {
  private readonly orderBook: OrderBook;
  private readonly symbol: TradingPair;
  private readonly selfTradePreventionMode: SelfTradePreventionMode;
  private readonly makerFeeRate: Decimal;
  private readonly takerFeeRate: Decimal;

  constructor(
    symbol: TradingPair,
    selfTradePreventionMode: SelfTradePreventionMode = 'CANCEL_TAKER',
    makerFeeRate: Decimal = '0.0001' as Decimal,
    takerFeeRate: Decimal = '0.0005' as Decimal
  ) {
    this.symbol = symbol;
    this.orderBook = new OrderBook(symbol);
    this.selfTradePreventionMode = selfTradePreventionMode;
    this.makerFeeRate = makerFeeRate;
    this.takerFeeRate = takerFeeRate;
  }

  /**
   * INTERNAL: Processes an incoming order
   * 
   * For market orders: Matches immediately at best available prices
   * For limit orders: Matches if price crosses, otherwise adds to book
   * 
   * Returns trades generated and final order status
   */
  public processOrder(order: Order): Result<TradeResult, MatchingError> {
    // Validate order
    if (order.symbol !== this.symbol) {
      return Err(new MatchingError('Order symbol does not match engine symbol'));
    }

    // Handle market orders
    if (order.type === OrderType.MARKET) {
      return this.processMarketOrder(order);
    }

    // Handle limit orders
    return this.processLimitOrder(order);
  }

  /**
   * INTERNAL: Processes a market order
   * Executes immediately at best available prices
   */
  private processMarketOrder(order: Order): Result<TradeResult, MatchingError> {
    const trades: Trade[] = [];
    let remainingQuantity = order.quantity;
    let filledQuantity = DecimalUtils.ZERO;

    // Get opposite side of book
    const levels = order.side === OrderSide.BUY
      ? this.orderBook.getAskLevels()
      : this.orderBook.getBidLevels();

    for (const level of levels) {
      if (DecimalUtils.isZero(remainingQuantity)) {
        break;
      }

      const matchResult = level.matchQuantity(remainingQuantity);
      
      for (const { order: makerOrder, matchedQuantity } of matchResult.matches) {
        // Check self-trade
        if (order.userId === makerOrder.userId) {
          if (this.selfTradePreventionMode === 'CANCEL_TAKER') {
            return Err(new SelfTradeError(order.id));
          }
          continue;
        }

        // Generate trade
        const trade = this.createTrade(
          makerOrder,
          order,
          level.getPrice(),
          matchedQuantity
        );
        trades.push(trade);

        filledQuantity = DecimalUtils.add(filledQuantity, matchedQuantity);
        remainingQuantity = matchResult.remainingQuantity;
      }
    }

    // Determine final order status
    const status = DecimalUtils.isZero(remainingQuantity)
      ? OrderStatus.FILLED
      : DecimalUtils.isZero(filledQuantity)
      ? OrderStatus.REJECTED
      : OrderStatus.PARTIALLY_FILLED;

    const updatedOrder: Order = {
      ...order,
      filledQuantity,
      remainingQuantity,
      status,
      updatedAt: Date.now() as import('../types/Order').Timestamp,
    };

    return Ok({ trades, updatedOrder });
  }

  /**
   * INTERNAL: Processes a limit order
   * Matches if price crosses, otherwise adds to book
   */
  private processLimitOrder(order: Order): Result<TradeResult, MatchingError> {
    if (!('some' in order.price && order.price.some)) {
      return Err(new MatchingError('Limit order requires a price'));
    }

    const orderPrice = order.price.value;
    const trades: Trade[] = [];
    let remainingQuantity = order.remainingQuantity;
    let filledQuantity = order.filledQuantity;

    // Check if order can match immediately
    const canMatch = order.side === OrderSide.BUY
      ? this.canBuyOrderMatch(orderPrice)
      : this.canSellOrderMatch(orderPrice);

    if (canMatch) {
      // Get matchable levels
      const levels = order.side === OrderSide.BUY
        ? this.orderBook.getAskLevels()
        : this.orderBook.getBidLevels();

      for (const level of levels) {
        if (DecimalUtils.isZero(remainingQuantity)) {
          break;
        }

        // Check if price still matches
        const levelPrice = level.getPrice();
        const priceMatches = order.side === OrderSide.BUY
          ? DecimalUtils.isLessThanOrEqual(levelPrice, orderPrice)
          : DecimalUtils.isGreaterThanOrEqual(levelPrice, orderPrice);

        if (!priceMatches) {
          break;
        }

        const matchResult = level.matchQuantity(remainingQuantity);

        for (const { order: makerOrder, matchedQuantity } of matchResult.matches) {
          // Check self-trade
          if (order.userId === makerOrder.userId) {
            if (this.selfTradePreventionMode === 'CANCEL_TAKER') {
              return Err(new SelfTradeError(order.id));
            }
            continue;
          }

          // Generate trade
          const trade = this.createTrade(
            makerOrder,
            order,
            levelPrice,
            matchedQuantity
          );
          trades.push(trade);

          filledQuantity = DecimalUtils.add(filledQuantity, matchedQuantity);
          remainingQuantity = matchResult.remainingQuantity;
        }
      }
    }

    // Determine final status
    let status: OrderStatus;
    if (DecimalUtils.isZero(remainingQuantity)) {
      status = OrderStatus.FILLED;
    } else if (DecimalUtils.isGreaterThan(filledQuantity, DecimalUtils.ZERO)) {
      status = OrderStatus.PARTIALLY_FILLED;
      // Add remaining to book
      const addResult = this.orderBook.addOrder({
        ...order,
        filledQuantity,
        remainingQuantity,
        status: OrderStatus.OPEN,
      });
      if (!addResult.ok) {
        return Err(new MatchingError('Failed to add partially filled order to book'));
      }
    } else {
      // No match, add to book
      status = OrderStatus.OPEN;
      const addResult = this.orderBook.addOrder({
        ...order,
        status: OrderStatus.OPEN,
      });
      if (!addResult.ok) {
        return Err(new MatchingError('Failed to add order to book'));
      }
    }

    const updatedOrder: Order = {
      ...order,
      filledQuantity,
      remainingQuantity,
      status,
      updatedAt: Date.now() as import('../types/Order').Timestamp,
    };

    return Ok({ trades, updatedOrder });
  }

  /**
   * INTERNAL: Cancels an order from the book
   */
  public cancelOrder(orderId: OrderId): Result<Order, MatchingError> {
    const result = this.orderBook.removeOrder(orderId);
    
    if (!result.ok) {
      return Err(new MatchingError('Order not found for cancellation'));
    }

    const cancelledOrder: Order = {
      ...result.value,
      status: OrderStatus.CANCELLED,
      updatedAt: Date.now() as import('../types/Order').Timestamp,
    };

    return Ok(cancelledOrder);
  }

  /**
   * INTERNAL: Checks if a buy order can match
   */
  private canBuyOrderMatch(buyPrice: Decimal): boolean {
    const bestAsk = this.orderBook.getBestAsk();
    if (!('some' in bestAsk && bestAsk.some)) {
      return false;
    }
    return DecimalUtils.isGreaterThanOrEqual(buyPrice, bestAsk.value);
  }

  /**
   * INTERNAL: Checks if a sell order can match
   */
  private canSellOrderMatch(sellPrice: Decimal): boolean {
    const bestBid = this.orderBook.getBestBid();
    if (!('some' in bestBid && bestBid.some)) {
      return false;
    }
    return DecimalUtils.isLessThanOrEqual(sellPrice, bestBid.value);
  }

  /**
   * INTERNAL: Creates a trade from matched orders
   */
  private createTrade(
    makerOrder: Order,
    takerOrder: Order,
    price: Decimal,
    quantity: Decimal
  ): Trade {
    const volume = DecimalUtils.multiply(price, quantity);
    const makerFee = DecimalUtils.multiply(volume, this.makerFeeRate);
    const takerFee = DecimalUtils.multiply(volume, this.takerFeeRate);

    return {
      id: randomUUID() as TradeId,
      symbol: this.symbol,
      makerOrderId: makerOrder.id,
      takerOrderId: takerOrder.id,
      makerUserId: makerOrder.userId,
      takerUserId: takerOrder.userId,
      price,
      quantity,
      side: takerOrder.side,
      makerFee,
      takerFee,
      timestamp: Date.now() as import('../types/Order').Timestamp,
    };
  }

  /**
   * PUBLIC: Gets current order book snapshot
   */
  public getOrderBookSnapshot(depth: number = 50): import('../types/Order').OrderBookSnapshot {
    return this.orderBook.getSnapshot(depth);
  }

  /**
   * PUBLIC: Gets best bid and ask prices
   */
  public getBestPrices(): {
    bestBid: import('../types/Result').Option<Decimal>;
    bestAsk: import('../types/Result').Option<Decimal>;
    spread: import('../types/Result').Option<Decimal>;
  } {
    return {
      bestBid: this.orderBook.getBestBid(),
      bestAsk: this.orderBook.getBestAsk(),
      spread: this.orderBook.getSpread(),
    };
  }

  /**
   * INTERNAL: Validates order book integrity
   */
  public validateOrderBook(): Result<void, MatchingError> {
    const validationResult = this.orderBook.validate();
    if (!validationResult.ok) {
      return Err(new MatchingError('Order book validation failed'));
    }
    return Ok(undefined);
  }
}
