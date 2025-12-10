/**
 * FILE: packages/core/src/matching-engine/OrderBook.ts
 * PURPOSE: Order book implementation with bid/ask price levels
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: PriceLevel, Order types, Decimal utils
 * 
 * DESCRIPTION:
 * Maintains bid and ask sides of the order book using sorted price levels.
 * Bids are sorted descending (highest price first).
 * Asks are sorted ascending (lowest price first).
 * Supports efficient price-time priority matching.
 */

import type { Order, OrderId, OrderSide, TradingPair, Decimal, OrderBookSnapshot } from '../types/Order';
import type { Result, Option } from '../types/Result';
import { Ok, Err, Some, None } from '../types/Result';
import { OrderBookCorruptionError, InvalidOrderError } from '../types/Errors';
import { PriceLevel } from './PriceLevel';
import * as DecimalUtils from '../utils/Decimal';

/**
 * Order book managing bids and asks for a single trading pair
 */
export class OrderBook {
  private readonly symbol: TradingPair;
  
  // Bids: price -> PriceLevel (sorted descending by price)
  private bids: Map<Decimal, PriceLevel>;
  private bidPrices: Decimal[]; // Sorted cache
  
  // Asks: price -> PriceLevel (sorted ascending by price)
  private asks: Map<Decimal, PriceLevel>;
  private askPrices: Decimal[]; // Sorted cache
  
  private orderLocations: Map<OrderId, { side: OrderSide; price: Decimal }>;

  constructor(symbol: TradingPair) {
    this.symbol = symbol;
    this.bids = new Map();
    this.asks = new Map();
    this.bidPrices = [];
    this.askPrices = [];
    this.orderLocations = new Map();
  }

  /**
   * Returns the trading pair symbol
   */
  public getSymbol(): TradingPair {
    return this.symbol;
  }

  /**
   * Adds an order to the order book
   */
  public addOrder(order: Order): Result<void, InvalidOrderError> {
    // Validation
    if (order.symbol !== this.symbol) {
      return Err(new InvalidOrderError('symbol', `Order symbol ${order.symbol} does not match book symbol ${this.symbol}`));
    }

    if ('some' in order.price && !order.price.some) {
      return Err(new InvalidOrderError('price', 'Limit orders must have a price'));
    }

    if (!('some' in order.price && order.price.some)) {
      return Err(new InvalidOrderError('type', 'Only limit orders can be added to order book'));
    }

    const price = order.price.value;
    const side = order.side;

    // Get or create price level
    const priceLevels = side === 'BUY' ? this.bids : this.asks;
    let priceLevel = priceLevels.get(price);

    if (!priceLevel) {
      priceLevel = new PriceLevel(price);
      priceLevels.set(price, priceLevel);
      
      // Update sorted price cache
      if (side === 'BUY') {
        this.bidPrices.push(price);
        this.bidPrices.sort((a, b) => DecimalUtils.compare(b, a)); // Descending
      } else {
        this.askPrices.push(price);
        this.askPrices.sort((a, b) => DecimalUtils.compare(a, b)); // Ascending
      }
    }

    priceLevel.addOrder(order);
    this.orderLocations.set(order.id, { side, price });

    return Ok(undefined);
  }

  /**
   * Removes an order from the order book
   */
  public removeOrder(orderId: OrderId): Result<Order, InvalidOrderError> {
    const location = this.orderLocations.get(orderId);
    
    if (!location) {
      return Err(new InvalidOrderError('orderId', `Order ${orderId} not found in book`));
    }

    const { side, price } = location;
    const priceLevels = side === 'BUY' ? this.bids : this.asks;
    const priceLevel = priceLevels.get(price);

    if (!priceLevel) {
      return Err(new InvalidOrderError('orderId', `Price level ${price} not found`));
    }

    const orderResult = priceLevel.removeOrder(orderId);
    
    if (!('some' in orderResult && orderResult.some)) {
      return Err(new InvalidOrderError('orderId', `Order ${orderId} not found in price level`));
    }

    this.orderLocations.delete(orderId);

    // Remove empty price level
    if (priceLevel.isEmpty()) {
      priceLevels.delete(price);
      
      if (side === 'BUY') {
        this.bidPrices = this.bidPrices.filter(p => !DecimalUtils.isEqual(p, price));
      } else {
        this.askPrices = this.askPrices.filter(p => !DecimalUtils.isEqual(p, price));
      }
    }

    return Ok(orderResult.value);
  }

  /**
   * Gets the best bid price (highest buy price)
   */
  public getBestBid(): Option<Decimal> {
    return this.bidPrices.length > 0 ? Some(this.bidPrices[0]!) : None();
  }

