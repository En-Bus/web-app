import Link from 'next/link';

import {
  formatStopName,
  getBestDisplayTime,
  type BusType,
  type SearchResult,
} from '../lib/bus-search';

type SearchResultsProps = {
  fromSlug: string;
  toSlug: string;
  results: SearchResult[];
  showSeoLink?: boolean;
  type?: BusType;
};

export function SearchResults({
  fromSlug,
  toSlug,
  results,
  showSeoLink = true,
  type,
}: SearchResultsProps) {
  const seoPrefix = type === 'city' ? '/city-bus' : '/bus';
  const seoHref = `${seoPrefix}/${fromSlug}-to-${toSlug}`;
  const canShowSeoLink = showSeoLink && results.length > 0;

  return (
    <section className="space-y-4">
      {results.length > 0 ? (
        <p className="text-sm text-neutral-600">Showing {results.length} results.</p>
      ) : null}
      {canShowSeoLink ? (
        <p className="text-sm text-neutral-600">
          View route page:{' '}
          <Link href={seoHref} className="text-neutral-900 underline underline-offset-2">
            {seoHref}
          </Link>
        </p>
      ) : null}

      {results.length ? (
        <ul className="space-y-4">
          {results.map((result, index) => (
            <li
              key={
                result.trip_id ??
                `${result.route_no}-${result.boards_at ?? result.departs_at}-${index}`
              }
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-semibold text-neutral-900">
                  {result.route_no}
                  {result.service_type && result.service_type !== 'MTC'
                    ? ` (${result.service_type})`
                    : ''}
                </div>
                {result.distance_km ? (
                  <span className="text-sm text-neutral-500">
                    {result.distance_km} km
                  </span>
                ) : null}
              </div>
              <div className="mt-2 text-base font-medium text-neutral-800">
                {getBestDisplayTime(result)}
              </div>
              <div className="mt-2 text-sm leading-6 text-neutral-700">
                {formatStopName(result.board_stop)} {' -> '}{formatStopName(result.alight_stop)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          No buses found.
        </p>
      )}
    </section>
  );
}
