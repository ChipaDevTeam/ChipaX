/**
 * FILE: apps/exchange/src/services/MatchingEngineService.ts
 * PURPOSE: Singleton service managing matching engines for all trading pairs
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: @chipax/core
 * 
 * DESCRIPTION:
 * Central service that manages MatchingEngine instances for each trading pair.
 * Provides thread-safe access to order processing, cancellation, and order book queries.
 */

import { MatchingEngine, WalletService } from '@chipatrade/core';
import type { TradingPair, Order, OrderId } from '@chipatrade/core';
import { Result, Err } from '@chipatrade/core';
import { OrderNotFoundError } from '@chipatrade/core';
import type { TradeResult } from '@chipatrade/core';

/**
 * Singleton service managing all matching engines
 */
export class MatchingEngineService {
  private static instance: MatchingEngineService | null = null;
  private engines: Map<TradingPair, MatchingEngine> = new Map();
  private walletService: WalletService;

  private constructor() {
    this.walletService = new WalletService();
    this.initializeEngines();
  }

  /**
   * Gets singleton instance
   */
  public static getInstance(): MatchingEngineService {
    if (!MatchingEngineService.instance) {
      MatchingEngineService.instance = new MatchingEngineService();
    }
    return MatchingEngineService.instance;
  }

  /**
   * Initializes matching engines for configured trading pairs
   */
  private initializeEngines(): void {
    const tradingPairs: TradingPair[] = [
      'BTC/USDT' as TradingPair,
      'ETH/USDT' as TradingPair,
      'SOL/USDT' as TradingPair,
      'XRP/USDT' as TradingPair,
    ];

    for (const pair of tradingPairs) {
      this.engines.set(pair, new MatchingEngine(pair));
    }
  }

  /**
   * Gets matching engine for trading pair
   */
  private getEngine(symbol: TradingPair): Result<MatchingEngine, Error> {
    const engine = this.engines.get(symbol);
    if (!engine) {
      return Err(new Error(`No matching engine for ${symbol}`));
    }
    return { ok: true, value: engine };
  }

  /**
   * Processes an order through the matching engine
   */
  public processOrder(order: Order): Result<TradeResult, Error> {
    const engineResult = this.getEngine(order.symbol);
    if (!engineResult.ok) {
      return engineResult;
    }

    return engineResult.value.processOrder(order);
  }

  /**
   * Cancels an order
   */
  public cancelOrder(symbol: TradingPair, orderId: OrderId) {
    const engineResult = this.getEngine(symbol);
    if (!engineResult.ok) {
      return Err(new OrderNotFoundError(orderId));
    }

    return engineResult.value.cancelOrder(orderId);
  }

  /**
   * Gets order book snapshot
   */
  public getOrderBookSnapshot(symbol: TradingPair, depth: number = 20) {
    const engineResult = this.getEngine(symbol);
    if (!engineResult.ok) {
      return engineResult;
    }

    const snapshot = engineResult.value.getOrderBookSnapshot(depth);
    return { ok: true, value: snapshot };
  }

  /**
   * Gets best bid/ask prices
   */
  public getBestPrices(symbol: TradingPair): Result<{
    bestBid: { some: true; value: string } | { some: false };
    bestAsk: { some: true; value: string } | { some: false };
  }, Error> {
    const engineResult = this.getEngine(symbol);
    if (!engineResult.ok) {
      return engineResult;
    }

    const prices = engineResult.value.getBestPrices();
    return { ok: true, value: prices };
  }

  /**
   * Gets wallet service instance
   */
  public getWalletService(): WalletService {
    return this.walletService;
  }
}
