'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import {
  calculateDuration,
  formatStopName,
  getBestDisplayTime,
  to12h,
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

function getTimeBand(time: string): string {
  if (!time || time === '00:00:00') return '';
  const h = parseInt(time.slice(0, 2), 10);
  if (isNaN(h) || h === 0) return '';
  if (h < 6) return 'Night';
  if (h < 10) return 'Early Morning';
  if (h < 17) return 'Day';
  return 'Evening';
}

function AgencyBadge({ serviceType }: { serviceType?: string | null }) {
  if (!serviceType) return null;

  const s = serviceType.toLowerCase();
  let colors: string;
  if (s.includes('ac') || s.includes('volvo') || s.includes('sleeper')) {
    colors = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (s.includes('ultra') || s.includes('deluxe')) {
    colors = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (s.includes('express') || s.includes('super')) {
    colors = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    colors = 'bg-neutral-50 text-neutral-600 border-neutral-200';
  }

  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium border ${colors}`}>
      {serviceType}
    </span>
  );
}

function ReportButton({
  routeNo,
  boardStop,
  alightStop,
}: {
  routeNo: string;
  boardStop: string;
  alightStop: string;
}) {
  const [state, setState] = useState<'idle' | 'sent'>('idle');

  function report() {
    if (state === 'sent') return;
    setState('sent');
    fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type: 'wrong_time',
        route_no: routeNo,
        from_stop: boardStop,
        to_stop: alightStop,
      }),
    }).catch(() => {/* ignore */});
  }

  return (
    <button
      type="button"
      onClick={report}
      className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
    >
      {state === 'sent' ? 'Reported' : 'Report issue'}
    </button>
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

  // Client-side current time for "Next bus" highlight
  const [nowMins, setNowMins] = useState<number | null>(null);
  useEffect(() => {
    const d = new Date();
    setNowMins(d.getHours() * 60 + d.getMinutes());
  }, []);

  const nextBusIndex = results.findIndex((r) => {
    if (nowMins === null) return false;
    const time = r.boards_at ?? r.departs_at;
    if (!time) return false;
    const parts = time.slice(0, 5).split(':').map(Number);
    const h = parts[0] ?? NaN;
    const m = parts[1] ?? NaN;
    if (isNaN(h) || isNaN(m)) return false;
    return h * 60 + m >= nowMins;
  });

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
          {(() => {
            const items: React.ReactNode[] = [];
            let lastBand = '';

            for (let index = 0; index < results.length; index++) {
              const result = results[index]!;
              const time = result.boards_at ?? result.departs_at ?? '';
              const band = getTimeBand(time);
              const isNextBus = nowMins !== null && index === nextBusIndex;
              const isPast = nowMins !== null && nextBusIndex >= 0 && index < nextBusIndex;

              if (band && band !== lastBand) {
                lastBand = band;
                items.push(
                  <li key={`band-${band}`} className="pt-1 pb-0.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      {band}
                    </span>
                  </li>,
                );
              }

              const dep = result.boards_at ?? result.departs_at;
              const arrRaw = result.arrives_at && result.arrives_at !== '00:00:00' ? result.arrives_at : null;
              const arrivesAt = to12h(arrRaw) || null;
              const duration = dep && arrRaw ? calculateDuration(dep, arrRaw) : null;

              items.push(
                <li
                  key={
                    result.trip_id ??
                    `${result.route_no}-${result.boards_at ?? result.departs_at}-${index}`
                  }
                  className={`rounded-lg border bg-white p-4 transition-colors ${
                    isNextBus
                      ? 'border-green-400 ring-1 ring-green-100'
                      : isPast
                      ? 'border-neutral-100 opacity-55'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {isNextBus && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                        Next bus
                      </span>
                    </div>
                  )}
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
                  {(() => {
                    const displayTime = getBestDisplayTime(result);
                    const hasTime = displayTime !== 'No timing info';
                    return (
                      <div className="mt-2 flex items-baseline gap-2 text-base font-medium text-neutral-800">
                        {hasTime ? (
                          arrivesAt ? (
                            <>
                              <span>{displayTime}</span>
                              <span className="text-neutral-400 text-sm font-normal" aria-hidden="true">→</span>
                              <span>{arrivesAt}</span>
                              {duration ? (
                                <span className="text-xs font-normal text-neutral-400">· {duration}</span>
                              ) : null}
                            </>
                          ) : (
                            <span>{displayTime}</span>
                          )
                        ) : (
                          <span className="text-sm font-normal text-neutral-400">Time not in schedule</span>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm leading-6 text-neutral-600">
                      {formatStopName(result.board_stop)}
                      <span className="mx-1.5 text-neutral-400" aria-hidden="true">&rarr;</span>
                      {formatStopName(result.alight_stop)}
                    </span>
                    <ReportButton
                      routeNo={result.route_no}
                      boardStop={result.board_stop}
                      alightStop={result.alight_stop}
                    />
                  </div>
                </li>,
              );
            }

            return items;
          })()}
        </ul>
      ) : (
        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          No buses found.
        </p>
      )}
    </section>
  );
}
