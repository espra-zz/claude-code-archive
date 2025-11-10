/**
 * Insight Card Component
 *
 * Displays an AI-generated insight with highlighted asset mentions
 */

'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AssetBadge } from '@/components/ui/AssetBadge';
import { SentimentIndicator } from '@/components/ui/SentimentIndicator';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: {
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
  };
}

export function InsightCard({ insight }: InsightCardProps) {
  // Replace asset mentions in text with AssetBadge components
  const enrichedContent = useMemo(() => {
    if (!insight.assets || insight.assets.length === 0) {
      return <span className="text-gray-100 leading-relaxed">{insight.content}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort assets by position
    const sortedAssets = [...insight.assets].sort((a, b) => a.position - b.position);

    sortedAssets.forEach((asset, idx) => {
      // Add text before the asset
      if (asset.position > lastIndex) {
        const textBefore = insight.content.substring(lastIndex, asset.position);
        elements.push(
          <span key={`text-${idx}`} className="text-gray-100">
            {textBefore}
          </span>
        );
      }

      // Add the asset badge
      elements.push(
        <AssetBadge
          key={`asset-${asset.symbol}-${idx}`}
          symbol={asset.symbol}
          name={asset.name}
        />
      );

      lastIndex = asset.position + asset.length;
    });

    // Add remaining text after last asset
    if (lastIndex < insight.content.length) {
      elements.push(
        <span key="text-final" className="text-gray-100">
          {insight.content.substring(lastIndex)}
        </span>
      );
    }

    return <div className="text-gray-100 leading-relaxed space-x-1">{elements}</div>;
  }, [insight]);

  // Format timestamp
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(insight.createdAt), { addSuffix: true });
    } catch {
      return 'recently';
    }
  }, [insight.createdAt]);

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Bitcoin: 'bg-orange-900/30 text-orange-400 border-orange-500/20',
      Ethereum: 'bg-purple-900/30 text-purple-400 border-purple-500/20',
      'Layer-1': 'bg-blue-900/30 text-blue-400 border-blue-500/20',
      DeFi: 'bg-green-900/30 text-green-400 border-green-500/20',
      NFT: 'bg-pink-900/30 text-pink-400 border-pink-500/20',
      Regulation: 'bg-red-900/30 text-red-400 border-red-500/20',
      Institutional: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/20',
      'Market Analysis': 'bg-gray-900/30 text-gray-400 border-gray-500/20',
    };

    return colors[category] || colors['Market Analysis'];
  };

  return (
    <article
      className={cn(
        'glass-effect rounded-lg p-6 space-y-4',
        'transition-all duration-200',
        'hover:border-primary/20 hover:shadow-lg',
        'animate-fade-in'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-mono">{timeAgo}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs border font-medium',
              getCategoryColor(insight.category)
            )}
          >
            {insight.category}
          </span>
        </div>

        <SentimentIndicator value={insight.sentiment} showLabel={false} />
      </div>

      {/* Content with asset badges */}
      <div className="text-base leading-relaxed">{enrichedContent}</div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="text-green-400">●</span>
            AI Generated
          </span>
          <span>•</span>
          <span>{insight.assets.length} asset{insight.assets.length !== 1 && 's'} mentioned</span>
        </div>
      </div>
    </article>
  );
}
