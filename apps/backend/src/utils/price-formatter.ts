/**
 * Price Formatter Utility
 *
 * Provides utilities for formatting prices, percentages, and market data
 */

export class PriceFormatter {
  /**
   * Format price with appropriate decimal places
   * @param price - The price value
   * @param currency - Currency symbol (default: "$")
   * @returns Formatted price string
   */
  static formatPrice(price: number, currency: string = '$'): string {
    if (price >= 1000) {
      return `${currency}${price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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
   * @param change - The percentage change
   * @param includeSign - Include + sign for positive values
   * @returns Formatted percentage string
   */
  static formatPercentage(change: number, includeSign: boolean = true): string {
    const sign = includeSign && change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  /**
   * Format large numbers (volume, market cap)
   * @param value - The number to format
   * @returns Formatted string with K, M, B suffixes
   */
  static formatLargeNumber(value: number): string {
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
   * Determine if price change is positive, negative, or neutral
   * @param change - The price change value
   * @returns "positive" | "negative" | "neutral"
   */
  static getChangeType(change: number): 'positive' | 'negative' | 'neutral' {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Format timestamp to relative time
   * @param timestamp - Unix timestamp or Date
   * @returns Relative time string
   */
  static formatRelativeTime(timestamp: Date | number): string {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
