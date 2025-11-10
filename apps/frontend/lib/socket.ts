/**
 * Socket.io Client Configuration
 *
 * WebSocket client for real-time updates
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

let socket: Socket | null = null;

/**
 * Get or create socket instance
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to WebSocket server (attempt ${attemptNumber})`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Attempting to reconnect... (${attemptNumber})`);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to WebSocket server');
    });
  }

  return socket;
}

/**
 * Connect to socket if not already connected
 */
export function connectSocket(): void {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect from socket
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/**
 * Subscribe to price updates for a symbol
 */
export function subscribeToPriceUpdates(symbol: string): void {
  const socket = getSocket();
  socket.emit('subscribe-price', symbol);
}

/**
 * Unsubscribe from price updates for a symbol
 */
export function unsubscribeFromPriceUpdates(symbol: string): void {
  const socket = getSocket();
  socket.emit('unsubscribe-price', symbol);
}

/**
 * Subscribe to insights updates
 */
export function subscribeToInsights(): void {
  const socket = getSocket();
  socket.emit('subscribe-insights');
}

/**
 * Unsubscribe from insights updates
 */
export function unsubscribeFromInsights(): void {
  const socket = getSocket();
  socket.emit('unsubscribe-insights');
}

/**
 * Subscribe to market overview updates
 */
export function subscribeToMarketOverview(): void {
  const socket = getSocket();
  socket.emit('subscribe-market-overview');
}

export default getSocket;
