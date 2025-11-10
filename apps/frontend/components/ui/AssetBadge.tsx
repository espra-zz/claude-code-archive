/**
 * Asset Badge Component
 *
 * Displays asset name with real-time price and change indicator
 * Includes tooltip with detailed price information
 */

'use client';

import { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { usePrice } from '@/hooks/usePrices';
import { cn, formatPrice, formatPercentage, formatLargeNumber } from '@/lib/utils';

interface AssetBadgeProps {
  symbol: string;
  name: string;
  className?: string;
}

export function AssetBadge({ symbol, name, className }: AssetBadgeProps) {
  const { priceData, loading } = usePrice(symbol);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate on price change
  useEffect(() => {
    if (priceData && !loading) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [priceData?.price, loading]);

  if (loading || !priceData) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
          'border bg-gray-900/20 border-gray-500/30 animate-pulse',
          className
        )}
      >
        <span className="font-semibold text-white">{name}</span>
        <span className="text-gray-500">...</span>
      </span>
    );
  }

  const isPositive = priceData.change24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-900/20' : 'bg-red-900/20';
  const borderColor = isPositive ? 'border-green-500/30' : 'border-red-500/30';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md',
              'border transition-all duration-200 cursor-pointer',
              'hover:scale-105 hover:shadow-lg',
              isAnimating && 'animate-pulse-subtle',
              bgColor,
              borderColor,
              className
            )}
          >
            <span className="font-semibold text-white">{name}</span>
            <span className="text-gray-400 text-sm">$</span>
            <span className={cn('font-mono font-medium', changeColor)}>
              {formatPrice(priceData.price, '')}
            </span>
            <span className={cn('text-xs font-medium flex items-center gap-0.5', changeColor)}>
              <span className="text-[10px]">{arrow}</span>
              {Math.abs(priceData.change24h).toFixed(2)}%
            </span>
          </span>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            className={cn(
              'z-50 overflow-hidden rounded-lg shadow-2xl',
              'bg-gray-900 border border-gray-700',
              'px-4 py-3 text-sm',
              'animate-fade-in'
            )}
            sideOffset={5}
          >
            <div className="space-y-2 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="font-bold text-white">{name}</span>
                <span className="text-xs text-gray-400 uppercase">{symbol}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Price:</span>
                  <span className="font-mono text-white">{formatPrice(priceData.price)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">24h Change:</span>
                  <span className={cn('font-mono font-medium', changeColor)}>
                    {formatPercentage(priceData.change24h)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">24h High:</span>
                  <span className="font-mono text-white">{formatPrice(priceData.high24h)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">24h Low:</span>
                  <span className="font-mono text-white">{formatPrice(priceData.low24h)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">24h Volume:</span>
                  <span className="font-mono text-white">{formatLargeNumber(priceData.volume)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <div className="text-[10px] text-gray-500 text-center">
                  Real-time data from Binance
                </div>
              </div>
            </div>

            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
