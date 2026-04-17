import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { SiteHeader } from './components/site-header';
import { SiteFooter } from './components/site-footer';
import { WebSiteJsonLd, OrganizationJsonLd } from './components/json-ld';
import { SITE_URL } from './lib/site-url';

const GA_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-7Y3T74TKPG').trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tamil Nadu Bus Routes & Timings — enbus.in',
    template: '%s | enbus.in',
  },
  description:
    'Search Tamil Nadu bus routes with intermediate stop support. Find TNSTC, SETC, and MTC bus timings across 2,500+ stops and 100,000+ trips.',
  openGraph: {
    type: 'website',
    siteName: 'enbus.in',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer=window.dataLayer||[];
              function gtag(){dataLayer.push(arguments);}
              gtag('js',new Date());
              gtag('config','${GA_ID}');
            `}</Script>
          </>
        )}
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
