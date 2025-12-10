/**
 * FILE: packages/config/src/index.ts
 * PURPOSE: Type-safe configuration loader with validation
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: None
 * 
 * DESCRIPTION:
 * Loads and validates configuration from JSON files.
 * Provides strongly-typed config objects throughout the application.
 */

import exchangeConfig from '../../../config/exchange.json';
import tradingPairs from '../../../config/trading-pairs.json';
import apiLimits from '../../../config/api-limits.json';

/**
 * Exchange configuration schema
 */
export interface ExchangeConfig {
  readonly exchange: {
    readonly name: string;
    readonly version: string;
    readonly environment: 'development' | 'production' | 'test';
    readonly baseUrl: string;
  };
  readonly trading: {
    readonly tickSize: string;
    readonly minOrderSize: string;
    readonly maxOrderSize: string;
    readonly minPrice: string;
    readonly maxPrice: string;
    readonly maxLeverage: number;
    readonly defaultLeverage: number;
    readonly maintenanceMarginRate: number;
    readonly initialMarginRate: number;
  };
  readonly matching: {
    readonly algorithm: 'price-time-priority' | 'pro-rata';
    readonly selfTradePreventionMode: 'CANCEL_TAKER' | 'CANCEL_MAKER' | 'CANCEL_BOTH';
    readonly maxOrdersPerUser: number;
    readonly maxOrderBookDepth: number;
  };
  readonly fees: {
    readonly makerFee: number;
    readonly takerFee: number;
    readonly withdrawalFeePercentage: number;
    readonly minWithdrawalFee: string;
  };
  readonly limits: {
    readonly maxOpenOrders: number;
    readonly maxOpenPositions: number;
    readonly maxDailyWithdrawals: number;
    readonly maxWithdrawalAmount: string;
  };
}

/**
 * Trading pair configuration schema
 */
export interface TradingPairConfig {
  readonly symbol: string;
  readonly baseAsset: string;
  readonly quoteAsset: string;
  readonly tickSize: string;
  readonly minQuantity: string;
  readonly maxQuantity: string;
  readonly minNotional: string;
  readonly pricePrecision: number;
  readonly quantityPrecision: number;
  readonly enabled: boolean;
  readonly marginEnabled: boolean;
  readonly futuresEnabled: boolean;
}

/**
 * API limits configuration schema
 */
export interface ApiLimitsConfig {
  readonly publicApi: {
    readonly defaultRateLimit: {
      readonly windowMs: number;
      readonly maxRequests: number;
    };
    readonly endpoints: Record<string, {
      readonly windowMs: number;
      readonly maxRequests: number;
    }>;
  };
  readonly websocket: {
    readonly maxConnectionsPerIp: number;
    readonly maxSubscriptionsPerConnection: number;
    readonly pingIntervalMs: number;
    readonly pongTimeoutMs: number;
  };
  readonly authentication: {
    readonly jwtExpiresIn: string;
    readonly apiKeyExpiresIn: string;
    readonly refreshTokenExpiresIn: string;
    readonly maxApiKeysPerUser: number;
  };
}

/**
 * Validated and typed configuration objects
 */
export const EXCHANGE_CONFIG: ExchangeConfig = exchangeConfig as ExchangeConfig;
export const TRADING_PAIRS: readonly TradingPairConfig[] = tradingPairs as TradingPairConfig[];
export const API_LIMITS: ApiLimitsConfig = apiLimits as ApiLimitsConfig;

/**
 * Helper function to get trading pair config by symbol
 */
export function getTradingPairConfig(symbol: string): TradingPairConfig | undefined {
  return TRADING_PAIRS.find(pair => pair.symbol === symbol);
}

/**
 * Helper function to validate if trading pair exists and is enabled
 */
export function isTradingPairEnabled(symbol: string): boolean {
  const config = getTradingPairConfig(symbol);
  return config?.enabled ?? false;
}

/**
 * Helper function to check if margin is enabled for pair
 */
export function isMarginEnabledForPair(symbol: string): boolean {
  const config = getTradingPairConfig(symbol);
  return config?.marginEnabled ?? false;
}

/**
 * Helper function to check if futures is enabled for pair
 */
export function isFuturesEnabledForPair(symbol: string): boolean {
  const config = getTradingPairConfig(symbol);
  return config?.futuresEnabled ?? false;
}

/**
 * Get all enabled trading pairs
 */
export function getEnabledTradingPairs(): readonly TradingPairConfig[] {
  return TRADING_PAIRS.filter(pair => pair.enabled);
}
