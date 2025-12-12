/**
 * FILE: packages/core/src/types/Order.ts
 * PURPOSE: Core order type definitions and enums
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Result.ts, Decimal.ts
 * 
 * DESCRIPTION:
 * Defines strict types for orders, trades, and related entities.
 * All monetary values use Decimal type to avoid floating-point errors.
 */

import { Option } from './Result';

/**
 * Unique identifier for orders
 * Format: UUID v4
 */
export type OrderId = string & { readonly __brand: 'OrderId' };

/**
 * Unique identifier for users
 * Format: UUID v4
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Unique identifier for trades
 * Format: UUID v4
 */
export type TradeId = string & { readonly __brand: 'TradeId' };

/**
 * Trading pair symbol
 * Format: BASE/QUOTE (e.g., "BTC/USDT")
 */
export type TradingPair = string & { readonly __brand: 'TradingPair' };

/**
 * Decimal string representation for precise financial calculations
 * Always stored as string to avoid JavaScript number precision issues
 */
export type Decimal = string & { readonly __brand: 'Decimal' };

/**
 * Unix timestamp in milliseconds
 */
export type Timestamp = number & { readonly __brand: 'Timestamp' };

/**
 * Order side: buy or sell
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Order type
 */
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
}

/**
 * Order status lifecycle
 */
export enum OrderStatus {
  PENDING = 'PENDING',           // Order submitted, not yet processed
  OPEN = 'OPEN',                 // Order active in order book
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',             // Order completely executed
  CANCELLED = 'CANCELLED',       // User cancelled
  REJECTED = 'REJECTED',         // System rejected (insufficient funds, etc.)
  EXPIRED = 'EXPIRED',           // Time-in-force expired
}

/**
 * Time-in-force specification
 */
export enum TimeInForce {
  GTC = 'GTC',   // Good Till Cancel
  IOC = 'IOC',   // Immediate Or Cancel
  FOK = 'FOK',   // Fill Or Kill
  GTD = 'GTD',   // Good Till Date
}

/**
 * Core order structure
 * All fields are immutable after creation (functional approach)
 */
export interface Order {
  readonly id: OrderId;
  readonly userId: UserId;
  readonly symbol: TradingPair;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly price: Option<Decimal>;        // None for market orders
  readonly stopPrice: Option<Decimal>;    // Some for stop orders
  readonly quantity: Decimal;
  readonly filledQuantity: Decimal;
  readonly remainingQuantity: Decimal;
  readonly status: OrderStatus;
  readonly timeInForce: TimeInForce;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly expiresAt: Option<Timestamp>;  // Some for GTD orders
  readonly clientOrderId: Option<string>; // User-provided reference
}

/**
 * Order creation parameters (before ID assignment)
 */
export interface OrderParams {
  readonly userId: UserId;
  readonly symbol: TradingPair;
  readonly side: OrderSide;
  readonly type: OrderType;
  readonly price: Option<Decimal>;
  readonly stopPrice: Option<Decimal>;
  readonly quantity: Decimal;
  readonly timeInForce: TimeInForce;
  readonly clientOrderId: Option<string>;
}

/**
 * Executed trade result from matching
 */
export interface Trade {
  readonly id: TradeId;
  readonly symbol: TradingPair;
  readonly makerOrderId: OrderId;
  readonly takerOrderId: OrderId;
  readonly makerUserId: UserId;
  readonly takerUserId: UserId;
  readonly price: Decimal;
  readonly quantity: Decimal;
  readonly side: OrderSide;           // Taker's side
  readonly makerFee: Decimal;
  readonly takerFee: Decimal;
  readonly timestamp: Timestamp;
}

/**
 * Order book price level
 * Aggregates orders at same price
 */
export interface PriceLevel {
  readonly price: Decimal;
  readonly quantity: Decimal;
  readonly orderCount: number;
}

/**
 * Order book snapshot for API responses
 */
export interface OrderBookSnapshot {
  readonly symbol: TradingPair;
  readonly bids: readonly PriceLevel[];
  readonly asks: readonly PriceLevel[];
  readonly timestamp: Timestamp;
}

/**
 * Type guards for branded types
 */
export function isOrderId(value: string): value is OrderId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isUserId(value: string): value is UserId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isTradingPair(value: string): value is TradingPair {
  return /^[A-Z]+\/[A-Z]+$/.test(value);
}

export function isDecimal(value: string): value is Decimal {
  return /^-?\d+(\.\d+)?$/.test(value);
}
