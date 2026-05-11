'use client';

import { useEffect, useState } from 'react';

type GamePromoPlacement =
  | 'home_after_search'
  | 'search_after_next_bus'
  | 'route_after_next_bus';

type GamePromoProps = {
  placement: GamePromoPlacement;
  inList?: boolean;
};

type SolputhirPuzzle = {
  scrambledLetters: string[];
  date: string;
  ctaUrl: string;
};

const PUZZLE_JSON_URL = 'https://indieegg.com/works/solputhir/today-puzzle.json';

function formatSolputhirDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function GamePromo({ placement, inList = false }: GamePromoProps) {
  const [puzzle, setPuzzle] = useState<SolputhirPuzzle | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzle() {
      try {
        const response = await fetch(PUZZLE_JSON_URL, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load Solputhir teaser');
        }

        const data = (await response.json()) as Partial<SolputhirPuzzle>;
        if (
          !Array.isArray(data.scrambledLetters) ||
          !data.scrambledLetters.length ||
          typeof data.ctaUrl !== 'string' ||
          !data.ctaUrl
        ) {
          throw new Error('Incomplete Solputhir teaser data');
        }

        if (!cancelled) {
          setPuzzle({
            scrambledLetters: data.scrambledLetters,
            date: typeof data.date === 'string' ? data.date : '',
            ctaUrl: data.ctaUrl,
          });
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    }

    loadPuzzle();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!puzzle || typeof window === 'undefined' || !(window as any).gtag) return;

    (window as any).gtag('event', 'solputhir_promo_impression', {
      placement,
      source: 'enbus',
    });
  }, [placement, puzzle]);

  if (failed || !puzzle) {
    return null;
  }

  function trackClick() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'solputhir_promo_click', {
        placement,
        source: 'enbus',
      });
    }
  }

  const tiles = puzzle.scrambledLetters.map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-base font-semibold shadow-xs sm:h-11 sm:min-w-11 ${
        index === 0
          ? 'border-brand-100 bg-brand-50 text-brand-700'
          : 'border-neutral-200 bg-white text-neutral-800'
      }`}
    >
      {letter}
    </span>
  ));

  const card = (
    <a
      href={puzzle.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackClick}
      className="group block rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-brand-300 hover:bg-white sm:p-5"
      aria-label="Play today's Solputhir puzzle on Google Play"
      data-solputhir-promo
      data-solputhir-placement={placement}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <img
            src="/solputhir-icon.png"
            alt="Solputhir icon"
            width="52"
            height="52"
            className="h-[52px] w-[52px] rounded-2xl border border-neutral-200 bg-white object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Daily Tamil puzzle
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
              Solputhir
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium text-neutral-500">
            <span>Today&apos;s puzzle</span>
            <span>{formatSolputhirDate(puzzle.date)}</span>
          </div>
          <div
            className="flex flex-nowrap gap-2 overflow-x-auto pb-1"
            aria-hidden="true"
            data-solputhir-tiles
            data-testid="solputhir-tiles"
          >
            {tiles}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm leading-6 text-neutral-600">
            Rearrange the letters and solve today&apos;s Tamil word in the app.
          </p>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-brand-700">
            <span>Solve in app</span>
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </a>
  );

  return inList ? <div className="list-none">{card}</div> : card;
}
