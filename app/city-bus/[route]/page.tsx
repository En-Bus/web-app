import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SearchForm } from '../../components/search-form';
import { Breadcrumb } from '../../components/breadcrumb';
import { FAQJsonLd } from '../../components/json-ld';
import {
  buildBusRouteSlug,
  calculateDuration,
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

  const year = new Date().getFullYear();

  return {
    title: `${fromName} to ${toName} MTC Bus Numbers & Routes (${year})`,
    description: `Find MTC buses from ${fromName} to ${toName} with bus numbers, stops, and timings across Chennai. Updated for ${year}.`,
    alternates: {
      canonical: `/city-bus/${route}`,
    },
    openGraph: {
      title: `${fromName} to ${toName} MTC Bus Numbers & Routes`,
      description: `MTC buses with numbers, stops, and timings for ${fromName} to ${toName}.`,
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
  const results = searchState.data?.results ?? [];
  const resultCount = results.length;
  const hasResults = Boolean(resultCount);
  const year = new Date().getFullYear();

  const serviceCounts = results.reduce<Record<string, { count: number; display: string }>>(
    (acc, result) => {
      const raw = result.service_type?.trim();
      if (!raw) return acc;
      const key = raw.toUpperCase();
      if (!acc[key]) acc[key] = { count: 0, display: raw };
      acc[key].count++;
      return acc;
    },
    {},
  );

  const serviceBreakdown = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .map(({ count, display }) => `${count} ${display}`);

  const firstLastTimes = results
    .map((result) => result.boards_at ?? result.departs_at)
    .filter((time): time is string => Boolean(time));

  const firstBusTime = firstLastTimes.length
    ? firstLastTimes.reduce((earliest, current) => (current < earliest ? current : earliest))
    : null;

  const lastBusTime = firstLastTimes.length
    ? firstLastTimes.reduce((latest, current) => (current > latest ? current : latest))
    : null;

  const distanceKm = results.find((result) => result.distance_km)?.distance_km ?? null;
  const rawDist = Number(distanceKm);
  const formattedDistance = distanceKm
    ? `~${rawDist >= 100 ? Math.round(rawDist / 5) * 5 : Math.round(rawDist)} km`
    : null;

  const firstBusLabel = firstBusTime ? firstBusTime.slice(0, 5) : 'Not available';
  const lastBusLabel = lastBusTime ? lastBusTime.slice(0, 5) : 'Not available';
  const serviceBreakdownLabel = serviceBreakdown.length
    ? serviceBreakdown.join(', ')
    : 'Multiple bus types';

  const durations = results
    .map((r) => {
      const dep = r.boards_at ?? r.departs_at;
      const arr = r.arrives_at && r.arrives_at !== '00:00:00' ? r.arrives_at : null;
      return dep && arr ? calculateDuration(dep, arr) : null;
    })
    .filter((d): d is string => d !== null);
  const medianDuration = durations.length > 0 ? (durations[Math.floor(durations.length / 2)] ?? null) : null;

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

  const reverseRouteSuggestions = CITY_BUS_ROUTE_SLUGS.filter((slug) =>
    slug.startsWith(`${toSlug}-to-`),
  )
    .map((slug) => parseBusRouteSlug(slug))
    .filter(
      (parsed): parsed is { fromSlug: string; toSlug: string } =>
        Boolean(parsed),
    )
    .filter((parsed) => parsed.toSlug !== fromSlug && parsed.toSlug !== toSlug)
    .map((parsed) => ({
      href: `/city-bus/${buildBusRouteSlug(toSlug, parsed.toSlug)}`,
      label: `${toName} to ${toDisplayName(parsed.toSlug)} bus routes`,
    }))
    .slice(0, 5);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'City Bus Routes', href: '/city-bus' },
    { name: `${fromName} to ${toName}` },
  ];

  if (searchState.error) {
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            {fromName} to {toName} MTC Bus Routes
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
            {fromName} to {toName} MTC Bus Routes
          </h1>
          <p className="text-sm text-neutral-500">
            {resultCount} MTC city bus{resultCount !== 1 ? ' routes' : ' route'} found &middot; {serviceBreakdownLabel} &middot; Chennai metropolitan &middot; Updated {year}
          </p>
          <div className="space-y-1 text-sm text-neutral-600">
            <p>
              First bus: <span className="font-medium">{firstBusLabel}</span> &middot; Last bus:{' '}
              <span className="font-medium">{lastBusLabel}</span>
            </p>
            {formattedDistance ? (
              <p>
                Distance: <span className="font-medium">{formattedDistance}</span>
              </p>
            ) : null}
          </div>
        </section>

        <SearchForm defaultFrom={fromName} defaultTo={toName} />

        <SearchResults
          fromSlug={fromSlug}
          toSlug={toSlug}
          results={searchState.data?.results ?? []}
          showSeoLink={false}
          type="city"
        />

        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            About {fromName} to {toName} city buses
          </h2>
          <div className="space-y-2 text-sm leading-6 text-neutral-700">
            <p>
              {resultCount} MTC buses connect {fromName} and {toName} in
              the Chennai metropolitan area. enbus.in matches intermediate stops,
              so you can find buses even when your stop is mid-route.
            </p>
            <p>
              Bus types include {serviceBreakdownLabel.toLowerCase()}, with first departures around {firstBusLabel}
              and last buses near {lastBusLabel} for late-night coverage.
            </p>
            {formattedDistance ? (
              <p>
                Typical distance for this city route is {formattedDistance}; travel time varies with traffic.
              </p>
            ) : null}
          </div>
        </section>

        <FAQJsonLd
          questions={[
            {
              question: `How many MTC buses run from ${fromName} to ${toName}?`,
              answer: `There are ${resultCount} MTC city bus routes from ${fromName} to ${toName} in Chennai.`,
            },
            {
              question: `Can I find MTC buses stopping at ${fromName} mid-route?`,
              answer: `Yes. enbus.in searches intermediate stops, so you can find MTC buses even if ${fromName} is not the first or last stop.`,
            },
            {
              question: `What time is the first bus from ${fromName} to ${toName}?`,
              answer: `The first bus departs at ${firstBusLabel}.`,
            },
            {
              question: `What time is the last bus from ${fromName} to ${toName}?`,
              answer: `The last bus departs at ${lastBusLabel}.`,
            },
            {
              question: `What types of buses run from ${fromName} to ${toName}?`,
              answer: `Bus types include ${serviceBreakdownLabel}.`,
            },
            ...(medianDuration ? [{
              question: `How long does the journey from ${fromName} to ${toName} take by MTC bus?`,
              answer: `The MTC bus journey from ${fromName} to ${toName} typically takes around ${medianDuration}. Travel time varies with traffic.`,
            }] : []),
          ]}
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
                    className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-neutral-500">
              Looking for the return journey?{' '}
              <Link
                href={`/city-bus/${buildBusRouteSlug(toSlug, fromSlug)}`}
                className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
              >
                {toName} to {fromName} MTC buses
              </Link>
            </p>
          </section>
        )}

        {reverseRouteSuggestions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              More routes from {toName}
            </h2>
            <ul className="space-y-2">
              {reverseRouteSuggestions.map((route) => (
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
        )}
      </div>
    </main>
    </>
  );
}
