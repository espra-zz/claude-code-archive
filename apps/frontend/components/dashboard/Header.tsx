/**
 * Header Component
 *
 * Application header with branding and connection status
 */

'use client';

import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

export function Header() {
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">CryptoPulse</h1>
              <p className="text-xs text-gray-500">AI Market Intelligence</p>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                'border transition-colors',
                isConnected
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              )}
            >
              <span className={cn(
                'h-2 w-2 rounded-full',
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              )}></span>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
