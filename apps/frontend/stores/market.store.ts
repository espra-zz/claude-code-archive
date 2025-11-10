/**
 * Market Store
 *
 * Zustand store for managing market data state
 */

import { create } from 'zustand';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface MarketStore {
  prices: Map<string, PriceData>;
  topMovers: PriceData[];
  topGainers: PriceData[];
  topLosers: PriceData[];
  loading: boolean;
  error: string | null;

  // Actions
  updatePrice: (symbol: string, data: PriceData) => void;
  setTopMovers: (movers: PriceData[]) => void;
  setTopGainers: (gainers: PriceData[]) => void;
  setTopLosers: (losers: PriceData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMarketData: () => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  prices: new Map(),
  topMovers: [],
  topGainers: [],
  topLosers: [],
  loading: true,
  error: null,

  updatePrice: (symbol, data) =>
    set((state) => {
      const newPrices = new Map(state.prices);
      newPrices.set(symbol, data);
      return { prices: newPrices };
    }),

  setTopMovers: (movers) => set({ topMovers: movers, loading: false }),

  setTopGainers: (gainers) => set({ topGainers: gainers }),

  setTopLosers: (losers) => set({ topLosers: losers }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearMarketData: () =>
    set({
      prices: new Map(),
      topMovers: [],
      topGainers: [],
      topLosers: [],
      loading: false,
      error: null,
    }),
}));
