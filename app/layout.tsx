import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteHeader } from './components/site-header';
import { GAAnalytics } from './components/ga-analytics';
import { SITE_URL } from './lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'enbus.in',
  description: 'Search Tamil Nadu bus routes with intermediate stop support.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        <Suspense>
          <GAAnalytics />
        </Suspense>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
