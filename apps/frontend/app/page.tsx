/**
 * Dashboard Page
 *
 * Main page displaying AI insights and market data
 */

'use client';

import { SocketProvider } from '@/components/providers/SocketProvider';
import { Header } from '@/components/dashboard/Header';
import { InsightsFeed } from '@/components/dashboard/InsightsFeed';
import { TopMovers } from '@/components/dashboard/TopMovers';

export default function DashboardPage() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Insights Feed */}
            <div className="lg:col-span-2 space-y-4">
              <InsightsFeed />
            </div>

            {/* Sidebar - Top Movers */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <TopMovers />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-white/10">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>
              CryptoPulse © 2024 - AI-Powered Market Intelligence
            </p>
            <p className="mt-1 text-xs">
              Real-time data powered by Binance • AI insights by OpenAI GPT-4
            </p>
          </div>
        </footer>
      </div>
    </SocketProvider>
  );
}
