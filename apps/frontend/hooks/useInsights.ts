/**
 * useInsights Hook
 *
 * Hook for managing insights subscriptions
 */

'use client';

import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useInsightsStore } from '@/stores/insights.store';

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

export function useInsights() {
  const { socket, isConnected } = useSocket();
  const { insights, addInsight, setInsights, loading, setLoading } = useInsightsStore();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to insights
    socket.emit('subscribe-insights');

    // Listen for recent insights (initial load)
    const handleRecentInsights = (data: Insight[]) => {
      setInsights(data);
      setLoading(false);
    };

    // Listen for new insights
    const handleNewInsight = (insight: Insight) => {
      addInsight(insight);
    };

    socket.on('recent-insights', handleRecentInsights);
    socket.on('new-insight', handleNewInsight);

    // Cleanup
    return () => {
      socket.emit('unsubscribe-insights');
      socket.off('recent-insights', handleRecentInsights);
      socket.off('new-insight', handleNewInsight);
    };
  }, [socket, isConnected, addInsight, setInsights, setLoading]);

  return { insights, loading };
}
