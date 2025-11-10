/**
 * useSocket Hook
 *
 * Hook to access Socket.io connection
 */

'use client';

import { useContext } from 'react';
import { useSocket as useSocketContext } from '@/components/providers/SocketProvider';

export function useSocket() {
  const { socket, isConnected } = useSocketContext();
  return { socket, isConnected };
}
