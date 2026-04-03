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
import { SEO_ROUTE_SLUGS } from '../../lib/seo-routes';

export function generateStaticParams() {
  return SEO_ROUTE_SLUGS.map((route) => ({ route }));
}

type BusRoutePageProps = {
  params: Promise<{
    route: string;
  }>;
};

const POPULAR_DESTINATIONS = [
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'madurai', name: 'Madurai' },
  { slug: 'salem', name: 'Salem' },
  { slug: 'coimbatore', name: 'Coimbatore' },
  { slug: 'tirunelveli', name: 'Tirunelveli' },
];

export async function generateMetadata({
  params,
}: BusRoutePageProps): Promise<Metadata> {
  const { route } = await params;
  const parsed = parseBusRouteSlug(route);

  if (!parsed) {
    return {
      title: 'Bus Timings',
      description: 'Find Tamil Nadu bus timings and route details.',
    };
  }

  const fromName = toDisplayName(parsed.fromSlug);
  const toName = toDisplayName(parsed.toSlug);

  if (parsed.fromSlug === parsed.toSlug) {
    return {
      title: 'Bus Timings',
      description: 'Find Tamil Nadu bus timings and route details.',
    };
  }

  return {
    title: `${fromName} to ${toName} Bus Timings | enbus.in`,
    description: `Check buses from ${fromName} to ${toName} with timings, routes, and stops. Find TNSTC and SETC buses easily.`,
    alternates: {
      canonical: `/bus/${route}`,
    },
  };
}

export default async function BusRoutePage({ params }: BusRoutePageProps) {
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
  const searchState = await fetchSearchResults(fromSlug, toSlug, '00:00', 'inter-city');
  const hasResults = Boolean(searchState.data?.results?.length);

  if (!searchState.error && !hasResults) {
    notFound();
  }
  const seoSuggestions = SEO_ROUTE_SLUGS.filter((slug) => slug.startsWith(`${fromSlug}-to-`))
    .map((slug) => parseBusRouteSlug(slug))
    .filter((parsed): parsed is { fromSlug: string; toSlug: string } => Boolean(parsed))
    .filter((parsed) => parsed.toSlug !== toSlug && parsed.toSlug !== fromSlug)
    .map((parsed) => ({
      href: `/bus/${buildBusRouteSlug(fromSlug, parsed.toSlug)}`,
      label: `${fromName} to ${toDisplayName(parsed.toSlug)} bus timings`,
    }));

  const curatedFallback = POPULAR_DESTINATIONS.filter(
    (destination) => destination.slug !== toSlug && destination.slug !== fromSlug,
  ).map((destination) => ({
    href: `/bus/${buildBusRouteSlug(fromSlug, destination.slug)}`,
    label: `${fromName} to ${destination.name} bus timings`,
  }));

  const popularRoutes = [...seoSuggestions, ...curatedFallback].slice(0, 5);

  if (searchState.error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {fromName} to {toName} Bus Timings
        </h1>
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchState.error}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {fromName} to {toName} Bus Timings
          </h1>

          <p className="text-base leading-7 text-neutral-700">
            Check {fromName} to {toName} bus timings with enbus.in.
          </p>
          <p className="text-base leading-7 text-neutral-700">
            Find TNSTC and SETC buses between {fromName} and {toName}, including
            routes that match through intermediate stops.
          </p>
          <p className="text-base leading-7 text-neutral-700">
            Use this page to quickly review available buses, timings, and stop
            coverage for {fromName} to {toName}.
          </p>
        </section>

        <SearchForm defaultFrom={fromName} defaultTo={toName} />

        <SearchResults
          fromSlug={fromSlug}
          toSlug={toSlug}
          results={searchState.data?.results ?? []}
          showSeoLink={false}
        />

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular routes from {fromName}
          </h2>
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
