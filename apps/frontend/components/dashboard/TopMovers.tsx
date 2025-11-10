/**
 * Top Movers Component
 *
 * Displays top moving cryptocurrency assets
 */

'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, formatPrice, formatPercentage, formatLargeNumber } from '@/lib/utils';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

interface MarketOverviewData {
  topMovers: PriceData[];
  topGainers: PriceData[];
  topLosers: PriceData[];
  timestamp: number;
}

export function TopMovers() {
  const { socket, isConnected } = useSocket();
  const [marketData, setMarketData] = useState<MarketOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movers' | 'gainers' | 'losers'>('movers');

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to market overview
    socket.emit('subscribe-market-overview');

    // Listen for updates
    const handleMarketOverview = (data: MarketOverviewData) => {
      setMarketData(data);
      setLoading(false);
    };

    socket.on('market-overview', handleMarketOverview);

    return () => {
      socket.off('market-overview', handleMarketOverview);
    };
  }, [socket, isConnected]);

  if (loading || !marketData) {
    return (
      <div className="glass-effect rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">📊 Top Movers</h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const currentData =
    activeTab === 'movers'
      ? marketData.topMovers.slice(0, 10)
      : activeTab === 'gainers'
      ? marketData.topGainers.slice(0, 10)
      : marketData.topLosers.slice(0, 10);

  return (
    <div className="glass-effect rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📊 Market Overview
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="pulse-dot" style={{ height: '6px', width: '6px' }}></span>
          <span>Live</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg">
        <button
          onClick={() => setActiveTab('movers')}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
            activeTab === 'movers'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Top Movers
        </button>
        <button
          onClick={() => setActiveTab('gainers')}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
            activeTab === 'gainers'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Gainers
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors',
            activeTab === 'losers'
              ? 'bg-red-600 text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Losers
        </button>
      </div>

      {/* Asset List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {currentData.map((asset, index) => {
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                'transition-colors duration-200',
                'hover:bg-white/5 cursor-pointer'
              )}
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 w-6">
                  #{index + 1}
                </span>
                <div>
                  <div className="font-semibold text-white">{asset.symbol}</div>
                  <div className="text-xs text-gray-500">
                    {formatLargeNumber(asset.volume)} vol
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="text-right">
                <div className="font-mono text-white font-medium">
                  {formatPrice(asset.price)}
                </div>
                <div
                  className={cn(
                    'text-xs font-medium flex items-center justify-end gap-1',
                    isPositive ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  <span>{isPositive ? '▲' : '▼'}</span>
                  <span>{formatPercentage(asset.change24h, false)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/5 text-xs text-gray-500 text-center">
        Updated {new Date(marketData.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
