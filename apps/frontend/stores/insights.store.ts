/**
 * Insights Store
 *
 * Zustand store for managing AI insights state
 */

import { create } from 'zustand';

export interface Insight {
  id: string;
  content: string;
  sentiment: number;
  category: string;
  assets: Array<{
    symbol: string;
    name: string;
    position: number;
    length: number;
  }>;
  createdAt: string;
}

interface InsightsStore {
  insights: Insight[];
  loading: boolean;
  error: string | null;

  // Actions
  setInsights: (insights: Insight[]) => void;
  addInsight: (insight: Insight) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearInsights: () => void;
}

export const useInsightsStore = create<InsightsStore>((set) => ({
  insights: [],
  loading: true,
  error: null,

  setInsights: (insights) => set({ insights, loading: false }),

  addInsight: (insight) =>
    set((state) => ({
      insights: [insight, ...state.insights].slice(0, 50), // Keep last 50
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearInsights: () => set({ insights: [], loading: false, error: null }),
}));
