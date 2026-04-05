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

function AgencyBadge({ serviceType }: { serviceType?: string | null }) {
  if (!serviceType) return null;

  const colorMap: Record<string, string> = {
    SETC: 'bg-orange-50 text-orange-700 border-orange-200',
    TNSTC: 'bg-green-50 text-green-700 border-green-200',
    MTC: 'bg-brand-50 text-brand-700 border-brand-100',
  };

  const colors = colorMap[serviceType] ?? 'bg-neutral-50 text-neutral-600 border-neutral-200';

  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium border ${colors}`}>
      {serviceType}
    </span>
  );
}

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
          <Link href={seoHref} className="text-brand-600 underline underline-offset-2 hover:text-brand-700">
            {seoHref}
          </Link>
        </p>
      ) : null}

      {results.length ? (
        <ul className="space-y-3">
          {results.map((result, index) => (
            <li
              key={
                result.trip_id ??
                `${result.route_no}-${result.boards_at ?? result.departs_at}-${index}`
              }
              className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-neutral-900">
                    {result.route_no}
                  </span>
                  <AgencyBadge serviceType={result.service_type} />
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
              <div className="mt-1.5 text-sm leading-6 text-neutral-600">
                {formatStopName(result.board_stop)}
                <span className="mx-1.5 text-neutral-400" aria-label="to">&rarr;</span>
                {formatStopName(result.alight_stop)}
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
