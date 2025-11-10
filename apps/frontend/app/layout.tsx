/**
 * Root Layout
 *
 * Main layout component for the Next.js app
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoPulse - AI Market Intelligence',
  description: 'Real-time cryptocurrency market insights powered by AI. Track prices, analyze trends, and stay ahead of the market.',
  keywords: 'crypto, cryptocurrency, bitcoin, ethereum, market analysis, AI, insights',
  authors: [{ name: 'CryptoPulse' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#000000',
  openGraph: {
    title: 'CryptoPulse - AI Market Intelligence',
    description: 'Real-time cryptocurrency market insights powered by AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
