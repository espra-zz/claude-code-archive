/**
 * Insights API Routes
 *
 * REST API endpoints for AI-generated market insights
 */

import { FastifyPluginAsync } from 'fastify';
import { AIInsightsService } from '../services/ai-insights.service';

interface InsightsRouteOptions {
  aiService: AIInsightsService;
}

const insightsRoute: FastifyPluginAsync<InsightsRouteOptions> = async (
  fastify,
  opts
) => {
  const { aiService } = opts;

  /**
   * GET /api/insights
   * Get recent insights with pagination
   */
  fastify.get<{
    Querystring: {
      limit?: number;
      offset?: number;
    };
  }>('/', async (request, reply) => {
    try {
      const { limit = 20, offset = 0 } = request.query;

      const insights = await aiService.getRecentInsights(limit);

      return reply.send({
        success: true,
        data: insights,
        pagination: {
          limit,
          offset,
          total: insights.length,
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch insights',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/insights/:id
   * Get a specific insight by ID
   */
  fastify.get<{
    Params: {
      id: string;
    };
  }>('/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      // This would need to be implemented in the AIInsightsService
      // For now, return not implemented
      return reply.status(501).send({
        success: false,
        error: 'Not implemented',
        message: 'Get insight by ID is not yet implemented',
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch insight',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/insights/category/:category
   * Get insights by category
   */
  fastify.get<{
    Params: {
      category: string;
    };
    Querystring: {
      limit?: number;
    };
  }>('/category/:category', async (request, reply) => {
    try {
      const { category } = request.params;
      const { limit = 10 } = request.query;

      const insights = await aiService.getInsightsByCategory(category, limit);

      return reply.send({
        success: true,
        data: insights,
        category,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch insights by category',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/insights/stats
   * Get insights statistics
   */
  fastify.get('/stats', async (request, reply) => {
    try {
      const stats = await aiService.getInsightStats();

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch insights stats',
        message: error.message,
      });
    }
  });

  /**
   * POST /api/insights/generate
   * Manually trigger insight generation (for testing)
   */
  fastify.post('/generate', async (request, reply) => {
    try {
      // In production, you might want to add authentication here
      const insight = await aiService.generateNewInsight();

      return reply.send({
        success: true,
        data: insight,
        message: 'Insight generated successfully',
      });
    } catch (error: any) {
      fastify.log.error(error);

      // Check if already generating
      if (error.message === 'Already generating an insight') {
        return reply.status(429).send({
          success: false,
          error: 'Too many requests',
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: 'Failed to generate insight',
        message: error.message,
      });
    }
  });
};

export default insightsRoute;
