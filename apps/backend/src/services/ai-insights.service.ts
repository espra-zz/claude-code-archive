/**
 * AI Insights Service
 *
 * Generates crypto market insights using OpenAI GPT-4
 * Detects asset mentions and analyzes sentiment
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { AssetDetector } from '../utils/asset-detector';
import { MarketDataService, PriceData } from './market-data.service';
import { EventEmitter } from 'events';

export interface GeneratedInsight {
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
  createdAt: Date;
}

export class AIInsightsService extends EventEmitter {
  private openai: OpenAI;
  private assetDetector: AssetDetector;
  private isGenerating = false;

  constructor(
    private prisma: PrismaClient,
    private marketService: MarketDataService
  ) {
    super();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({ apiKey });
    this.assetDetector = new AssetDetector();
  }

  /**
   * Generate a new market insight
   */
  async generateNewInsight(): Promise<GeneratedInsight> {
    if (this.isGenerating) {
      throw new Error('Already generating an insight');
    }

    this.isGenerating = true;

    try {
      console.log('🤖 Generating new AI insight...');

      // Get current market snapshot
      const topMovers = await this.marketService.getTopMovers(5);
      const topGainers = await this.marketService.getTopGainers(3);
      const topLosers = await this.marketService.getTopLosers(3);

      // Prepare market context for AI
      const marketContext = this.prepareMarketContext(topMovers, topGainers, topLosers);

      // Generate insight using OpenAI
      const content = await this.generateInsightContent(marketContext);

      // Detect assets mentioned in the insight
      const detectedAssets = this.assetDetector.detect(content);

      // Analyze sentiment
      const sentiment = this.analyzeSentiment(content);

      // Categorize the insight
      const category = this.categorizeInsight(content, detectedAssets);

      // Save to database
      const insight = await this.prisma.insight.create({
        data: {
          content,
          sentiment,
          category,
          assets: detectedAssets,
        },
      });

      console.log(`✅ Generated insight: ${insight.id} (Category: ${category}, Sentiment: ${sentiment.toFixed(2)})`);

      // Emit event for WebSocket broadcasting
      this.emit('new-insight', insight);

      return insight as GeneratedInsight;
    } catch (error) {
      console.error('❌ Failed to generate insight:', error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Prepare market context for AI prompt
   */
  private prepareMarketContext(
    topMovers: PriceData[],
    topGainers: PriceData[],
    topLosers: PriceData[]
  ): string {
    const formatAsset = (asset: PriceData) =>
      `${asset.symbol}: $${asset.price.toLocaleString()} (${asset.change24h > 0 ? '+' : ''}${asset.change24h.toFixed(2)}%)`;

    let context = 'Current Market Snapshot:\n\n';

    if (topMovers.length > 0) {
      context += 'Top Movers:\n';
      topMovers.forEach((asset, i) => {
        context += `${i + 1}. ${formatAsset(asset)}\n`;
      });
      context += '\n';
    }

    if (topGainers.length > 0) {
      context += 'Top Gainers:\n';
      topGainers.forEach((asset, i) => {
        context += `${i + 1}. ${formatAsset(asset)}\n`;
      });
      context += '\n';
    }

    if (topLosers.length > 0) {
      context += 'Top Losers:\n';
      topLosers.forEach((asset, i) => {
        context += `${i + 1}. ${formatAsset(asset)}\n`;
      });
    }

    return context;
  }

  /**
   * Generate insight content using OpenAI
   */
  private async generateInsightContent(marketContext: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert cryptocurrency market analyst providing concise, actionable insights.

IMPORTANT GUIDELINES:
1. Write 2-3 sentences (100-150 words maximum)
2. MUST mention specific cryptocurrencies by name (e.g., Bitcoin, Ethereum, Solana)
3. Focus on current market movements and trends
4. Use professional but accessible language
5. Provide context and potential implications
6. Be objective and data-driven
7. Avoid hype and speculation

Style: Professional financial analysis, easy to understand for all levels.`,
          },
          {
            role: 'user',
            content: `Based on this market data, write a brief market insight:\n\n${marketContext}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 250,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        throw new Error('OpenAI returned empty content');
      }

      return content.trim();
    } catch (error: any) {
      // Handle OpenAI API errors gracefully
      if (error?.status === 429) {
        console.warn('⚠️ OpenAI rate limit reached, using fallback insight');
        return this.generateFallbackInsight(marketContext);
      }

      throw error;
    }
  }

  /**
   * Generate fallback insight when OpenAI is unavailable
   */
  private generateFallbackInsight(marketContext: string): string {
    const insights = [
      'Bitcoin continues to show strong market momentum as institutional interest grows. Ethereum maintains solid support levels while several altcoins experience heightened volatility. Market participants should monitor key resistance levels closely.',
      'The cryptocurrency market is experiencing mixed sentiment today. Bitcoin holds above key support while Ethereum shows resilience. Traders are closely watching for potential breakout patterns across major assets.',
      'Market volatility remains elevated as Bitcoin tests critical price levels. Solana and other Layer-1 protocols show interesting price action. Investors are balancing risk appetite with cautious optimism.',
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  /**
   * Analyze sentiment of the insight text
   * Returns a value between -1 (very bearish) and 1 (very bullish)
   */
  private analyzeSentiment(text: string): number {
    const lowerText = text.toLowerCase();

    // Bullish indicators
    const bullishWords = [
      'bullish', 'surge', 'gain', 'rally', 'rise', 'growth', 'breakthrough',
      'momentum', 'strong', 'positive', 'upward', 'break out', 'soar',
      'climbing', 'advance', 'recovery', 'optimistic', 'uptrend'
    ];

    // Bearish indicators
    const bearishWords = [
      'bearish', 'crash', 'dump', 'decline', 'drop', 'fall', 'plunge',
      'weak', 'negative', 'downward', 'break down', 'tumble', 'losing',
      'retreat', 'correction', 'pessimistic', 'downtrend', 'volatile'
    ];

    // Neutral indicators
    const neutralWords = [
      'stable', 'steady', 'consolidat', 'sideways', 'range', 'mixed',
      'uncertain', 'cautious', 'wait', 'watch'
    ];

    let score = 0;

    // Count occurrences
    bullishWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length * 0.15;
    });

    bearishWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score -= matches.length * 0.15;
    });

    neutralWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length * 0.05; // Slight positive for stability
    });

    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Categorize the insight based on content and detected assets
   */
  private categorizeInsight(
    content: string,
    assets: Array<{ symbol: string; name: string }>
  ): string {
    const lowerContent = content.toLowerCase();

    // Check for specific topics
    if (lowerContent.includes('defi') || lowerContent.includes('decentralized finance')) {
      return 'DeFi';
    }

    if (lowerContent.includes('nft') || lowerContent.includes('non-fungible')) {
      return 'NFT';
    }

    if (lowerContent.includes('regulation') || lowerContent.includes('sec') || lowerContent.includes('legal')) {
      return 'Regulation';
    }

    if (lowerContent.includes('institution') || lowerContent.includes('etf') || lowerContent.includes('adoption')) {
      return 'Institutional';
    }

    // Check for specific assets mentioned
    if (assets.some(a => a.symbol === 'BTC')) {
      return 'Bitcoin';
    }

    if (assets.some(a => a.symbol === 'ETH')) {
      return 'Ethereum';
    }

    if (assets.some(a => ['SOL', 'ADA', 'DOT', 'AVAX'].includes(a.symbol))) {
      return 'Layer-1';
    }

    // Default category
    return 'Market Analysis';
  }

  /**
   * Get recent insights from database
   */
  async getRecentInsights(limit: number = 20): Promise<GeneratedInsight[]> {
    const insights = await this.prisma.insight.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return insights as GeneratedInsight[];
  }

  /**
   * Get insights by category
   */
  async getInsightsByCategory(category: string, limit: number = 10): Promise<GeneratedInsight[]> {
    const insights = await this.prisma.insight.findMany({
      where: { category },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return insights as GeneratedInsight[];
  }

  /**
   * Get insight statistics
   */
  async getInsightStats() {
    const total = await this.prisma.insight.count();

    const avgSentiment = await this.prisma.insight.aggregate({
      _avg: { sentiment: true },
    });

    const categoryCounts = await this.prisma.insight.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 5,
    });

    return {
      total,
      averageSentiment: avgSentiment._avg.sentiment || 0,
      topCategories: categoryCounts.map(c => ({
        category: c.category,
        count: c._count,
      })),
    };
  }
}
