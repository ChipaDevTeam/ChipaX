/**
 * FILE: packages/core/src/matching-engine/PriceLevel.ts
 * PURPOSE: Price level management for order book
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Order types, Decimal utils
 * 
 * DESCRIPTION:
 * Manages orders at a specific price level using FIFO (price-time priority).
 * Orders at the same price are executed in time priority order.
 */

import type { Order, OrderId, Decimal } from '../types/Order';
import type { Option } from '../types/Result';
import { Some, None } from '../types/Result';
import * as DecimalUtils from '../utils/Decimal';

/**
 * Represents a single price level in the order book
 * Maintains orders in time-priority order (FIFO queue)
 */
export class PriceLevel {
  private readonly price: Decimal;
  private orders: Map<OrderId, Order>;
  private orderQueue: OrderId[]; // Time-ordered list
  private totalQuantity: Decimal;

  constructor(price: Decimal) {
    this.price = price;
    this.orders = new Map();
    this.orderQueue = [];
    this.totalQuantity = DecimalUtils.ZERO;
  }

  /**
   * Returns the price of this level
   */
  public getPrice(): Decimal {
    return this.price;
  }

  /**
   * Returns total quantity at this price level
   */
  public getTotalQuantity(): Decimal {
    return this.totalQuantity;
  }

  /**
   * Returns number of orders at this level
   */
  public getOrderCount(): number {
    return this.orders.size;
  }

  /**
   * Checks if this price level is empty
   */
  public isEmpty(): boolean {
    return this.orders.size === 0;
  }

  /**
   * Adds an order to this price level
   * Orders are added to the end of the queue (FIFO)
   */
  public addOrder(order: Order): void {
    if (this.orders.has(order.id)) {
      return; // Order already exists
    }

    this.orders.set(order.id, order);
    this.orderQueue.push(order.id);
    this.totalQuantity = DecimalUtils.add(
      this.totalQuantity,
      order.remainingQuantity
    );
  }

  /**
   * Removes an order from this price level
   */
  public removeOrder(orderId: OrderId): Option<Order> {
    const order = this.orders.get(orderId);
    
    if (!order) {
      return None();
    }

    this.orders.delete(orderId);
    this.orderQueue = this.orderQueue.filter(id => id !== orderId);
    this.totalQuantity = DecimalUtils.subtract(
      this.totalQuantity,
      order.remainingQuantity
    );

    return Some(order);
  }

  /**
   * Gets the first order in the queue (oldest order)
   */
  public getFirstOrder(): Option<Order> {
    if (this.orderQueue.length === 0) {
      return None();
    }

    const orderId = this.orderQueue[0];
    if (orderId === undefined) {
      return None();
    }
    const order = this.orders.get(orderId);
    
    return order ? Some(order) : None();
  }

  /**
   * Gets all orders at this price level in time priority
   */
  public getAllOrders(): readonly Order[] {
    return this.orderQueue
      .map(id => this.orders.get(id))
      .filter((order): order is Order => order !== undefined);
  }

  /**
   * Updates an order's remaining quantity
   * Used when an order is partially filled
   */
  public updateOrderQuantity(orderId: OrderId, newRemainingQuantity: Decimal): boolean {
    const order = this.orders.get(orderId);
    
    if (!order) {
      return false;
    }

    const quantityDiff = DecimalUtils.subtract(
      order.remainingQuantity,
      newRemainingQuantity
    );

    this.totalQuantity = DecimalUtils.subtract(this.totalQuantity, quantityDiff);

    // Update the order in the map
    this.orders.set(orderId, {
      ...order,
      remainingQuantity: newRemainingQuantity,
      filledQuantity: DecimalUtils.subtract(order.quantity, newRemainingQuantity),
    });

    return true;
  }

  /**
   * Matches incoming quantity against orders at this level
   * Returns array of matched orders and remaining quantity
   */
  public matchQuantity(incomingQuantity: Decimal): {
    matches: Array<{ order: Order; matchedQuantity: Decimal }>;
    remainingQuantity: Decimal;
  } {
    const matches: Array<{ order: Order; matchedQuantity: Decimal }> = [];
    let remaining = incomingQuantity;

    for (const orderId of [...this.orderQueue]) {
      if (DecimalUtils.isZero(remaining)) {
        break;
      }

      const order = this.orders.get(orderId);
      if (!order) {
        continue;
      }

      const matchedQuantity = DecimalUtils.min(remaining, order.remainingQuantity);
      matches.push({ order, matchedQuantity });

      remaining = DecimalUtils.subtract(remaining, matchedQuantity);

      // Update or remove the order
      const newRemainingQuantity = DecimalUtils.subtract(
        order.remainingQuantity,
        matchedQuantity
      );

      if (DecimalUtils.isZero(newRemainingQuantity)) {
        this.removeOrder(orderId);
      } else {
        this.updateOrderQuantity(orderId, newRemainingQuantity);
      }
    }

    return { matches, remainingQuantity: remaining };
  }

  /**
   * Creates a snapshot of this price level for order book display
   */
  public toSnapshot(): {
    price: Decimal;
    quantity: Decimal;
    orderCount: number;
  } {
    return {
      price: this.price,
      quantity: this.totalQuantity,
      orderCount: this.orders.size,
    };
  }
}
