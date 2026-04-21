import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SearchForm } from '../../components/search-form';
import { Breadcrumb } from '../../components/breadcrumb';
import { FAQJsonLd, BusTripsJsonLd, BusRouteJsonLd } from '../../components/json-ld';
import {
  buildBusRouteSlug,
  calculateDuration,
  calculateFareRange,
  fetchSearchResults,
  fetchTripStops,
  formatStopName,
  parseBusRouteSlug,
  to12h,
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

  const year = new Date().getFullYear();

  return {
    title: `${fromName} to ${toName} Bus — Timings & Stops (${year})`,
    description: `Find government buses from ${fromName} to ${toName} with departure times, stops, and TNSTC & SETC services. Updated for ${year}.`,
    alternates: {
      canonical: `/bus/${route}`,
    },
    openGraph: {
      title: `${fromName} to ${toName} Bus Timings — TNSTC & SETC`,
      description: `Find TNSTC & SETC buses from ${fromName} to ${toName} with intermediate stops.`,
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
    .filter((time): time is string => Boolean(time) && time !== '00:00:00');

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

  const firstBusLabel = to12h(firstBusTime) || 'Not available';
  const lastBusLabel = to12h(lastBusTime) || 'Not available';
  const serviceBreakdownLabel = serviceBreakdown.length
    ? serviceBreakdown.join(', ')
    : 'Multiple bus types';

  // Fare range (Option A: show min–max across all service types)
  const fareRange = calculateFareRange(results);

  // Average duration for FAQ
  const durations = results
    .map((r) => {
      const dep = r.boards_at ?? r.departs_at;
      const arr = r.arrives_at && r.arrives_at !== '00:00:00' ? r.arrives_at : null;
      return dep && arr ? calculateDuration(dep, arr) : null;
    })
    .filter((d): d is string => d !== null);
  const medianDuration = durations.length > 0 ? (durations[Math.floor(durations.length / 2)] ?? null) : null;

  // AC bus count for FAQ
  const acCount = results.filter((r) => {
    const s = (r.service_type ?? '').toLowerCase();
    return s.includes('ac') || s.includes('volvo') || s.includes('sleeper');
  }).length;

  if (!searchState.error && !hasResults) {
    notFound();
  }

  // Fetch stop sequence for the first result that has a trip_id
  const representativeTrip = results.find((r) => r.trip_id) ?? null;
  const tripStopsResult = representativeTrip?.trip_id
    ? await fetchTripStops(representativeTrip.trip_id)
    : null;
  const tripStops = tripStopsResult?.stops ?? [];

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

  const reverseRouteSuggestions = SEO_ROUTE_SLUGS.filter((slug) => slug.startsWith(`${toSlug}-to-`))
    .map((slug) => parseBusRouteSlug(slug))
    .filter((parsed): parsed is { fromSlug: string; toSlug: string } => Boolean(parsed))
    .filter((parsed) => parsed.toSlug !== fromSlug && parsed.toSlug !== toSlug)
    .map((parsed) => ({
      href: `/bus/${buildBusRouteSlug(toSlug, parsed.toSlug)}`,
      label: `${toName} to ${toDisplayName(parsed.toSlug)} bus timings`,
    }))
    .slice(0, 5);

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
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {fromName} to {toName} Bus Timings
          </h1>
          <p className="text-sm text-neutral-500">
            {serviceBreakdownLabel} &middot; TNSTC &amp; SETC services &middot; Updated {year}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
            {formattedDistance ? (
              <span>{formattedDistance}</span>
            ) : null}
            {medianDuration ? (
              <span>~{medianDuration}</span>
            ) : null}
            <span>{resultCount} bus{resultCount !== 1 ? 'es' : ''}</span>
            <span>First: <span className="font-medium">{firstBusLabel}</span></span>
            <span>Last: <span className="font-medium">{lastBusLabel}</span></span>
            {fareRange ? (
              <span className="font-medium text-emerald-700">
                {fareRange.min === fareRange.max
                  ? `₹${fareRange.min}`
                  : `₹${fareRange.min}–₹${fareRange.max}`}
              </span>
            ) : null}
          </div>
        </section>

        <SearchForm defaultFrom={fromName} defaultTo={toName} />

        <SearchResults
          fromSlug={fromSlug}
          toSlug={toSlug}
          results={searchState.data?.results ?? []}
          showSeoLink={false}
        />

        <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-emerald-800">
            Book seats online for TNSTC &amp; SETC buses
          </p>
          <a
            href="https://www.tnstc.in/OTRSOnline/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Book on TNSTC →
          </a>
        </div>

        {tripStops.length > 2 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Stops on this route
            </h2>
            <p className="text-xs text-neutral-500">
              Intermediate stops for route {representativeTrip?.route_no} — other buses may have different stops.
            </p>
            <ol className="relative border-l border-neutral-200 pl-5 space-y-2">
              {tripStops.map((stop, i) => {
                const displayName = formatStopName(stop.stop_name.replace(/-/g, ' '));
                const depTime = stop.departure_time && stop.departure_time !== '00:00:00'
                  ? to12h(stop.departure_time)
                  : null;
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.15rem] top-[0.35rem] h-2 w-2 rounded-full border border-neutral-300 bg-white" />
                    <span className="text-sm text-neutral-800">{displayName}</span>
                    {depTime ? (
                      <span className="ml-2 text-xs text-neutral-500">{depTime}</span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            About {fromName} to {toName} buses
          </h2>
          <div className="space-y-2 text-sm leading-6 text-neutral-700">
            <p>
              {resultCount} TNSTC and SETC buses operate between {fromName} and {toName}.
              {' '}enbus.in matches intermediate stops too — find buses even if {fromName} or {toName} is a mid-route stop.
            </p>
            <p>
              Bus types: {serviceBreakdownLabel.toLowerCase()}.
              {firstBusLabel !== 'Not available' ? ` First bus around ${firstBusLabel}` : null}
              {lastBusLabel !== 'Not available' ? `, last bus near ${lastBusLabel}.` : null}
            </p>
            {formattedDistance ? (
              <p>
                Typical route distance is {formattedDistance}, so plan buffer time for boarding and traffic.
              </p>
            ) : null}
          </div>
        </section>

        <BusRouteJsonLd
          fromName={fromName}
          toName={toName}
          resultCount={resultCount}
          firstBusTime={firstBusTime}
          lastBusTime={lastBusTime}
          serviceTypes={Object.values(serviceCounts).map((s) => s.display)}
        />

        <BusTripsJsonLd
          fromName={fromName}
          toName={toName}
          trips={(searchState.data?.results ?? []).map((r) => {
            const raw = r.boards_at ?? r.departs_at ?? null;
            return {
              routeNo: r.route_no,
              serviceType: r.service_type ?? null,
              boardStop: r.board_stop,
              alightStop: r.alight_stop,
              departsAt: raw && raw !== '00:00:00' ? raw : null,
            };
          })}
        />

        <FAQJsonLd
          questions={[
            {
              question: `How many government buses run from ${fromName} to ${toName}?`,
              answer: `There are ${resultCount} TNSTC and SETC government buses operating from ${fromName} to ${toName}.`,
            },
            {
              question: `Can I find buses that stop at ${fromName} or ${toName} mid-route?`,
              answer: `Yes. enbus.in searches intermediate stops, so you can find buses even if ${fromName} or ${toName} is not the origin or terminus.`,
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
              question: `How long does the journey from ${fromName} to ${toName} take?`,
              answer: `The journey from ${fromName} to ${toName} typically takes around ${medianDuration}. Actual travel time may vary with boarding stops and traffic.`,
            }] : []),
            ...(fareRange ? [{
              question: `What is the bus fare from ${fromName} to ${toName}?`,
              answer: fareRange.min === fareRange.max
                ? `The approximate bus fare from ${fromName} to ${toName} is ₹${fareRange.min}, based on official TNSTC rates.`
                : `Bus fares from ${fromName} to ${toName} range from approximately ₹${fareRange.min} (Express) to ₹${fareRange.max} (AC/Ultra Deluxe), based on official TNSTC rates.`,
            }] : []),
            ...(acCount > 0 ? [{
              question: `Are there AC buses from ${fromName} to ${toName}?`,
              answer: `Yes, ${acCount} AC or Ultra Deluxe bus${acCount !== 1 ? 'es' : ''} run${acCount === 1 ? 's' : ''} from ${fromName} to ${toName}.`,
            }] : []),
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
          <p className="text-sm text-neutral-500">
            Looking for the return journey?{' '}
            <Link
              href={`/bus/${buildBusRouteSlug(toSlug, fromSlug)}`}
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              {toName} to {fromName} bus timings
            </Link>
          </p>
        </section>

        {reverseRouteSuggestions.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Popular routes from {toName}
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
