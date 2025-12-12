/**
 * ChipaTrade API Client
 * Centralized API service for all ChipaTrade endpoints
 */

import type {
  UserCreate,
  UserLogin,
  UserUpdate,
  UserResponse,
  TokenResponse,
  ResponseModel,
  OrderCreate,
  MarketOrderCreate,
  OrderCancel,
  OrderModify,
  TPSLOrder,
  FeeStatistics,
  PNLShareCreate,
  PNLShareResponse,
  HealthResponse,
} from '@/types/api';

const getAPIBaseURL = () => {
  if (typeof window !== 'undefined') {
    return (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL || 'https://exchange-api.chipatrade.com';
  }
  return 'https://exchange-api.chipatrade.com';
};

const API_BASE_URL = getAPIBaseURL();

class ChipaTradeAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ChipaTradeAPIError';
  }
}

class ChipaTradeAPI {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  private loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      // refresh_token also loaded but stored separately in localStorage
    }
  }

  private saveTokensToStorage(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
    this.accessToken = accessToken;
  }

  private clearTokensFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.accessToken = null;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ============================================================================
  // HTTP Client
  // ============================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ChipaTradeAPIError(
          data.message || data.detail || 'API request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ChipaTradeAPIError) {
        throw error;
      }
      throw new ChipaTradeAPIError(
        error instanceof Error ? error.message : 'Network error',
        undefined,
        error
      );
    }
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ============================================================================
  // Health
  // ============================================================================

  async healthCheck(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/health');
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async register(userData: UserCreate): Promise<ResponseModel> {
    const response = await this.post<ResponseModel>('/api/v1/auth/register', userData);
    return response;
  }

  async login(credentials: UserLogin): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>('/api/v1/auth/login', credentials);
    this.saveTokensToStorage(response.access_token, response.refresh_token);
    return response;
  }

  async getCurrentUser(): Promise<any> {
    return this.get<any>('/api/v1/auth/me');
  }

  async logout(): Promise<ResponseModel> {
    const response = await this.post<ResponseModel>('/api/v1/auth/logout');
    this.clearTokensFromStorage();
    return response;
  }

  // ============================================================================
  // Trading
  // ============================================================================

  async placeLimitOrder(order: OrderCreate): Promise<ResponseModel> {
    return this.post<ResponseModel>('/api/v1/trading/order', order);
  }

  async placeMarketOrder(order: MarketOrderCreate): Promise<ResponseModel> {
    return this.post<ResponseModel>('/api/v1/trading/market-order', order);
  }

  async marketClosePosition(coin: string): Promise<ResponseModel> {
    return this.post<ResponseModel>(`/api/v1/trading/market-close?coin=${coin}`);
  }

  async cancelOrder(cancel: OrderCancel): Promise<ResponseModel> {
    return this.post<ResponseModel>('/api/v1/trading/cancel', cancel);
  }

  async cancelAllOrders(coin?: string): Promise<ResponseModel> {
    const endpoint = coin
      ? `/api/v1/trading/cancel-all?coin=${coin}`
      : '/api/v1/trading/cancel-all';
    return this.post<ResponseModel>(endpoint);
  }

  async modifyOrder(modify: OrderModify): Promise<ResponseModel> {
    return this.post<ResponseModel>('/api/v1/trading/modify', modify);
  }

  async setTPSL(tpsl: TPSLOrder): Promise<ResponseModel> {
    return this.post<ResponseModel>('/api/v1/trading/tpsl', tpsl);
  }

  async getPositions(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/trading/positions');
  }

  async getOpenOrders(coin?: string): Promise<ResponseModel> {
    const endpoint = coin
      ? `/api/v1/trading/orders?coin=${coin}`
      : '/api/v1/trading/orders';
    return this.get<ResponseModel>(endpoint);
  }

  async getFills(coin?: string, limit: number = 100): Promise<ResponseModel> {
    const params = new URLSearchParams();
    if (coin) params.append('coin', coin);
    params.append('limit', limit.toString());
    return this.get<ResponseModel>(`/api/v1/trading/fills?${params.toString()}`);
  }

  // ============================================================================
  // Users
  // ============================================================================

  async getMyProfile(): Promise<UserResponse> {
    return this.get<UserResponse>('/api/v1/users/me');
  }

  async updateMyProfile(update: UserUpdate): Promise<UserResponse> {
    return this.put<UserResponse>('/api/v1/users/me', update);
  }

  async getAccountState(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/users/account');
  }

  async getBalance(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/users/balance');
  }

  // ============================================================================
  // Fees
  // ============================================================================

  async getMyFees(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/fees/my-fees');
  }

  async getFeeStatistics(): Promise<FeeStatistics> {
    return this.get<FeeStatistics>('/api/v1/fees/statistics');
  }

  async getCollectedFees(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/fees/collected');
  }

  // ============================================================================
  // Market Data
  // ============================================================================

  async getMarketMeta(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/market/meta');
  }

  async getPrice(coin: string): Promise<ResponseModel> {
    return this.get<ResponseModel>(`/api/v1/market/price/${coin}`);
  }

  async getOrderBook(coin: string, depth: number = 20): Promise<ResponseModel> {
    return this.get<ResponseModel>(`/api/v1/market/orderbook/${coin}?depth=${depth}`);
  }

  async getCandles(
    coin: string,
    interval: string = '1h',
    startTime?: number,
    endTime?: number
  ): Promise<ResponseModel> {
    const params = new URLSearchParams();
    params.append('interval', interval);
    if (startTime) params.append('start_time', startTime.toString());
    if (endTime) params.append('end_time', endTime.toString());
    return this.get<ResponseModel>(`/api/v1/market/candles/${coin}?${params.toString()}`);
  }

  async getFundingRates(): Promise<ResponseModel> {
    return this.get<ResponseModel>('/api/v1/market/funding-rates');
  }

  // ============================================================================
  // Share
  // ============================================================================

  async createPNLShare(share: PNLShareCreate): Promise<PNLShareResponse> {
    return this.post<PNLShareResponse>('/api/v1/share/pnl', share);
  }
}

// Export singleton instance
export const apiClient = new ChipaTradeAPI();

// Export class for custom instances
export default ChipaTradeAPI;

// Export error class
export { ChipaTradeAPIError };
