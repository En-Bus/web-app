import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { SearchForm } from '../components/search-form';
import { SearchResults } from '../components/search-results';
import { SearchEventTracker, SearchFeedback } from '../components/search-feedback';
import {
  fetchSearchResults,
  getParamValue,
  normalizeSlug,
  normalizeQuerySlug,
  normalizeTime,
  slugToQuery,
  toDisplayName,
  type RawSearchParams,
} from '../lib/bus-search';

type SearchPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const rawFrom = getParamValue(params.from);
  const rawTo = getParamValue(params.to);

  if (rawFrom && rawTo) {
    const from = toDisplayName(normalizeQuerySlug(rawFrom));
    const to = toDisplayName(normalizeQuerySlug(rawTo));
    return {
      title: `${from} to ${to} Bus Timings | TNSTC & SETC`,
      description: `Check ${from} to ${to} government bus timings, routes and stops. Find TNSTC, SETC & MTC buses with departure times.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: 'Search Bus Routes | TNSTC, SETC & MTC',
    description:
      'Search Tamil Nadu government bus routes with timings, stops, and intermediate stop support.',
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawFrom = getParamValue(params.from);
  const rawTo = getParamValue(params.to);
  const rawTime = getParamValue(params.time);

  const normalizedFrom = rawFrom ? normalizeQuerySlug(rawFrom) : '';
  const normalizedTo = rawTo ? normalizeQuerySlug(rawTo) : '';
  const normalizedTime = rawTime ? normalizeTime(rawTime) : '';
  const isSelfRoute = Boolean(normalizedFrom && normalizedFrom === normalizedTo);

  const needsRedirect =
    !isSelfRoute &&
    ((rawFrom && rawFrom !== normalizedFrom) ||
      (rawTo && rawTo !== normalizedTo) ||
      (rawTime && rawTime !== normalizedTime));

  if (needsRedirect) {
    const nextParams = new URLSearchParams();

    if (normalizedFrom) {
      nextParams.set('from', normalizedFrom);
    }

    if (normalizedTo) {
      nextParams.set('to', normalizedTo);
    }

    if (normalizedTime) {
      nextParams.set('time', normalizedTime);
    }

    redirect(`/search?${nextParams.toString()}`);
  }

  const canSearch = Boolean(normalizedFrom && normalizedTo && !isSelfRoute);
  const rawType = getParamValue(params.type);
  const typeFilter = rawType === 'inter-city' || rawType === 'city' ? rawType : null;

  const emptyState = { data: null, error: null as string | null };
  const [interCityState, cityState] = canSearch
    ? await Promise.all([
        typeFilter !== 'city'
          ? fetchSearchResults(normalizedFrom, normalizedTo, normalizedTime, 'inter-city')
          : Promise.resolve(emptyState),
        typeFilter !== 'inter-city'
          ? fetchSearchResults(normalizedFrom, normalizedTo, normalizedTime, 'city')
          : Promise.resolve(emptyState),
      ])
    : [emptyState, emptyState];

  const hasInterCity = Boolean(interCityState.data?.results?.length);
  const hasCityBus = Boolean(cityState.data?.results?.length);
  const hasAnyResults = hasInterCity || hasCityBus;
  const error = interCityState.error || cityState.error;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Search Bus Routes
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Search TNSTC, SETC, and MTC buses across Tamil Nadu, including
            intermediate stop matches.
          </p>
        </section>

        <SearchForm
          defaultFrom={normalizedFrom ? toDisplayName(slugToQuery(normalizedFrom)) : ''}
          defaultTo={normalizedTo ? toDisplayName(slugToQuery(normalizedTo)) : ''}
          defaultTime={normalizedTime}
        />

        {isSelfRoute ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            From and To must be different. Please choose two locations.
          </p>
        ) : null}

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {hasInterCity ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Inter-city buses — {toDisplayName(normalizedFrom)} to{' '}
              {toDisplayName(normalizedTo)}
            </h2>
            <SearchResults
              fromSlug={normalizedFrom}
              toSlug={normalizedTo}
              results={interCityState.data?.results ?? []}
              showSeoLink
              type="inter-city"
            />
          </section>
        ) : null}

        {hasCityBus ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Chennai city buses — {toDisplayName(normalizedFrom)} to{' '}
              {toDisplayName(normalizedTo)}
            </h2>
            <SearchResults
              fromSlug={normalizedFrom}
              toSlug={normalizedTo}
              results={cityState.data?.results ?? []}
              showSeoLink
              type="city"
            />
          </section>
        ) : null}

        {canSearch && !hasAnyResults && !error && !isSelfRoute ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
            <p className="text-neutral-800">
              No buses found for {toDisplayName(normalizedFrom)} to{' '}
              {toDisplayName(normalizedTo)}. Try nearby towns or adjust time.
            </p>
            <p className="mt-2 text-neutral-600">
              Know a bus that runs this route?{' '}
              <a href="/contribute" className="text-brand-600 underline underline-offset-2 hover:text-brand-700">
                Photograph the timetable board
              </a>{' '}
              and help us add it.
            </p>
          </div>
        ) : null}

        {canSearch && !error && !isSelfRoute ? (
          <Suspense>
            <SearchFeedback
              from={normalizedFrom}
              to={normalizedTo}
              hasResults={hasAnyResults}
            />
          </Suspense>
        ) : null}

        {canSearch ? (
          <Suspense>
            <SearchEventTracker
              from={normalizedFrom}
              to={normalizedTo}
              interCityCount={interCityState.data?.results?.length ?? 0}
              cityCount={cityState.data?.results?.length ?? 0}
            />
          </Suspense>
        ) : null}
      </div>
    </main>
  );
}
