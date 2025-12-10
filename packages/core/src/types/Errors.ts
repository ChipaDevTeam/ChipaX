/**
 * FILE: packages/core/src/types/Errors.ts
 * PURPOSE: Typed error classes for domain-specific error handling
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: None
 * 
 * DESCRIPTION:
 * Defines structured error types for all failure scenarios.
 * Each error includes code, message, and contextual data for debugging.
 */

/**
 * Base error class for all ChipaTrade errors
 */
export abstract class ChipaTradeError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = Date.now();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      name: this.name,
    };
  }
}

/**
 * Order-related errors
 */
export class OrderError extends ChipaTradeError {
  readonly code: 'ORDER_ERROR' | 'INSUFFICIENT_FUNDS' | 'INVALID_ORDER' | 'ORDER_NOT_FOUND' | 'ORDER_ALREADY_CANCELLED' = 'ORDER_ERROR';
  readonly statusCode: 400 | 404 = 400;
}

export class InsufficientFundsError extends OrderError {
  readonly code: 'INSUFFICIENT_FUNDS' = 'INSUFFICIENT_FUNDS';
  readonly required: string;
  readonly available: string;

  constructor(required: string, available: string) {
    super(`Insufficient funds: required ${required}, available ${available}`);
    this.required = required;
    this.available = available;
  }
}

export class InvalidOrderError extends OrderError {
  readonly code: 'INVALID_ORDER' = 'INVALID_ORDER';
  readonly field: string;

  constructor(field: string, reason: string) {
    super(`Invalid order: ${field} - ${reason}`);
    this.field = field;
  }
}

export class OrderNotFoundError extends OrderError {
  readonly code: 'ORDER_NOT_FOUND' = 'ORDER_NOT_FOUND';
  readonly statusCode: 404 = 404;
  readonly orderId: string;

  constructor(orderId: string) {
    super(`Order not found: ${orderId}`);
    this.orderId = orderId;
  }
}

export class OrderAlreadyCancelledError extends OrderError {
  readonly code: 'ORDER_ALREADY_CANCELLED' = 'ORDER_ALREADY_CANCELLED';
  readonly orderId: string;

  constructor(orderId: string) {
    super(`Order already cancelled: ${orderId}`);
    this.orderId = orderId;
  }
}

/**
 * Matching engine errors
 */
export class MatchingError extends ChipaTradeError {
  readonly code: 'MATCHING_ERROR' | 'ORDERBOOK_CORRUPTION' | 'SELF_TRADE_PREVENTION' = 'MATCHING_ERROR';
  readonly statusCode: 400 | 500 = 500;
}

export class OrderBookCorruptionError extends MatchingError {
  readonly code: 'ORDERBOOK_CORRUPTION' = 'ORDERBOOK_CORRUPTION';
  readonly symbol: string;

  constructor(symbol: string, details: string) {
    super(`Order book corruption detected for ${symbol}: ${details}`);
    this.symbol = symbol;
  }
}

export class SelfTradeError extends MatchingError {
  readonly code: 'SELF_TRADE_PREVENTION' = 'SELF_TRADE_PREVENTION';
  readonly statusCode: 400 = 400;
  readonly orderId: string;

  constructor(orderId: string) {
    super(`Self-trade prevented for order: ${orderId}`);
    this.orderId = orderId;
  }
}

/**
 * Wallet and balance errors
 */
export class WalletError extends ChipaTradeError {
  readonly code: 'WALLET_ERROR' | 'BALANCE_LOCK_ERROR' | 'NEGATIVE_BALANCE' = 'WALLET_ERROR';
  readonly statusCode = 400;
}

export class BalanceLockError extends WalletError {
  readonly code: 'BALANCE_LOCK_ERROR' = 'BALANCE_LOCK_ERROR';
  readonly userId: string;
  readonly currency: string;

  constructor(userId: string, currency: string, reason: string) {
    super(`Failed to lock balance for ${currency}: ${reason}`);
    this.userId = userId;
    this.currency = currency;
  }
}

export class NegativeBalanceError extends WalletError {
  readonly code: 'NEGATIVE_BALANCE' = 'NEGATIVE_BALANCE';
  readonly userId: string;
  readonly currency: string;
  readonly balance: string;

