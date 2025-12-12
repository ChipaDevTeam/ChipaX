/**
 * ChipaTrade API Type Definitions
 * Generated from OpenAPI 3.1.0 specification
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ResponseModel {
  success: boolean;
  message: string;
  data?: any;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  wallet_address?: string | null;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
}

export interface UserResponse {
  email: string;
  username: string;
  id: string;
  wallet_address: string;
  is_active: boolean;
  is_verified: boolean;
  total_trades: number;
  total_volume_usd: number;
  total_fees_paid_usd: number;
  referral_code: string | null;
  created_at: string;
  last_login: string | null;
}

export interface UserUpdate {
  username?: string | null;
  email?: string | null;
  password?: string | null;
}

// ============================================================================
// Trading Types
// ============================================================================

export interface OrderCreate {
  coin: string;
  is_buy: boolean;
  size: number;
  price: number;
  reduce_only?: boolean;
  post_only?: boolean;
  time_in_force?: string;
  client_order_id?: string | null;
}

export interface MarketOrderCreate {
  coin: string;
  is_buy: boolean;
  size: number;
  slippage?: number;
  client_order_id?: string | null;
}

export interface OrderCancel {
  coin: string;
  order_id: string;
}

export interface OrderModify {
  coin: string;
  order_id: string;
  new_price?: number | null;
  new_size?: number | null;
}

export interface TPSLOrder {
  coin: string;
  is_buy: boolean;
  size: number;
  take_profit_price?: number | null;
  stop_loss_price?: number | null;
}

export interface Position {
  coin: string;
  size: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
  leverage: number;
  margin: number;
  side: 'long' | 'short';
}

export interface Order {
  order_id: string;
  coin: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  filled_size: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  type: 'limit' | 'market';
  created_at: string;
  updated_at: string;
}

export interface Fill {
  fill_id: string;
  order_id: string;
  coin: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  fee: number;
  timestamp: string;
}

// ============================================================================
// Market Data Types
// ============================================================================

export interface MarketMeta {
  coin: string;
  symbol: string;
  base_currency: string;
  quote_currency: string;
  min_size: number;
  max_size: number;
  tick_size: number;
  maker_fee: number;
  taker_fee: number;
}

export interface Price {
  coin: string;
  price: number;
  timestamp: string;
}

export interface OrderBook {
  coin: string;
  bids: [number, number][]; // [price, size][]
  asks: [number, number][]; // [price, size][]
  timestamp: string;
}

export interface Candle {
  time: number; // timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FundingRate {
  coin: string;
  rate: number;
  next_funding_time: string;
}

// ============================================================================
// Account Types
// ============================================================================

export interface AccountState {
  account_value: number;
  total_margin_used: number;
  total_unrealized_pnl: number;
  total_raw_usd: number;
  withdrawable: number;
  margin_summary: {
    account_value: number;
    total_margin_used: number;
    total_ntl_pos: number;
    total_raw_usd: number;
  };
}

export interface Balance {
  total_account_value: number;
  available_balance: number;
  margin_used: number;
  withdrawable_balance: number;
  cross_margin_summary: {
    account_value: number;
    total_margin_used: number;
    total_ntl_pos: number;
    total_raw_usd: number;
  };
}

// ============================================================================
// Fee Types
// ============================================================================

export interface FeePayment {
  id: string;
  user_id: string;
  coin: string;
  amount: number;
  status: 'pending' | 'collected';
  created_at: string;
}

export interface FeeStatistics {
  total_fees_collected_usd: number;
  total_fees_pending_usd: number;
  total_transactions: number;
  fees_by_coin: Record<string, number>;
  fees_by_month: Record<string, number>;
  average_fee_per_trade: number;
}

// ============================================================================
// Share Types
// ============================================================================

export interface PNLShareCreate {
  coin: string;
  position_type: string;
  leverage: number;
  roi_percent: number;
  entry_price: number;
  closing_price: number;
  followers?: number | null;
  timestamp?: string | null;
}

export interface PNLShareResponse {
  success: boolean;
  message: string;
  download_url: string;
  expires_after_download?: boolean;
}

// ============================================================================
// Health Types
// ============================================================================

export interface HealthResponse {
  status: string;
  version: string;
  database: string;
  hyperliquid: string;
}
