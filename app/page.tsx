import Link from 'next/link';

import { SearchForm } from './components/search-form';
import { SEO_ROUTE_SLUGS } from './lib/seo-routes';
import { parseBusRouteSlug, toDisplayName } from './lib/bus-search';

const HOME_ROUTE_SLUGS = SEO_ROUTE_SLUGS.slice(0, 6);

export default function HomePage() {
  const popularRoutes = HOME_ROUTE_SLUGS.map((routeSlug) => {
    const parsed = parseBusRouteSlug(routeSlug);

    if (!parsed) {
      return null;
    }

    return {
      href: `/bus/${routeSlug}`,
      label: `${toDisplayName(parsed.fromSlug)} to ${toDisplayName(parsed.toSlug)} bus timings`,
    };
  }).filter(Boolean) as { href: string; label: string }[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Find Tamil Nadu bus timings and route pages
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            TN Bus Finder helps you search TNSTC and SETC buses between cities
            and towns across Tamil Nadu.
          </p>
          <p className="text-base leading-7 text-neutral-700">
            Search directly below or open route pages to check timings, stops,
            and related bus routes.
          </p>
        </section>

        <SearchForm />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Popular routes</h2>
          <ul className="space-y-2">
            {popularRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="text-sm text-neutral-900 underline underline-offset-2"
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
