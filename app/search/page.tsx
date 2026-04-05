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
  normalizeTime,
  slugToQuery,
  toDisplayName,
  type RawSearchParams,
} from '../lib/bus-search';

type SearchPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawFrom = getParamValue(params.from);
  const rawTo = getParamValue(params.to);
  const rawTime = getParamValue(params.time);

  const normalizedFrom = rawFrom ? normalizeSlug(rawFrom) : '';
  const normalizedTo = rawTo ? normalizeSlug(rawTo) : '';
  const normalizedTime = rawTime ? normalizeTime(rawTime) : '';
  const isSelfRoute = Boolean(normalizedFrom && normalizedFrom === normalizedTo);

  const needsRedirect =
    (rawFrom && rawFrom !== normalizedFrom) ||
    (rawTo && rawTo !== normalizedTo) ||
    (rawTime && rawTime !== normalizedTime);

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

  const [interCityState, cityState] = canSearch
    ? await Promise.all([
        fetchSearchResults(normalizedFrom, normalizedTo, normalizedTime, 'inter-city'),
        fetchSearchResults(normalizedFrom, normalizedTo, normalizedTime, 'city'),
      ])
    : [
        { data: null, error: null as string | null },
        { data: null, error: null as string | null },
      ];

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
          <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
            No buses found for {toDisplayName(normalizedFrom)} to{' '}
            {toDisplayName(normalizedTo)}. Try nearby towns or adjust time.
          </p>
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
