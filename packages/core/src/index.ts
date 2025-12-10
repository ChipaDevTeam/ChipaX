/**
 * FILE: packages/core/src/index.ts
 * PURPOSE: Main export point for ChipaTrade core package
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: All core modules
 */

// Export all types
export * from './types';

// Export decimal utilities
export * as DecimalUtils from './utils/Decimal';

// Export matching engine components
export { PriceLevel } from './matching-engine/PriceLevel';
export { OrderBook } from './matching-engine/OrderBook';
export { MatchingEngine } from './matching-engine/MatchingEngine';

// Export wallet service
export { WalletService } from './wallet/WalletService';
export type { Balance, Currency, ReservationId } from './wallet/WalletService';
