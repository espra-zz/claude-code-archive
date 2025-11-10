/**
 * API Client
 *
 * Axios-based API client for backend communication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Create axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for logging
 */
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      switch (status) {
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        case 429:
          console.error('Too many requests');
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server');
    }

    return Promise.reject(error);
  }
);

/**
 * API endpoints
 */
export const apiEndpoints = {
  // Insights
  insights: {
    getAll: (limit?: number) =>
      api.get('/api/insights', { params: { limit } }),
    getById: (id: string) =>
      api.get(`/api/insights/${id}`),
    getByCategory: (category: string, limit?: number) =>
      api.get(`/api/insights/category/${category}`, { params: { limit } }),
    getStats: () =>
      api.get('/api/insights/stats'),
    generate: () =>
      api.post('/api/insights/generate'),
  },

  // Market Data
  market: {
    getPrice: (symbol: string) =>
      api.get(`/api/market/price/${symbol}`),
    getPrices: (symbols: string[]) =>
      api.post('/api/market/prices', { symbols }),
    getTopMovers: (limit?: number) =>
      api.get('/api/market/top-movers', { params: { limit } }),
    getTopGainers: (limit?: number) =>
      api.get('/api/market/top-gainers', { params: { limit } }),
    getTopLosers: (limit?: number) =>
      api.get('/api/market/top-losers', { params: { limit } }),
    getOverview: () =>
      api.get('/api/market/overview'),
  },

  // Health
  health: () =>
    api.get('/health'),
};

export default api;
