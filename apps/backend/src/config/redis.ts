/**
 * Redis Configuration
 *
 * Redis client initialization for caching and pub/sub
 */

import Redis from 'ioredis';

// Parse Redis URL
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize Redis client
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<void> {
  return new Promise((resolve, reject) => {
    redis.on('ready', () => {
      console.log('✅ Redis connected successfully');
      resolve();
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      reject(error);
    });
  });
}

/**
 * Disconnect from Redis gracefully
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log('✅ Redis disconnected successfully');
  } catch (error) {
    console.error('❌ Failed to disconnect from Redis:', error);
  }
}

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  },

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

/**
 * Handle process shutdown
 */
process.on('SIGINT', async () => {
  await disconnectRedis();
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
});
