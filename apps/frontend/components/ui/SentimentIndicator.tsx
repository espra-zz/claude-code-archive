/**
 * Sentiment Indicator Component
 *
 * Visual indicator for market sentiment (-1 to 1)
 */

'use client';

import { cn } from '@/lib/utils';

interface SentimentIndicatorProps {
  value: number; // -1 (bearish) to 1 (bullish)
  showLabel?: boolean;
  className?: string;
}

export function SentimentIndicator({
  value,
  showLabel = true,
  className,
}: SentimentIndicatorProps) {
  // Clamp value between -1 and 1
  const sentiment = Math.max(-1, Math.min(1, value));

  // Determine sentiment category
  let label = 'Neutral';
  let color = 'text-gray-400';
  let bgColor = 'bg-gray-500';
  let emoji = '😐';

  if (sentiment > 0.3) {
    label = 'Bullish';
    color = 'text-green-400';
    bgColor = 'bg-green-500';
    emoji = '📈';
  } else if (sentiment > 0.1) {
    label = 'Slightly Bullish';
    color = 'text-green-400';
    bgColor = 'bg-green-400';
    emoji = '🙂';
  } else if (sentiment < -0.3) {
    label = 'Bearish';
    color = 'text-red-400';
    bgColor = 'bg-red-500';
    emoji = '📉';
  } else if (sentiment < -0.1) {
    label = 'Slightly Bearish';
    color = 'text-red-400';
    bgColor = 'bg-red-400';
    emoji = '😕';
  }

  // Calculate percentage for progress bar
  const percentage = ((sentiment + 1) / 2) * 100;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showLabel && (
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{emoji}</span>
          <span className={cn('text-sm font-medium', color)}>{label}</span>
        </div>
      )}

      <div className="relative h-2 w-20 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute top-0 left-0 h-full transition-all duration-300',
            bgColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-xs text-gray-500 font-mono">
        {sentiment.toFixed(2)}
      </span>
    </div>
  );
}
