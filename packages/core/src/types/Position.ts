/**
 * FILE: packages/core/src/types/Position.ts
 * PURPOSE: Margin and futures position type definitions
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Order.ts, Result.ts
 * 
 * DESCRIPTION:
 * Defines position structures for leveraged trading (futures/margin).
 * Includes position management, PnL calculation, and liquidation data.
 */

import type { UserId, TradingPair, Decimal, Timestamp } from './Order';
import type { Option } from './Result';

/**
 * Unique identifier for positions
 */
export type PositionId = string & { readonly __brand: 'PositionId' };

/**
 * Position direction
 */
export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

/**
 * Margin type for position
 */
export enum MarginType {
  CROSS = 'CROSS',       // Shares margin across all positions
  ISOLATED = 'ISOLATED', // Position has dedicated margin
}

/**
 * Position status
 */
export enum PositionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

/**
 * Leveraged position structure
 */
export interface Position {
  readonly id: PositionId;
  readonly userId: UserId;
  readonly symbol: TradingPair;
  readonly side: PositionSide;
  readonly entryPrice: Decimal;
  readonly markPrice: Decimal;           // Current market price
  readonly quantity: Decimal;
  readonly leverage: number;             // 1x - 100x
  readonly marginType: MarginType;
  readonly initialMargin: Decimal;       // Margin at position open
  readonly maintenanceMargin: Decimal;   // Min margin to avoid liquidation
  readonly unrealizedPnL: Decimal;
  readonly realizedPnL: Decimal;
  readonly liquidationPrice: Decimal;
  readonly status: PositionStatus;
  readonly openedAt: Timestamp;
  readonly closedAt: Option<Timestamp>;
}

/**
 * Position creation parameters
 */
export interface PositionParams {
  readonly userId: UserId;
  readonly symbol: TradingPair;
  readonly side: PositionSide;
  readonly entryPrice: Decimal;
  readonly quantity: Decimal;
  readonly leverage: number;
  readonly marginType: MarginType;
}

/**
 * Margin requirement calculation result
 */
export interface MarginRequirement {
  readonly initialMargin: Decimal;
  readonly maintenanceMargin: Decimal;
  readonly availableMargin: Decimal;
  readonly marginRatio: Decimal;  // Current margin / maintenance margin
}

/**
 * Liquidation event data
 */
export interface LiquidationEvent {
  readonly positionId: PositionId;
  readonly userId: UserId;
  readonly symbol: TradingPair;
  readonly side: PositionSide;
  readonly liquidationPrice: Decimal;
  readonly quantity: Decimal;
  readonly loss: Decimal;
  readonly timestamp: Timestamp;
  readonly reason: LiquidationReason;
}

/**
 * Reason for liquidation
 */
export enum LiquidationReason {
  MARGIN_CALL = 'MARGIN_CALL',           // Maintenance margin breached
  BANKRUPTCY_PRICE = 'BANKRUPTCY_PRICE', // Position value hit zero
  ADL = 'ADL',                           // Auto-deleveraging
}

/**
 * Type guard for PositionId
 */
export function isPositionId(value: string): value is PositionId {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
