import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { SearchForm } from '../components/search-form';
import { SearchResults } from '../components/search-results';
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

  const canSearch = Boolean(normalizedFrom && normalizedTo);
  const searchState = canSearch
    ? await fetchSearchResults(normalizedFrom, normalizedTo, normalizedTime)
    : { data: null, error: null as string | null };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Search Bus Routes
          </h1>
          <p className="text-base leading-7 text-neutral-700">
            Search TNSTC and SETC buses between Tamil Nadu routes, including
            intermediate stop matches.
          </p>
        </section>

        <SearchForm
          defaultFrom={normalizedFrom ? toDisplayName(slugToQuery(normalizedFrom)) : ''}
          defaultTo={normalizedTo ? toDisplayName(slugToQuery(normalizedTo)) : ''}
          defaultTime={normalizedTime}
        />

        {searchState.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {searchState.error}
          </p>
        ) : null}

        {searchState.data ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Results for {toDisplayName(normalizedFrom)} to{' '}
              {toDisplayName(normalizedTo)}
            </h2>
            <SearchResults
              fromSlug={normalizedFrom}
              toSlug={normalizedTo}
              results={searchState.data.results}
            />
          </section>
        ) : null}
      </div>
    </main>
  );
}
