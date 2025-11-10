/**
 * CryptoPulse Backend Server
 *
 * Main entry point for the CryptoPulse API server
 * Handles REST API, WebSocket connections, and real-time data streaming
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServer } from 'http';

// Config
import { prisma, connectDatabase } from './config/database';
import { connectRedis } from './config/redis';

// Services
import { MarketDataService } from './services/market-data.service';
import { AIInsightsService } from './services/ai-insights.service';
import { WebSocketService } from './services/websocket.service';

// Routes
import insightsRoute from './routes/insights.route';
import marketRoute from './routes/market.route';

// Environment variables
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: NODE_ENV === 'development' ? 'info' : 'warn',
    transport:
      NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Create HTTP server for Socket.io
const httpServer = createServer(fastify.server);

// Initialize services (will be set in start function)
let marketDataService: MarketDataService;
let aiInsightsService: AIInsightsService;
let webSocketService: WebSocketService;

/**
 * Register plugins and middleware
 */
async function registerPlugins(): Promise<void> {
  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
}

/**
 * Register API routes
 */
async function registerRoutes(): Promise<void> {
  // Health check
  fastify.get('/health', async (request, reply) => {
    const wsStats = webSocketService.getStats();

    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      services: {
        database: 'connected',
        redis: 'connected',
        websocket: 'connected',
        marketData: 'connected',
      },
      websocket: wsStats,
    });
  });

  // API routes
  await fastify.register(insightsRoute, {
    prefix: '/api/insights',
    aiService: aiInsightsService,
  });

  await fastify.register(marketRoute, {
    prefix: '/api/market',
    marketService: marketDataService,
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    });
  });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    reply.status(error.statusCode || 500).send({
      success: false,
      error: error.name || 'Internal Server Error',
      message: error.message,
      ...(NODE_ENV === 'development' && { stack: error.stack }),
    });
  });
}

/**
 * Initialize all services
 */
async function initializeServices(): Promise<void> {
  console.log('🚀 Initializing services...\n');

  // Connect to database
  await connectDatabase();

  // Connect to Redis
  await connectRedis();

  // Initialize Market Data Service
  marketDataService = new MarketDataService();
  await marketDataService.initialize();

  // Initialize AI Insights Service
  aiInsightsService = new AIInsightsService(prisma, marketDataService);

  // Initialize WebSocket Service
  webSocketService = new WebSocketService(
    httpServer,
    marketDataService,
    aiInsightsService
  );
  await webSocketService.initialize();

  console.log('\n✅ All services initialized successfully\n');
}

/**
 * Start scheduled tasks
 */
function startScheduledTasks(): void {
  console.log('⏰ Starting scheduled tasks...\n');

  // Generate new AI insight every 5 minutes
  const INSIGHT_INTERVAL = 5 * 60 * 1000; // 5 minutes
  setInterval(async () => {
    try {
      console.log('🤖 Generating scheduled insight...');
      await aiInsightsService.generateNewInsight();
    } catch (error) {
      console.error('❌ Failed to generate scheduled insight:', error);
    }
  }, INSIGHT_INTERVAL);

  // Broadcast market overview every 30 seconds
  const MARKET_OVERVIEW_INTERVAL = 30 * 1000; // 30 seconds
  setInterval(async () => {
    try {
      await webSocketService.broadcastMarketOverview();
    } catch (error) {
      console.error('❌ Failed to broadcast market overview:', error);
    }
  }, MARKET_OVERVIEW_INTERVAL);

  // Generate first insight after 10 seconds
  setTimeout(async () => {
    try {
      console.log('🤖 Generating initial insight...');
      await aiInsightsService.generateNewInsight();
    } catch (error) {
      console.error('❌ Failed to generate initial insight:', error);
    }
  }, 10000);

  console.log('✅ Scheduled tasks started\n');
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  Received ${signal}, starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    await fastify.close();

    // Shutdown WebSocket service
    await webSocketService.shutdown();

    // Disconnect market data service
    await marketDataService.disconnect();

    // Disconnect from database
    await prisma.$disconnect();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function start(): Promise<void> {
  try {
    console.log('\n🚀 Starting CryptoPulse Backend Server...\n');
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Host: ${HOST}\n`);

    // Initialize services
    await initializeServices();

    // Register plugins
    await registerPlugins();

    // Register routes
    await registerRoutes();

    // Start Fastify server
    await fastify.listen({ port: PORT, host: HOST });

    // Start scheduled tasks
    startScheduledTasks();

    console.log('═══════════════════════════════════════════');
    console.log('🎉 CryptoPulse Backend Server is running!');
    console.log('═══════════════════════════════════════════');
    console.log(`📊 API: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log('═══════════════════════════════════════════\n');

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
start();
