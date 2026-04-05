import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteHeader } from './components/site-header';
import { GAAnalytics } from './components/ga-analytics';
import { SITE_URL } from './lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tamil Nadu Bus Routes & Timings | TNSTC, SETC, MTC — enbus.in',
    template: '%s — enbus.in',
  },
  description:
    'Find government bus routes, timings & stops across Tamil Nadu. Search TNSTC, SETC & MTC buses with intermediate stop support.',
  openGraph: {
    title: 'Tamil Nadu Bus Routes & Timings — enbus.in',
    description:
      'Search 1,100+ TNSTC, SETC & MTC bus routes across Tamil Nadu with departure times and intermediate stops.',
    siteName: 'enbus.in',
    type: 'website',
  },
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
