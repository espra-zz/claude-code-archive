/**
 * WebSocket Service
 *
 * Handles real-time communication with frontend clients using Socket.io
 * Broadcasts price updates and new insights to connected clients
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { MarketDataService } from './market-data.service';
import { AIInsightsService } from './ai-insights.service';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients = new Map<string, Socket>();

  constructor(
    httpServer: HTTPServer,
    private marketService: MarketDataService,
    private aiService: AIInsightsService
  ) {
    // Initialize Socket.io with CORS configuration
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });
  }

  /**
   * Initialize WebSocket service and set up event handlers
   */
  async initialize(): Promise<void> {
    console.log('🔌 Initializing WebSocket Service...');

    // Set up connection handler
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    // Listen for market data updates
    this.marketService.on('price-update', (data) => {
      this.broadcastPriceUpdate(data);
    });

    // Listen for new AI insights
    this.aiService.on('new-insight', (insight) => {
      this.broadcastNewInsight(insight);
    });

    console.log('✅ WebSocket Service initialized');
  }

  /**
   * Handle new client connection
   */
  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    console.log(`🔗 Client connected: ${clientId}`);

    // Store connected client
    this.connectedClients.set(clientId, socket);

    // Send welcome message with connection stats
    socket.emit('connected', {
      clientId,
      timestamp: Date.now(),
      connectedClients: this.connectedClients.size,
    });

    // Handle price subscription
    socket.on('subscribe-price', async (symbol: string) => {
      await this.handlePriceSubscription(socket, symbol);
    });

    // Handle price unsubscription
    socket.on('unsubscribe-price', (symbol: string) => {
      this.handlePriceUnsubscription(socket, symbol);
    });

    // Handle insights subscription
    socket.on('subscribe-insights', async () => {
      await this.handleInsightsSubscription(socket);
    });

    // Handle insights unsubscription
    socket.on('unsubscribe-insights', () => {
      this.handleInsightsUnsubscription(socket);
    });

    // Handle market overview subscription
    socket.on('subscribe-market-overview', async () => {
      await this.handleMarketOverviewSubscription(socket);
    });

    // Handle ping-pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for client ${clientId}:`, error);
    });
  }

  /**
   * Handle price subscription for a specific asset
   */
  private async handlePriceSubscription(socket: Socket, symbol: string): Promise<void> {
    const normalizedSymbol = symbol.toUpperCase();
    const room = `price:${normalizedSymbol}`;

    // Join room for this asset
    socket.join(room);

    console.log(`📊 Client ${socket.id} subscribed to ${normalizedSymbol} prices`);

    // Send current price immediately
    try {
      const currentPrice = await this.marketService.getPrice(normalizedSymbol);

      if (currentPrice) {
        socket.emit('price-update', {
          symbol: normalizedSymbol,
          data: currentPrice,
        });
      }
    } catch (error) {
      console.error(`Failed to send initial price for ${normalizedSymbol}:`, error);
      socket.emit('error', {
        message: `Failed to fetch price for ${normalizedSymbol}`,
      });
    }
  }

  /**
   * Handle price unsubscription
   */
  private handlePriceUnsubscription(socket: Socket, symbol: string): void {
    const normalizedSymbol = symbol.toUpperCase();
    const room = `price:${normalizedSymbol}`;

    socket.leave(room);
    console.log(`📊 Client ${socket.id} unsubscribed from ${normalizedSymbol} prices`);
  }

  /**
   * Handle insights subscription
   */
  private async handleInsightsSubscription(socket: Socket): Promise<void> {
    // Join insights room
    socket.join('insights');

    console.log(`🤖 Client ${socket.id} subscribed to insights`);

    // Send recent insights immediately
    try {
      const recentInsights = await this.aiService.getRecentInsights(10);

      socket.emit('recent-insights', recentInsights);
    } catch (error) {
      console.error('Failed to send recent insights:', error);
      socket.emit('error', {
        message: 'Failed to fetch recent insights',
      });
    }
  }

  /**
   * Handle insights unsubscription
   */
  private handleInsightsUnsubscription(socket: Socket): void {
    socket.leave('insights');
    console.log(`🤖 Client ${socket.id} unsubscribed from insights`);
  }

  /**
   * Handle market overview subscription (top movers, etc.)
   */
  private async handleMarketOverviewSubscription(socket: Socket): Promise<void> {
    // Join market overview room
    socket.join('market-overview');

    console.log(`📈 Client ${socket.id} subscribed to market overview`);

    // Send current market overview
    try {
      const [topMovers, topGainers, topLosers] = await Promise.all([
        this.marketService.getTopMovers(10),
        this.marketService.getTopGainers(5),
        this.marketService.getTopLosers(5),
      ]);

      socket.emit('market-overview', {
        topMovers,
        topGainers,
        topLosers,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to send market overview:', error);
      socket.emit('error', {
        message: 'Failed to fetch market overview',
      });
    }
  }

  /**
   * Broadcast price update to subscribed clients
   */
  private broadcastPriceUpdate(data: { symbol: string; data: any }): void {
    const room = `price:${data.symbol}`;

    this.io.to(room).emit('price-update', data);
  }

  /**
   * Broadcast new insight to subscribed clients
   */
  private broadcastNewInsight(insight: any): void {
    this.io.to('insights').emit('new-insight', insight);

    // Also send notification to all connected clients
    this.io.emit('insight-notification', {
      id: insight.id,
      category: insight.category,
      timestamp: insight.createdAt,
    });
  }

  /**
   * Broadcast market overview updates periodically
   */
  async broadcastMarketOverview(): Promise<void> {
    try {
      const [topMovers, topGainers, topLosers] = await Promise.all([
        this.marketService.getTopMovers(10),
        this.marketService.getTopGainers(5),
        this.marketService.getTopLosers(5),
      ]);

      this.io.to('market-overview').emit('market-overview', {
        topMovers,
        topGainers,
        topLosers,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to broadcast market overview:', error);
    }
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(socket: Socket, reason: string): void {
    const clientId = socket.id;

    // Remove from connected clients
    this.connectedClients.delete(clientId);

    console.log(`🔌 Client disconnected: ${clientId} (Reason: ${reason})`);
    console.log(`👥 Connected clients: ${this.connectedClients.size}`);
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
    };
  }

  /**
   * Broadcast system message to all clients
   */
  broadcastSystemMessage(message: string): void {
    this.io.emit('system-message', {
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Gracefully shutdown WebSocket service
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down WebSocket Service...');

    // Notify all clients
    this.broadcastSystemMessage('Server is shutting down for maintenance');

    // Close all connections
    this.io.close();

    console.log('✅ WebSocket Service shut down');
  }
}
