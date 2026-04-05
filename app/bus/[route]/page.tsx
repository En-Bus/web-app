import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SearchForm } from '../../components/search-form';
import { Breadcrumb } from '../../components/breadcrumb';
import { FAQJsonLd } from '../../components/json-ld';
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
    title: `${fromName} to ${toName} Bus Timings (2026)`,
    description: `Compare TNSTC & SETC buses from ${fromName} to ${toName} — timings, stops, and routes including intermediate stops. Updated for 2026.`,
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
  const resultCount = searchState.data?.results?.length ?? 0;

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

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Bus Routes', href: '/bus' },
    { name: `${fromName} to ${toName}` },
  ];

  if (searchState.error) {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            {fromName} to {toName} Bus Timings
          </h1>
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchState.error}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
    <Breadcrumb items={breadcrumbItems} />
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {fromName} to {toName} Bus Timings
          </h1>
          <p className="text-sm text-neutral-500">
            {resultCount} bus{resultCount !== 1 ? 'es' : ''} found &middot; TNSTC &amp; SETC services &middot; Updated 2026
          </p>
        </section>

        <SearchForm defaultFrom={fromName} defaultTo={toName} />

        <SearchResults
          fromSlug={fromSlug}
          toSlug={toSlug}
          results={searchState.data?.results ?? []}
          showSeoLink={false}
        />

        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            About {fromName} to {toName} buses
          </h2>
          <div className="space-y-2 text-sm leading-6 text-neutral-700">
            <p>
              {resultCount} TNSTC and SETC buses operate between {fromName} and {toName}.
              enbus.in matches intermediate stops too, so you can find buses
              even if {fromName} or {toName} is a mid-route stop.
            </p>
            <p>
              Bus types include Express, Super Deluxe, Ultra Deluxe, A/C Sleeper,
              and Semi-Sleeper services depending on the route.
            </p>
          </div>
        </section>

        <FAQJsonLd
          questions={[
            {
              question: `How many buses run from ${fromName} to ${toName}?`,
              answer: `There are ${resultCount} buses operating from ${fromName} to ${toName}, including TNSTC and SETC services.`,
            },
            {
              question: `Can I find buses that stop at ${fromName} or ${toName} mid-route?`,
              answer: `Yes. enbus.in searches intermediate stops, so you can find buses even if ${fromName} or ${toName} is not the origin or terminus.`,
            },
          ]}
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
    </>
  );
}
