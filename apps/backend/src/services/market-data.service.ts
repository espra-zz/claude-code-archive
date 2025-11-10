/**
 * Market Data Service
 *
 * Handles real-time market data from Binance WebSocket API
 * Caches price data in Redis and broadcasts updates via event emitter
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { cache } from '../config/redis';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface BinanceTickerData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  c: string; // Close price (current price)
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Volume
  q: string; // Quote volume
  P: string; // Price change percent
}

export class MarketDataService extends EventEmitter {
  private binanceWs: WebSocket | null = null;
  private priceCache = new Map<string, PriceData>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private isConnecting = false;

  // Supported trading pairs on Binance
  private readonly tradingPairs = [
    'btcusdt',
    'ethusdt',
    'solusdt',
    'adausdt',
    'dotusdt',
    'maticusdt',
    'linkusdt',
    'avaxusdt',
    'uniusdt',
    'xrpusdt',
    'dogeusdt',
    'atomusdt',
    'ltcusdt',
    'bchusdt',
  ];

  constructor() {
    super();
  }

  /**
   * Initialize the market data service
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Market Data Service...');

    // Load cached prices from Redis
    await this.loadCachedPrices();

    // Connect to Binance WebSocket
    await this.connectToBinance();

    console.log('✅ Market Data Service initialized');
  }

  /**
   * Connect to Binance WebSocket stream
   */
  private async connectToBinance(): Promise<void> {
    if (this.isConnecting || this.binanceWs?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      // Create combined stream URL
      const streams = this.tradingPairs.map(pair => `${pair}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

      console.log('🔌 Connecting to Binance WebSocket...');
      this.binanceWs = new WebSocket(wsUrl);

      this.binanceWs.on('open', () => {
        console.log('✅ Connected to Binance WebSocket');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.binanceWs.on('message', (data: WebSocket.Data) => {
        this.handleBinanceMessage(data.toString());
      });

      this.binanceWs.on('error', (error) => {
        console.error('❌ Binance WebSocket error:', error.message);
      });

      this.binanceWs.on('close', () => {
        console.log('🔌 Binance WebSocket closed');
        this.isConnecting = false;
        this.handleReconnect();
      });

      this.binanceWs.on('ping', () => {
        this.binanceWs?.pong();
      });
    } catch (error) {
      console.error('❌ Failed to connect to Binance:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Reconnecting to Binance in ${delay / 1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connectToBinance();
    }, delay);
  }

  /**
   * Handle incoming Binance WebSocket messages
   */
  private handleBinanceMessage(message: string): void {
    try {
      const data = JSON.parse(message);

      // Binance sends data wrapped in a stream object
      if (data.stream && data.data) {
        const ticker: BinanceTickerData = data.data;
        const symbol = ticker.s.replace('USDT', ''); // Convert BTCUSDT -> BTC

        const priceData: PriceData = {
          symbol,
          price: parseFloat(ticker.c),
          change24h: parseFloat(ticker.P),
          volume: parseFloat(ticker.v),
          high24h: parseFloat(ticker.h),
          low24h: parseFloat(ticker.l),
          timestamp: ticker.E,
        };

        // Update cache
        this.priceCache.set(symbol, priceData);

        // Cache in Redis (60 second TTL)
        cache.set(`price:${symbol}`, priceData, 60).catch(console.error);

        // Emit price update event
        this.emit('price-update', { symbol, data: priceData });
      }
    } catch (error) {
      console.error('❌ Failed to parse Binance message:', error);
    }
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<PriceData | null> {
    // Check memory cache first
    const normalizedSymbol = symbol.toUpperCase();
    if (this.priceCache.has(normalizedSymbol)) {
      return this.priceCache.get(normalizedSymbol)!;
    }

    // Check Redis cache
    const cached = await cache.get<PriceData>(`price:${normalizedSymbol}`);
    if (cached) {
      this.priceCache.set(normalizedSymbol, cached);
      return cached;
    }

    return null;
  }

  /**
   * Get prices for multiple symbols
   */
  async getPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>();

    for (const symbol of symbols) {
      const price = await this.getPrice(symbol);
      if (price) {
        prices.set(symbol, price);
      }
    }

    return prices;
  }

  /**
   * Get top movers (by absolute percentage change)
   */
  async getTopMovers(limit: number = 10): Promise<PriceData[]> {
    const prices = Array.from(this.priceCache.values());

    return prices
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, limit);
  }

  /**
   * Get top gainers (positive change only)
   */
  async getTopGainers(limit: number = 10): Promise<PriceData[]> {
    const prices = Array.from(this.priceCache.values());

    return prices
      .filter(p => p.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, limit);
  }

  /**
   * Get top losers (negative change only)
   */
  async getTopLosers(limit: number = 10): Promise<PriceData[]> {
    const prices = Array.from(this.priceCache.values());

    return prices
      .filter(p => p.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, limit);
  }

  /**
   * Get all cached prices
   */
  getAllPrices(): PriceData[] {
    return Array.from(this.priceCache.values());
  }

  /**
   * Load cached prices from Redis on startup
   */
  private async loadCachedPrices(): Promise<void> {
    try {
      for (const symbol of this.tradingPairs) {
        const normalizedSymbol = symbol.replace('usdt', '').toUpperCase();
        const cached = await cache.get<PriceData>(`price:${normalizedSymbol}`);

        if (cached) {
          this.priceCache.set(normalizedSymbol, cached);
        }
      }

      console.log(`✅ Loaded ${this.priceCache.size} cached prices from Redis`);
    } catch (error) {
      console.error('❌ Failed to load cached prices:', error);
    }
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }
    this.priceCache.clear();
    console.log('✅ Market Data Service disconnected');
  }
}
