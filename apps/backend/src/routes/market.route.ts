/**
 * Market API Routes
 *
 * REST API endpoints for market data and prices
 */

import { FastifyPluginAsync } from 'fastify';
import { MarketDataService } from '../services/market-data.service';

interface MarketRouteOptions {
  marketService: MarketDataService;
}

const marketRoute: FastifyPluginAsync<MarketRouteOptions> = async (
  fastify,
  opts
) => {
  const { marketService } = opts;

  /**
   * GET /api/market/price/:symbol
   * Get current price for a specific asset
   */
  fastify.get<{
    Params: {
      symbol: string;
    };
  }>('/price/:symbol', async (request, reply) => {
    try {
      const { symbol } = request.params;
      const normalizedSymbol = symbol.toUpperCase();

      const price = await marketService.getPrice(normalizedSymbol);

      if (!price) {
        return reply.status(404).send({
          success: false,
          error: 'Asset not found',
          message: `No price data available for ${normalizedSymbol}`,
        });
      }

      return reply.send({
        success: true,
        data: price,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch price',
        message: error.message,
      });
    }
  });

  /**
   * POST /api/market/prices
   * Get prices for multiple assets
   */
  fastify.post<{
    Body: {
      symbols: string[];
    };
  }>('/prices', async (request, reply) => {
    try {
      const { symbols } = request.body;

      if (!Array.isArray(symbols) || symbols.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'Invalid request',
          message: 'symbols must be a non-empty array',
        });
      }

      const prices = await marketService.getPrices(symbols);

      // Convert Map to object for JSON response
      const pricesObject = Object.fromEntries(prices);

      return reply.send({
        success: true,
        data: pricesObject,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch prices',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/market/top-movers
   * Get top moving assets (by percentage change)
   */
  fastify.get<{
    Querystring: {
      limit?: number;
    };
  }>('/top-movers', async (request, reply) => {
    try {
      const { limit = 10 } = request.query;

      const topMovers = await marketService.getTopMovers(limit);

      return reply.send({
        success: true,
        data: topMovers,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch top movers',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/market/top-gainers
   * Get top gaining assets
   */
  fastify.get<{
    Querystring: {
      limit?: number;
    };
  }>('/top-gainers', async (request, reply) => {
    try {
      const { limit = 10 } = request.query;

      const topGainers = await marketService.getTopGainers(limit);

      return reply.send({
        success: true,
        data: topGainers,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch top gainers',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/market/top-losers
   * Get top losing assets
   */
  fastify.get<{
    Querystring: {
      limit?: number;
    };
  }>('/top-losers', async (request, reply) => {
    try {
      const { limit = 10 } = request.query;

      const topLosers = await marketService.getTopLosers(limit);

      return reply.send({
        success: true,
        data: topLosers,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch top losers',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/market/overview
   * Get complete market overview
   */
  fastify.get('/overview', async (request, reply) => {
    try {
      const [allPrices, topMovers, topGainers, topLosers] = await Promise.all([
        marketService.getAllPrices(),
        marketService.getTopMovers(10),
        marketService.getTopGainers(5),
        marketService.getTopLosers(5),
      ]);

      return reply.send({
        success: true,
        data: {
          allPrices,
          topMovers,
          topGainers,
          topLosers,
          timestamp: Date.now(),
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch market overview',
        message: error.message,
      });
    }
  });
};

export default marketRoute;
