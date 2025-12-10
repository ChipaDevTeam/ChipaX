/**
 * FILE: packages/core/src/wallet/WalletService.ts
 * PURPOSE: Wallet and balance management service
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Decimal utils, Database types
 * 
 * DESCRIPTION:
 * Manages user balances, fund locking/unlocking, and balance validation.
 * Uses database transactions for atomicity.
 * Maintains both available and locked balances.
 */

import type { UserId, Decimal } from '../types/Order';
import type { Result } from '../types/Result';
import { Ok, Err } from '../types/Result';
import {
  InsufficientFundsError,
  BalanceLockError,
  NegativeBalanceError,
  WalletError,
} from '../types/Errors';
import * as DecimalUtils from '../utils/Decimal';

/**
 * Unique identifier for balance reservations
 */
export type ReservationId = string & { readonly __brand: 'ReservationId' };

/**
 * Currency identifier
 */
export type Currency = string & { readonly __brand: 'Currency' };

/**
 * Balance information for a specific currency
 */
export interface Balance {
  readonly userId: UserId;
  readonly currency: Currency;
  readonly available: Decimal;
  readonly locked: Decimal;
  readonly total: Decimal;
}

/**
 * Balance reservation for order placement
 */
interface BalanceReservation {
  readonly id: ReservationId;
  readonly userId: UserId;
  readonly currency: Currency;
  readonly amount: Decimal;
  readonly lockedAt: number;
}

/**
 * Wallet service managing user balances
 * 
 * NOTE: This is a simplified in-memory implementation.
 * Production version must use database transactions via Prisma.
 */
export class WalletService {
  // In-memory storage (replace with database in production)
  private balances: Map<string, Balance>;
  private reservations: Map<ReservationId, BalanceReservation>;

  constructor() {
    this.balances = new Map();
    this.reservations = new Map();
  }

  /**
   * INTERNAL: Locks funds for order placement
   * 
   * Creates a reservation that prevents funds from being used elsewhere.
   * Must be followed by either releaseFunds() or commitFunds().
   * 
   * Uses database transaction for atomicity in production.
   */
  public async reserveFunds(
    userId: UserId,
    amount: Decimal,
    currency: Currency
  ): Promise<Result<ReservationId, InsufficientFundsError | BalanceLockError>> {
    const balanceKey = this.getBalanceKey(userId, currency);
    const balance = this.balances.get(balanceKey);

    // Check if sufficient funds available
    if (!balance || DecimalUtils.isLessThan(balance.available, amount)) {
      const available = balance?.available ?? DecimalUtils.ZERO;
      return Err(new InsufficientFundsError(amount, available));
    }

    // Create reservation
    const reservationId = this.generateReservationId();
    const reservation: BalanceReservation = {
      id: reservationId,
      userId,
      currency,
      amount,
      lockedAt: Date.now(),
    };

    // Update balance (lock funds)
    const newAvailable = DecimalUtils.subtract(balance.available, amount);
    const newLocked = DecimalUtils.add(balance.locked, amount);

    if (DecimalUtils.isNegative(newAvailable)) {
      return Err(new BalanceLockError(
        userId,
        currency,
        'Available balance would become negative'
      ));
    }

    this.balances.set(balanceKey, {
      ...balance,
      available: newAvailable,
      locked: newLocked,
    });

    this.reservations.set(reservationId, reservation);

    return Ok(reservationId);
  }

  /**
   * INTERNAL: Releases locked funds (order cancelled)
   * 
   * Returns funds from locked to available state.
   */
  public async releaseFunds(reservationId: ReservationId): Promise<Result<void, WalletError>> {
    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      return Err(new WalletError(`Reservation ${reservationId} not found`));
    }

    const balanceKey = this.getBalanceKey(reservation.userId, reservation.currency);
    const balance = this.balances.get(balanceKey);

    if (!balance) {
      return Err(new WalletError(`Balance not found for user ${reservation.userId}`));
    }

    // Unlock funds
    const newAvailable = DecimalUtils.add(balance.available, reservation.amount);
    const newLocked = DecimalUtils.subtract(balance.locked, reservation.amount);

    if (DecimalUtils.isNegative(newLocked)) {
      return Err(new WalletError('Locked balance would become negative'));
    }

    this.balances.set(balanceKey, {
      ...balance,
      available: newAvailable,
      locked: newLocked,
    });

    this.reservations.delete(reservationId);

