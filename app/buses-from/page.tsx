import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb } from '../components/breadcrumb';
import { BreadcrumbJsonLd } from '../components/json-ld';
import { getHubCities } from '../lib/seo-routes';
import { toDisplayName } from '../lib/bus-search';

export const metadata: Metadata = {
  title: 'Buses from Tamil Nadu Cities — All Routes & Timings',
  description:
    'Browse TNSTC & SETC bus routes from every major city in Tamil Nadu. Find inter-city timings, stops, and intermediate stop search.',
  alternates: { canonical: '/buses-from' },
};

const REGION_ORDER = [
  'North TN',
  'Central TN',
  'Cauvery Delta',
  'Western TN',
  'Madurai Region',
  'Southern TN',
] as const;

type Region = (typeof REGION_ORDER)[number];

const CITY_REGIONS: Record<string, Region> = {
  chennai: 'North TN',
  vellore: 'North TN',
  tiruvannamalai: 'North TN',
  villupuram: 'North TN',
  puducherry: 'North TN',
  cuddalore: 'North TN',
  krishnagiri: 'North TN',
  dharmapuri: 'North TN',
  hosur: 'North TN',
  salem: 'Central TN',
  namakkal: 'Central TN',
  rasipuram: 'Central TN',
  attur: 'Central TN',
  karur: 'Central TN',
  trichy: 'Cauvery Delta',
  thanjavur: 'Cauvery Delta',
  kumbakonam: 'Cauvery Delta',
  erode: 'Western TN',
  tiruppur: 'Western TN',
  coimbatore: 'Western TN',
  pollachi: 'Western TN',
  ooty: 'Western TN',
  palani: 'Western TN',
  madurai: 'Madurai Region',
  dindigul: 'Madurai Region',
  karaikudi: 'Madurai Region',
  kodaikanal: 'Madurai Region',
  tirunelveli: 'Southern TN',
  thoothukudi: 'Southern TN',
  nagercoil: 'Southern TN',
  kanyakumari: 'Southern TN',
  marthandam: 'Southern TN',
  tenkasi: 'Southern TN',
  rameswaram: 'Southern TN',
};

function getRegion(slug: string): Region {
  return CITY_REGIONS[slug] ?? 'Central TN';
}

export default function BusesFromIndexPage() {
  const hubs = getHubCities();

  const byRegion = new Map<Region, string[]>();
  for (const region of REGION_ORDER) {
    byRegion.set(region, []);
  }
  for (const hub of hubs) {
    const region = getRegion(hub);
    byRegion.get(region)!.push(hub);
  }

  const breadcrumbItems = [{ name: 'Home', href: '/' }, { name: 'Buses from Tamil Nadu' }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Buses from Tamil Nadu Cities</h1>
            <p className="text-sm text-neutral-500">
              {hubs.length} cities &middot; TNSTC, SETC &amp; MTC services
            </p>
          </section>

          {REGION_ORDER.map((region) => {
            const cities = byRegion.get(region) ?? [];
            if (cities.length === 0) return null;
            return (
              <section key={region} className="space-y-3">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-800">{region}</h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {cities.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/buses-from/${slug}`}
                        className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                      >
                        Buses from {toDisplayName(slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
