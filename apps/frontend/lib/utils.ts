/**
 * Utility Functions
 *
 * Helper functions for the frontend application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number, currency: string = '$'): string {
  if (price >= 1000) {
    return `${currency}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (price >= 1) {
    return `${currency}${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `${currency}${price.toFixed(4)}`;
  } else {
    return `${currency}${price.toFixed(8)}`;
  }
}

/**
 * Format percentage change
 */
export function formatPercentage(change: number, includeSign: boolean = true): string {
  const sign = includeSign && change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Get color for price change
 */
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get background color for price change
 */
export function getChangeBgColor(change: number): string {
  if (change > 0) return 'bg-green-900/20';
  if (change < 0) return 'bg-red-900/20';
  return 'bg-gray-900/20';
}

/**
 * Get border color for price change
 */
export function getChangeBorderColor(change: number): string {
  if (change > 0) return 'border-green-500/30';
  if (change < 0) return 'border-red-500/30';
  return 'border-gray-500/30';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
