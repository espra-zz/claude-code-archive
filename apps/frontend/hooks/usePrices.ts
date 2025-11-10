/**
 * usePrices Hook
 *
 * Hook for managing price subscriptions and updates
 */

'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export function usePrices(symbols: string[]) {
  const { socket, isConnected } = useSocket();
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to all symbols
    symbols.forEach((symbol) => {
      socket.emit('subscribe-price', symbol);
    });

    // Listen for price updates
    const handlePriceUpdate = (data: { symbol: string; data: PriceData }) => {
      setPrices((prev) => {
        const newPrices = new Map(prev);
        newPrices.set(data.symbol, data.data);
        return newPrices;
      });
      setLoading(false);
    };

    socket.on('price-update', handlePriceUpdate);

    // Cleanup
    return () => {
      symbols.forEach((symbol) => {
        socket.emit('unsubscribe-price', symbol);
      });
      socket.off('price-update', handlePriceUpdate);
    };
  }, [socket, isConnected, symbols]);

  return { prices, loading };
}

export function usePrice(symbol: string) {
  const { socket, isConnected } = useSocket();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Subscribe to symbol
    socket.emit('subscribe-price', symbol);

    // Listen for updates
    const handlePriceUpdate = (data: { symbol: string; data: PriceData }) => {
      if (data.symbol === symbol) {
        setPriceData(data.data);
        setLoading(false);
      }
    };

    socket.on('price-update', handlePriceUpdate);

    // Cleanup
    return () => {
      socket.emit('unsubscribe-price', symbol);
      socket.off('price-update', handlePriceUpdate);
    };
  }, [socket, isConnected, symbol]);

  return { priceData, loading };
}
