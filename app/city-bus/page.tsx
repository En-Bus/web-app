import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb } from '../components/breadcrumb';
import { SearchForm } from '../components/search-form';
import {
  parseBusRouteSlug,
  toDisplayName,
  type BusType,
} from '../lib/bus-search';
import { CITY_BUS_ROUTE_SLUGS } from '../lib/seo-routes';

export const metadata: Metadata = {
  title: 'Chennai City Bus Routes & Timings — MTC Bus Numbers | enbus.in',
  description:
    'Browse MTC Chennai city bus numbers with routes, stops, and timings. Use the bus route finder to search MTC services across Chennai.',
  alternates: {
    canonical: '/city-bus',
  },
};

type RouteCard = { href: string; label: string };

const COIMBATORE_HUBS = new Set(['gandhipuram', 'singanallur', 'ukkadam']);

function buildRoutes() {
  const mtc: RouteCard[] = [];
  const coimbatore: RouteCard[] = [];
  const stops = new Set<string>();

  for (const slug of CITY_BUS_ROUTE_SLUGS) {
    const parsed = parseBusRouteSlug(slug);
    if (!parsed) continue;
    const fromName = toDisplayName(parsed.fromSlug);
    const toName = toDisplayName(parsed.toSlug);
    stops.add(fromName);
    stops.add(toName);

    const card = {
      href: `/city-bus/${slug}`,
      label: `${fromName} to ${toName}`,
    };

    const isCoimbatore = COIMBATORE_HUBS.has(parsed.fromSlug) || COIMBATORE_HUBS.has(parsed.toSlug);
    if (isCoimbatore) {
      coimbatore.push(card);
    } else {
      mtc.push(card);
    }
  }

  return { mtc, coimbatore, stopCount: stops.size };
}

export default function CityBusIndexPage() {
  const { mtc, coimbatore, stopCount } = buildRoutes();
  const routeCount = CITY_BUS_ROUTE_SLUGS.length;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'City Bus Routes' },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Chennai City Bus Routes & MTC Timings
              </h1>
              <p className="text-base leading-7 text-neutral-700">
                Find Chennai MTC bus numbers, stops, and departure times. Search any city bus
                route, including intermediate stop matching, with live data refreshed multiple
                times a day.
              </p>
              <p className="text-sm text-neutral-500">
                {routeCount} routes · {stopCount} stops covered · Includes Coimbatore city buses
              </p>
            </div>

            <SearchForm
              defaultFrom="Chennai"
              defaultTo=""
              defaultTime=""
              defaultType={'city' as BusType}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              MTC Chennai city bus routes
            </h2>
            <p className="text-sm text-neutral-600">
              Popular MTC corridors across the Chennai metropolitan area. Tap a route to view full
              timings and stops.
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {mtc.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="block rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-50"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Coimbatore city bus routes
            </h2>
            <p className="text-sm text-neutral-600">
              City routes serving Gandhipuram, Ukkadam, Singanallur and nearby hubs.
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {coimbatore.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className="block rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-50"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