  /**
   * Gets the best ask price (lowest sell price)
   */
  public getBestAsk(): Option<Decimal> {
    return this.askPrices.length > 0 ? Some(this.askPrices[0]!) : None();
  }

  /**
   * Gets the spread (difference between best ask and best bid)
   */
  public getSpread(): Option<Decimal> {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();

    if (('some' in bestBid && bestBid.some) && ('some' in bestAsk && bestAsk.some)) {
      return Some(DecimalUtils.subtract(bestAsk.value, bestBid.value));
    }

    return None();
  }

  /**
   * Gets the mid price (average of best bid and best ask)
   */
  public getMidPrice(): Option<Decimal> {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();

    if (('some' in bestBid && bestBid.some) && ('some' in bestAsk && bestAsk.some)) {
      const sum = DecimalUtils.add(bestBid.value, bestAsk.value);
      const divResult = DecimalUtils.divide(sum, '2' as Decimal);
      return 'ok' in divResult && divResult.ok ? Some(divResult.value) : None();
    }

    return None();
  }

  /**
   * Gets price level at specific price
   */
  public getPriceLevel(side: OrderSide, price: Decimal): Option<PriceLevel> {
    const priceLevels = side === 'BUY' ? this.bids : this.asks;
    const level = priceLevels.get(price);
    return level ? Some(level) : None();
  }

  /**
   * Gets all bid price levels (sorted descending)
   */
  public getBidLevels(depth: number = 50): readonly PriceLevel[] {
    return this.bidPrices
      .slice(0, depth)
      .map(price => this.bids.get(price))
      .filter((level): level is PriceLevel => level !== undefined);
  }

  /**
   * Gets all ask price levels (sorted ascending)
   */
  public getAskLevels(depth: number = 50): readonly PriceLevel[] {
    return this.askPrices
      .slice(0, depth)
      .map(price => this.asks.get(price))
      .filter((level): level is PriceLevel => level !== undefined);
  }

  /**
   * Creates a snapshot of the order book for API responses
   */
  public getSnapshot(depth: number = 50): OrderBookSnapshot {
    const bidLevels = this.getBidLevels(depth);
    const askLevels = this.getAskLevels(depth);

    return {
      symbol: this.symbol,
      bids: bidLevels.map(level => level.toSnapshot()),
      asks: askLevels.map(level => level.toSnapshot()),
      timestamp: Date.now() as import('../types/Order').Timestamp,
    };
  }

  /**
   * Gets total liquidity (volume) at a specific price
   */
  public getLiquidityAtPrice(side: OrderSide, price: Decimal): Decimal {
    const level = this.getPriceLevel(side, price);
    return ('some' in level && level.some) ? level.value.getTotalQuantity() : DecimalUtils.ZERO;
  }

  /**
   * Checks if order book is crossed (bid >= ask)
   * This indicates a system error
   */
  public isCrossed(): boolean {
    const bestBid = this.getBestBid();
    const bestAsk = this.getBestAsk();

    if (('some' in bestBid && bestBid.some) && ('some' in bestAsk && bestAsk.some)) {
      return DecimalUtils.isGreaterThanOrEqual(bestBid.value, bestAsk.value);
    }

    return false;
  }

  /**
   * Validates order book integrity
   */
  public validate(): Result<void, OrderBookCorruptionError> {
    if (this.isCrossed()) {
      return Err(new OrderBookCorruptionError(
        this.symbol,
        'Order book is crossed (bid >= ask)'
      ));
    }

    // Check bid prices are sorted descending
    for (let i = 0; i < this.bidPrices.length - 1; i++) {
      if (DecimalUtils.isLessThan(this.bidPrices[i]!, this.bidPrices[i + 1]!)) {
        return Err(new OrderBookCorruptionError(
          this.symbol,
          'Bid prices are not sorted descending'
        ));
      }
    }

    // Check ask prices are sorted ascending
    for (let i = 0; i < this.askPrices.length - 1; i++) {
      if (DecimalUtils.isGreaterThan(this.askPrices[i]!, this.askPrices[i + 1]!)) {
        return Err(new OrderBookCorruptionError(
          this.symbol,
          'Ask prices are not sorted ascending'
        ));
      }
    }

    return Ok(undefined);
  }

  /**
   * Clears all orders from the order book
   */
  public clear(): void {
    this.bids.clear();
    this.asks.clear();
    this.bidPrices = [];
    this.askPrices = [];
    this.orderLocations.clear();
  }

  /**
   * Gets total number of orders in the book
   */
  public getOrderCount(): number {
    return this.orderLocations.size;
  }
}
