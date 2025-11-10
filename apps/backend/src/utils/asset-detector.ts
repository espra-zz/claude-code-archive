/**
 * Asset Detector Utility
 *
 * Detects cryptocurrency and asset mentions in text and returns their positions
 * for inline price display in the frontend.
 */

export interface DetectedAsset {
  symbol: string;
  name: string;
  position: number;
  length: number;
}

export interface AssetInfo {
  name: string;
  patterns: string[];
  category?: string;
}

export class AssetDetector {
  private assetDictionary = new Map<string, AssetInfo>([
    // Major Cryptocurrencies
    ['BTC', {
      name: 'Bitcoin',
      patterns: ['Bitcoin', 'BTC', 'bitcoin', 'btc'],
      category: 'crypto'
    }],
    ['ETH', {
      name: 'Ethereum',
      patterns: ['Ethereum', 'ETH', 'ethereum', 'eth', 'Ether'],
      category: 'crypto'
    }],
    ['SOL', {
      name: 'Solana',
      patterns: ['Solana', 'SOL', 'solana', 'sol'],
      category: 'crypto'
    }],
    ['ADA', {
      name: 'Cardano',
      patterns: ['Cardano', 'ADA', 'cardano', 'ada'],
      category: 'crypto'
    }],
    ['DOT', {
      name: 'Polkadot',
      patterns: ['Polkadot', 'DOT', 'polkadot', 'dot'],
      category: 'crypto'
    }],
    ['MATIC', {
      name: 'Polygon',
      patterns: ['Polygon', 'MATIC', 'polygon', 'matic', 'Matic'],
      category: 'crypto'
    }],
    ['LINK', {
      name: 'Chainlink',
      patterns: ['Chainlink', 'LINK', 'chainlink', 'link'],
      category: 'crypto'
    }],
    ['AVAX', {
      name: 'Avalanche',
      patterns: ['Avalanche', 'AVAX', 'avalanche', 'avax'],
      category: 'crypto'
    }],
    ['UNI', {
      name: 'Uniswap',
      patterns: ['Uniswap', 'UNI', 'uniswap', 'uni'],
      category: 'crypto'
    }],
    ['XRP', {
      name: 'Ripple',
      patterns: ['Ripple', 'XRP', 'ripple', 'xrp'],
      category: 'crypto'
    }],
    ['DOGE', {
      name: 'Dogecoin',
      patterns: ['Dogecoin', 'DOGE', 'dogecoin', 'doge'],
      category: 'crypto'
    }],
    ['ATOM', {
      name: 'Cosmos',
      patterns: ['Cosmos', 'ATOM', 'cosmos', 'atom'],
      category: 'crypto'
    }],
    ['LTC', {
      name: 'Litecoin',
      patterns: ['Litecoin', 'LTC', 'litecoin', 'ltc'],
      category: 'crypto'
    }],
    ['BCH', {
      name: 'Bitcoin Cash',
      patterns: ['Bitcoin Cash', 'BCH', 'bitcoin cash', 'bch'],
      category: 'crypto'
    }],

    // Traditional Markets (for context)
    ['SPX', {
      name: 'S&P 500',
      patterns: ['S&P 500', 'S&P', 'SP500', 'SPX', 'S&P500'],
      category: 'index'
    }],
    ['DJI', {
      name: 'Dow Jones',
      patterns: ['Dow Jones', 'DJI', 'DJIA', 'Dow'],
      category: 'index'
    }],
    ['IXIC', {
      name: 'NASDAQ',
      patterns: ['NASDAQ', 'Nasdaq', 'nasdaq'],
      category: 'index'
    }],
  ]);

  /**
   * Detect all asset mentions in the provided text
   * @param text - The text to analyze
   * @returns Array of detected assets with their positions
   */
  detect(text: string): DetectedAsset[] {
    const detectedAssets: DetectedAsset[] = [];
    const processedPositions = new Set<number>();

    for (const [symbol, { name, patterns }] of this.assetDictionary) {
      for (const pattern of patterns) {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'gi');
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
          const position = match.index;

          // Check if this position overlaps with an already detected asset
          const overlaps = Array.from(processedPositions).some(pos => {
            return Math.abs(pos - position) < match![0].length;
          });

          if (!overlaps) {
            detectedAssets.push({
              symbol,
              name,
              position,
              length: match[0].length
            });
            processedPositions.add(position);
          }
        }
      }
    }

    // Sort by position in text (left to right)
    return detectedAssets.sort((a, b) => a.position - b.position);
  }

  /**
   * Get asset information by symbol
   * @param symbol - The asset symbol (e.g., "BTC", "ETH")
   * @returns Asset information or undefined
   */
  getAssetInfo(symbol: string): AssetInfo | undefined {
    return this.assetDictionary.get(symbol.toUpperCase());
  }

  /**
   * Get all supported asset symbols
   * @returns Array of supported symbols
   */
  getSupportedSymbols(): string[] {
    return Array.from(this.assetDictionary.keys());
  }

  /**
   * Check if a symbol is supported
   * @param symbol - The symbol to check
   * @returns True if supported
   */
  isSupported(symbol: string): boolean {
    return this.assetDictionary.has(symbol.toUpperCase());
  }

  /**
   * Escape special regex characters in pattern
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&');
  }

  /**
   * Add a custom asset to the dictionary (for extensibility)
   * @param symbol - Asset symbol
   * @param info - Asset information
   */
  addAsset(symbol: string, info: AssetInfo): void {
    this.assetDictionary.set(symbol.toUpperCase(), info);
  }
}

// Export singleton instance
export const assetDetector = new AssetDetector();
