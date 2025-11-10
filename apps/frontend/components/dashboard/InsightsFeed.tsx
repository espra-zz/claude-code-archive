/**
 * Insights Feed Component
 *
 * Displays a feed of AI-generated market insights
 */

'use client';

import { useInsights } from '@/hooks/useInsights';
import { InsightCard } from './InsightCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function InsightsFeed() {
  const { insights, loading } = useInsights();

  if (loading) {
    return (
      <div className="glass-effect rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 mt-4">Loading market insights...</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="glass-effect rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-semibold text-white mb-2">No insights yet</h3>
        <p className="text-gray-400">
          AI is analyzing the market. New insights will appear here shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">🤖</span>
          AI Market Analysis
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="pulse-dot"></span>
          <span>Live Updates</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {insights.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-6">
          Showing {insights.length} insight{insights.length !== 1 && 's'}
        </div>
      )}
    </div>
  );
}
