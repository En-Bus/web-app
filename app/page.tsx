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
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Find Tamil Nadu bus timings and route pages
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            enbus.in helps you search TNSTC, SETC, and MTC buses across
            Tamil Nadu and Chennai.
          </p>
          <p className="text-base leading-7 text-neutral-700">
            Search directly below or browse popular routes to check timings,
            stops, and bus details.
          </p>
        </section>

        <SearchForm />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular inter-city bus routes
          </h2>
          <ul className="space-y-2">
            {interCityRoutes.map((route) => (
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

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular Chennai city bus routes
          </h2>
          <ul className="space-y-2">
            {cityBusRoutes.map((route) => (
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
