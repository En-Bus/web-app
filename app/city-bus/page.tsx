import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb } from '../components/breadcrumb';
import { parseBusRouteSlug, toDisplayName } from '../lib/bus-search';
import { CITY_BUS_ROUTE_SLUGS } from '../lib/seo-routes';

export const metadata: Metadata = {
  title: 'Chennai MTC City Bus Routes & Timings (2026)',
  description:
    'Browse all MTC city bus routes in Chennai. Find bus numbers, timings, and stops for metropolitan transport.',
  alternates: {
    canonical: '/city-bus',
  },
};

function groupRoutesByOrigin() {
  const groups = new Map<string, { href: string; label: string }[]>();

  for (const slug of CITY_BUS_ROUTE_SLUGS) {
    const parsed = parseBusRouteSlug(slug);
    if (!parsed) continue;
    const fromName = toDisplayName(parsed.fromSlug);
    const toName = toDisplayName(parsed.toSlug);
    const entry = {
      href: `/city-bus/${slug}`,
      label: `${fromName} to ${toName}`,
    };
    const existing = groups.get(fromName) ?? [];
    existing.push(entry);
    groups.set(fromName, existing);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function CityBusIndexPage() {
  const routeGroups = groupRoutesByOrigin();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'City Bus Routes' },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Chennai MTC City Bus Routes
            </h1>
            <p className="text-sm text-neutral-500">
              {CITY_BUS_ROUTE_SLUGS.length} routes &middot; MTC metropolitan services
            </p>
          </section>

          {routeGroups.map(([cityName, routes]) => (
            <section key={cityName} className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight">
                From {cityName}
              </h2>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {routes.map((route) => (
                  <li key={route.href}>
                    <Link
                      href={route.href}
                      className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                    >
                      {route.label} bus routes
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
