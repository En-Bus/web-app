import Link from 'next/link';

import { SearchForm } from './components/search-form';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS } from './lib/seo-routes';
import { parseBusRouteSlug, toDisplayName } from './lib/bus-search';

function buildRouteLinks(
  slugs: readonly string[],
  prefix: string,
  labelSuffix: string,
  count: number,
) {
  return slugs
    .slice(0, count)
    .map((routeSlug) => {
      const parsed = parseBusRouteSlug(routeSlug);
      if (!parsed) return null;
      return {
        href: `${prefix}/${routeSlug}`,
        label: `${toDisplayName(parsed.fromSlug)} to ${toDisplayName(parsed.toSlug)} ${labelSuffix}`,
      };
    })
    .filter(Boolean) as { href: string; label: string }[];
}

export default function HomePage() {
  const interCityRoutes = buildRouteLinks(
    SEO_ROUTE_SLUGS,
    '/bus',
    'bus timings',
    8,
  );
  const cityBusRoutes = buildRouteLinks(
    CITY_BUS_ROUTE_SLUGS,
    '/city-bus',
    'bus routes',
    8,
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tamil Nadu Bus Routes &amp; Timings
          </h1>
          <p className="text-base leading-7 text-neutral-600">
            Search TNSTC, SETC, and MTC buses across Tamil Nadu and Chennai
            — including intermediate stops that other apps miss.
          </p>
        </section>

        <SearchForm />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span>612 places</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>37,770 trips</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>15 agencies</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>Free, no ads</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular inter-city bus routes
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {interCityRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular Chennai city bus routes
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cityBusRoutes.map((route) => (
              <li key={route.href}>
                <Link
                  href={route.href}
                  className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
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
