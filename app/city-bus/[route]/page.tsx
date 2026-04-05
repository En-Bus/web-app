import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SearchForm } from '../../components/search-form';
import {
  buildBusRouteSlug,
  fetchSearchResults,
  parseBusRouteSlug,
  toDisplayName,
} from '../../lib/bus-search';
import { SearchResults } from '../../components/search-results';
import { CITY_BUS_ROUTE_SLUGS } from '../../lib/seo-routes';

export function generateStaticParams() {
  return CITY_BUS_ROUTE_SLUGS.map((route) => ({ route }));
}

type CityBusRoutePageProps = {
  params: Promise<{
    route: string;
  }>;
};

export async function generateMetadata({
  params,
}: CityBusRoutePageProps): Promise<Metadata> {
  const { route } = await params;
  const parsed = parseBusRouteSlug(route);

  if (!parsed) {
    return {
      title: 'Chennai City Bus Routes',
      description: 'Find MTC Chennai city bus routes and timings.',
    };
  }

  const fromName = toDisplayName(parsed.fromSlug);
  const toName = toDisplayName(parsed.toSlug);

  if (parsed.fromSlug === parsed.toSlug) {
    return {
      title: 'Chennai City Bus Routes',
      description: 'Find MTC Chennai city bus routes and timings.',
    };
  }

  return {
    title: `${fromName} to ${toName} MTC Bus Routes & Timings`,
    description: `Find MTC city bus routes from ${fromName} to ${toName} in Chennai. Check bus numbers, first and last bus timings.`,
    alternates: {
      canonical: `/city-bus/${route}`,
    },
  };
}

export default async function CityBusRoutePage({
  params,
}: CityBusRoutePageProps) {
  const { route } = await params;
  const parsed = parseBusRouteSlug(route);

  if (!parsed) {
    notFound();
  }

  if (parsed.fromSlug === parsed.toSlug) {
    notFound();
  }

  const { fromSlug, toSlug } = parsed;
  const fromName = toDisplayName(fromSlug);
  const toName = toDisplayName(toSlug);
  const searchState = await fetchSearchResults(fromSlug, toSlug, '00:00', 'city');
  const hasResults = Boolean(searchState.data?.results?.length);

  if (!searchState.error && !hasResults) {
    notFound();
  }

  const seoSuggestions = CITY_BUS_ROUTE_SLUGS.filter((slug) =>
    slug.startsWith(`${fromSlug}-to-`),
  )
    .map((slug) => parseBusRouteSlug(slug))
    .filter(
      (parsed): parsed is { fromSlug: string; toSlug: string } =>
        Boolean(parsed),
    )
    .filter((parsed) => parsed.toSlug !== toSlug && parsed.toSlug !== fromSlug)
    .map((parsed) => ({
      href: `/city-bus/${buildBusRouteSlug(fromSlug, parsed.toSlug)}`,
      label: `${fromName} to ${toDisplayName(parsed.toSlug)} bus routes`,
    }))
    .slice(0, 5);

  if (searchState.error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {fromName} to {toName} MTC Bus Routes
        </h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchState.error}
        </p>
      </main>
    );
  }

  const resultCount = searchState.data?.results?.length ?? 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {fromName} to {toName} MTC Bus Routes
          </h1>

          <p className="text-base leading-7 text-neutral-700">
            {resultCount} MTC city bus{resultCount !== 1 ? ' routes' : ' route'}{' '}
            from {fromName} to {toName} in Chennai.
          </p>
          <p className="text-base leading-7 text-neutral-700">
            Find bus numbers, departure times, and stop details for Chennai
            metropolitan buses between {fromName} and {toName}.
          </p>
        </section>

        <SearchForm defaultFrom={fromName} defaultTo={toName} />

        <SearchResults
          fromSlug={fromSlug}
          toSlug={toSlug}
          results={searchState.data?.results ?? []}
          showSeoLink={false}
          type="city"
        />

        {seoSuggestions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              More routes from {fromName}
            </h2>
            <ul className="space-y-2">
              {seoSuggestions.map((route) => (
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
        )}
      </div>
    </main>
  );
}
