/**
 * Custom React Hooks for Trading Data
 * Provides real-time data fetching and caching
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api-client';

// ============================================================================
// Positions Hook
// ============================================================================

export function usePositions(refreshInterval: number = 5000) {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await apiClient.getPositions();
      setPositions(response.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPositions, refreshInterval]);

  return { positions, isLoading, error, refetch: fetchPositions };
}

// ============================================================================
// Orders Hook
// ============================================================================

export function useOrders(coin?: string, refreshInterval: number = 3000) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiClient.getOpenOrders(coin);
      setOrders(response.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [coin]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOrders, refreshInterval]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

// ============================================================================
// Fills (Trade History) Hook
// ============================================================================

export function useFills(coin?: string, limit: number = 100) {
  const [fills, setFills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFills = useCallback(async () => {
    try {
      const response = await apiClient.getFills(coin, limit);
      setFills(response.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [coin, limit]);

  useEffect(() => {
    fetchFills();
  }, [fetchFills]);

  return { fills, isLoading, error, refetch: fetchFills };
}

// ============================================================================
// Balance Hook
// ============================================================================

export function useBalance(refreshInterval: number = 10000) {
  const [balance, setBalance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!apiClient.isAuthenticated()) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getBalance();
      setBalance(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      // If 401/403, user is not authenticated
      if ((err as any).status === 401 || (err as any).status === 403) {
        setBalance(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalance, refreshInterval]);

  return { balance, isLoading, error, refetch: fetchBalance };
}

// ============================================================================
// Market Data Hooks
// ============================================================================

export function useMarketMeta() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await apiClient.getMarketMeta();
        setMarkets(response.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return { markets, isLoading, error };
}

export function usePrice(coin: string, refreshInterval: number = 2000) {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!coin) return;
    
    try {
      const response = await apiClient.getPrice(coin);
      setPrice(response.data?.price || null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [coin]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPrice, refreshInterval]);

  return { price, isLoading, error, refetch: fetchPrice };
}

export function useOrderBook(coin: string, depth: number = 20, refreshInterval: number = 1000) {
  const [orderBook, setOrderBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrderBook = useCallback(async () => {
    if (!coin) return;
    
    try {
      const response = await apiClient.getOrderBook(coin, depth);
      setOrderBook(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [coin, depth]);

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchOrderBook, refreshInterval]);

  return { orderBook, isLoading, error, refetch: fetchOrderBook };
}

export function useFundingRates(refreshInterval: number = 60000) {
  const [fundingRates, setFundingRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFundingRates = useCallback(async () => {
    try {
      const response = await apiClient.getFundingRates();
      setFundingRates(response.data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFundingRates();
    const interval = setInterval(fetchFundingRates, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchFundingRates, refreshInterval]);

  return { fundingRates, isLoading, error, refetch: fetchFundingRates };
}

// ============================================================================
// Trading Actions Hook
// ============================================================================

export function useTrading() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const placeLimitOrder = useCallback(async (order: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.placeLimitOrder(order);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const placeMarketOrder = useCallback(async (order: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.placeMarketOrder(order);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelOrder = useCallback(async (coin: string, orderId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.cancelOrder({ coin, order_id: orderId });
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelAllOrders = useCallback(async (coin?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.cancelAllOrders(coin);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const marketClose = useCallback(async (coin: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.marketClosePosition(coin);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    placeLimitOrder,
    placeMarketOrder,
    cancelOrder,
    cancelAllOrders,
    marketClose,
    isSubmitting,
    error,
  };
}