    return Ok(undefined);
  }

  /**
   * INTERNAL: Commits locked funds (order filled)
   * 
   * Removes funds from locked state (transferred to counterparty).
   */
  public async commitFunds(reservationId: ReservationId, actualAmount: Decimal): Promise<Result<void, WalletError>> {
    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      return Err(new WalletError(`Reservation ${reservationId} not found`));
    }

    if (DecimalUtils.isGreaterThan(actualAmount, reservation.amount)) {
      return Err(new WalletError('Cannot commit more than reserved amount'));
    }

    const balanceKey = this.getBalanceKey(reservation.userId, reservation.currency);
    const balance = this.balances.get(balanceKey);

    if (!balance) {
      return Err(new WalletError(`Balance not found for user ${reservation.userId}`));
    }

    // Remove committed funds from locked
    const newLocked = DecimalUtils.subtract(balance.locked, actualAmount);
    const newTotal = DecimalUtils.subtract(balance.total, actualAmount);

    if (DecimalUtils.isNegative(newLocked) || DecimalUtils.isNegative(newTotal)) {
      return Err(new WalletError('Balance would become negative'));
    }

    this.balances.set(balanceKey, {
      ...balance,
      locked: newLocked,
      total: newTotal,
    });

    // If fully committed, delete reservation
    if (DecimalUtils.isEqual(actualAmount, reservation.amount)) {
      this.reservations.delete(reservationId);
    }

    return Ok(undefined);
  }

  /**
   * PUBLIC: Gets balance for user and currency
   */
  public async getBalance(userId: UserId, currency: Currency): Promise<Result<Balance, WalletError>> {
    const balanceKey = this.getBalanceKey(userId, currency);
    const balance = this.balances.get(balanceKey);

    if (!balance) {
      // Return zero balance if not found
      return Ok({
        userId,
        currency,
        available: DecimalUtils.ZERO,
        locked: DecimalUtils.ZERO,
        total: DecimalUtils.ZERO,
      });
    }

    return Ok(balance);
  }

  /**
   * PUBLIC: Gets all balances for user
   */
  public async getAllBalances(userId: UserId): Promise<Result<readonly Balance[], WalletError>> {
    const userBalances: Balance[] = [];

    for (const balance of this.balances.values()) {
      if (balance.userId === userId) {
        userBalances.push(balance);
      }
    }

    return Ok(userBalances);
  }

  /**
   * INTERNAL: Credits funds to user account (deposits, trade proceeds)
   */
  public async creditFunds(
    userId: UserId,
    amount: Decimal,
    currency: Currency
  ): Promise<Result<void, WalletError>> {
    if (DecimalUtils.isLessThanOrEqual(amount, DecimalUtils.ZERO)) {
      return Err(new WalletError('Credit amount must be positive'));
    }

    const balanceKey = this.getBalanceKey(userId, currency);
    const balance = this.balances.get(balanceKey);

    if (!balance) {
      // Create new balance
      this.balances.set(balanceKey, {
        userId,
        currency,
        available: amount,
        locked: DecimalUtils.ZERO,
        total: amount,
      });
    } else {
      // Update existing balance
      const newAvailable = DecimalUtils.add(balance.available, amount);
      const newTotal = DecimalUtils.add(balance.total, amount);

      this.balances.set(balanceKey, {
        ...balance,
        available: newAvailable,
        total: newTotal,
      });
    }

    return Ok(undefined);
  }

  /**
   * INTERNAL: Validates all balances are non-negative
   */
  public async validateBalances(): Promise<Result<void, NegativeBalanceError>> {
    for (const balance of this.balances.values()) {
      if (DecimalUtils.isNegative(balance.available)) {
        return Err(new NegativeBalanceError(
          balance.userId,
          balance.currency,
          balance.available
        ));
      }

      if (DecimalUtils.isNegative(balance.locked)) {
        return Err(new NegativeBalanceError(
          balance.userId,
          balance.currency,
          balance.locked
        ));
      }

      if (DecimalUtils.isNegative(balance.total)) {
        return Err(new NegativeBalanceError(
          balance.userId,
          balance.currency,
          balance.total
        ));
      }

      // Verify total = available + locked
      const calculatedTotal = DecimalUtils.add(balance.available, balance.locked);
      if (!DecimalUtils.isEqual(balance.total, calculatedTotal)) {
        return Err(new NegativeBalanceError(
          balance.userId,
          balance.currency,
          balance.total
        ));
      }
    }

    return Ok(undefined);
  }

  /**
   * Helper: Generates unique balance key
   */
  private getBalanceKey(userId: UserId, currency: Currency): string {
    return `${userId}:${currency}`;
  }

  /**
   * Helper: Generates unique reservation ID
   */
  private generateReservationId(): ReservationId {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as ReservationId;
  }
}
