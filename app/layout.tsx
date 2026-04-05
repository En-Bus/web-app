import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';
import { GAAnalytics } from './components/ga-analytics';
import { WebSiteJsonLd, OrganizationJsonLd } from './components/json-ld';
import { SITE_URL } from './lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tamil Nadu Bus Routes & Timings — enbus.in',
    template: '%s | enbus.in',
  },
  description:
    'Search Tamil Nadu bus routes with intermediate stop support. Find TNSTC, SETC, and MTC bus timings across 612 places and 37,770 trips.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        <Suspense>
          <GAAnalytics />
        </Suspense>
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
