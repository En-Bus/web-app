import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb } from '../components/breadcrumb';
import { parseBusRouteSlug, toDisplayName } from '../lib/bus-search';
import { SEO_ROUTE_SLUGS } from '../lib/seo-routes';

export const metadata: Metadata = {
  title: 'All Inter-City Bus Routes in Tamil Nadu (2026)',
  description:
    'Browse all TNSTC and SETC inter-city bus routes across Tamil Nadu. Find timings, stops, and routes between major cities.',
  alternates: {
    canonical: '/bus',
  },
};

function groupRoutesByOrigin() {
  const groups = new Map<string, { href: string; label: string }[]>();

  for (const slug of SEO_ROUTE_SLUGS) {
    const parsed = parseBusRouteSlug(slug);
    if (!parsed) continue;
    const fromName = toDisplayName(parsed.fromSlug);
    const toName = toDisplayName(parsed.toSlug);
    const entry = {
      href: `/bus/${slug}`,
      label: `${fromName} to ${toName}`,
    };
    const existing = groups.get(fromName) ?? [];
    existing.push(entry);
    groups.set(fromName, existing);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function BusIndexPage() {
  const routeGroups = groupRoutesByOrigin();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Bus Routes' },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Inter-City Bus Routes in Tamil Nadu
            </h1>
            <p className="text-sm text-neutral-500">
              {SEO_ROUTE_SLUGS.length} routes &middot; TNSTC &amp; SETC services
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
                      {route.label} bus timings
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