  constructor(userId: string, currency: string, balance: string) {
    super(`Negative balance detected: ${balance} ${currency}`);
    this.userId = userId;
    this.currency = currency;
    this.balance = balance;
  }
}

/**
 * Position and margin errors
 */
export class PositionError extends ChipaTradeError {
  readonly code: 'POSITION_ERROR' | 'INSUFFICIENT_MARGIN' | 'POSITION_NOT_FOUND' | 'LIQUIDATION_ERROR' | 'MAX_LEVERAGE_EXCEEDED' = 'POSITION_ERROR';
  readonly statusCode: 400 | 404 | 500 = 400;
}

export class InsufficientMarginError extends PositionError {
  readonly code: 'INSUFFICIENT_MARGIN' = 'INSUFFICIENT_MARGIN';
  readonly required: string;
  readonly available: string;

  constructor(required: string, available: string) {
    super(`Insufficient margin: required ${required}, available ${available}`);
    this.required = required;
    this.available = available;
  }
}

export class PositionNotFoundError extends PositionError {
  readonly code: 'POSITION_NOT_FOUND' = 'POSITION_NOT_FOUND';
  readonly statusCode: 404 = 404;
  readonly positionId: string;

  constructor(positionId: string) {
    super(`Position not found: ${positionId}`);
    this.positionId = positionId;
  }
}

export class LiquidationError extends PositionError {
  readonly code: 'LIQUIDATION_ERROR' = 'LIQUIDATION_ERROR';
  readonly statusCode: 500 = 500;
  readonly positionId: string;

  constructor(positionId: string, reason: string) {
    super(`Liquidation failed for position ${positionId}: ${reason}`);
    this.positionId = positionId;
  }
}

export class MaxLeverageExceededError extends PositionError {
  readonly code: 'MAX_LEVERAGE_EXCEEDED' = 'MAX_LEVERAGE_EXCEEDED';
  readonly requested: number;
  readonly maximum: number;

  constructor(requested: number, maximum: number) {
    super(`Leverage ${requested}x exceeds maximum ${maximum}x`);
    this.requested = requested;
    this.maximum = maximum;
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthError extends ChipaTradeError {
  readonly code: 'AUTH_ERROR' | 'INVALID_API_KEY' | 'UNAUTHORIZED' | 'RATE_LIMIT_EXCEEDED' = 'AUTH_ERROR';
  readonly statusCode: 401 | 429 = 401;
}

export class InvalidAPIKeyError extends AuthError {
  readonly code: 'INVALID_API_KEY' = 'INVALID_API_KEY';

  constructor() {
    super('Invalid or expired API key');
  }
}

export class UnauthorizedError extends AuthError {
  readonly code: 'UNAUTHORIZED' = 'UNAUTHORIZED';
  readonly resource: string;

  constructor(resource: string) {
    super(`Unauthorized access to: ${resource}`);
    this.resource = resource;
  }
}

export class RateLimitExceededError extends AuthError {
  readonly code: 'RATE_LIMIT_EXCEEDED' = 'RATE_LIMIT_EXCEEDED';
  readonly statusCode: 429 = 429;
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter}ms`);
    this.retryAfter = retryAfter;
  }
}

/**
 * Database and infrastructure errors
 */
export class DatabaseError extends ChipaTradeError {
  readonly code: 'DATABASE_ERROR' | 'TRANSACTION_ERROR' = 'DATABASE_ERROR';
  readonly statusCode = 500;
}

export class TransactionError extends DatabaseError {
  readonly code: 'TRANSACTION_ERROR' = 'TRANSACTION_ERROR';
  readonly operation: string;

  constructor(operation: string, details: string) {
    super(`Transaction failed for ${operation}: ${details}`);
    this.operation = operation;
  }
}

export class RedisError extends ChipaTradeError {
  readonly code = 'REDIS_ERROR';
  readonly statusCode = 500;
  readonly operation: string;

  constructor(operation: string, details: string) {
    super(`Redis operation failed for ${operation}: ${details}`);
    this.operation = operation;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends ChipaTradeError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
  readonly field: string;

  constructor(field: string, reason: string) {
    super(`Validation failed for ${field}: ${reason}`);
    this.field = field;
  }
}
