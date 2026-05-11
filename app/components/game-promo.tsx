'use client';

import { useEffect, useMemo, useState } from 'react';

type GamePromoPlacement = 'search_after_next_bus' | 'route_after_next_bus';

type GamePromoProps = {
  fromSlug: string;
  toSlug: string;
  placement: GamePromoPlacement;
};

type PromoVariant = 'wait_time' | 'daily_tamil';

const DISMISS_KEY = 'enbus-game-promo-dismissed-v1';
const PLAY_STORE_BASE_URL = 'https://play.google.com/store/apps/details';
const PACKAGE_NAME = 'com.solputhir.daily';

function getVariant(fromSlug: string, toSlug: string): PromoVariant {
  const key = `${fromSlug}:${toSlug}`;
  const score = Array.from(key).reduce((total, char) => total + char.charCodeAt(0), 0);
  return score % 2 === 0 ? 'wait_time' : 'daily_tamil';
}

function buildPromoUrl(placement: GamePromoPlacement, variant: PromoVariant) {
  const utmContent = `${placement}_${variant}`;
  const referrer = `utm_source=enbus&utm_medium=web&utm_campaign=solputhir_promo&utm_content=${utmContent}`;

  return (
    `${PLAY_STORE_BASE_URL}?id=${PACKAGE_NAME}` +
    `&utm_source=enbus` +
    `&utm_medium=web` +
    `&utm_campaign=solputhir_promo` +
    `&utm_content=${utmContent}` +
    `&referrer=${encodeURIComponent(referrer)}`
  );
}

export function GamePromo({ fromSlug, toSlug, placement }: GamePromoProps) {
  const [dismissed, setDismissed] = useState(true);
  const variant = useMemo(() => getVariant(fromSlug, toSlug), [fromSlug, toSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hidden = window.localStorage.getItem(DISMISS_KEY) === '1';
    setDismissed(hidden);
  }, []);

  useEffect(() => {
    if (dismissed || typeof window === 'undefined' || !(window as any).gtag) return;

    (window as any).gtag('event', 'game_promo_impression', {
      placement,
      variant,
      from_slug: fromSlug,
      to_slug: toSlug,
    });
  }, [dismissed, fromSlug, placement, toSlug, variant]);

  if (dismissed) {
    return null;
  }

  const promoUrl = buildPromoUrl(placement, variant);
  const content =
    variant === 'wait_time'
      ? {
          eyebrow: 'Bus wait companion',
          title: 'பஸ் வரைக்கும் ஒரு சொல்புதிர்?',
          body: 'காத்திருக்கிற நேரத்துக்கு தினசரி தமிழ் வார்த்தைப் புதிர்.',
          cta: 'Play Store-ல் திறக்க',
        }
      : {
          eyebrow: 'Daily Tamil puzzle',
          title: 'தினமும் ஒரு தமிழ் சொல்புதிர்',
          body: '2 நிமிஷத்தில் தொடங்கலாம். காத்திருக்கும்போது ஒரு சின்ன மூளை வேலை.',
          cta: 'விளையாடத் தொடங்கு',
        };

  function dismiss() {
    setDismissed(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1');

      if ((window as any).gtag) {
        (window as any).gtag('event', 'game_promo_dismiss', {
          placement,
          variant,
          from_slug: fromSlug,
          to_slug: toSlug,
        });
      }
    }
  }

  function trackClick() {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'game_promo_click', {
        placement,
        variant,
        from_slug: fromSlug,
        to_slug: toSlug,
      });
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            {content.eyebrow}
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            {content.title}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-neutral-700">
            {content.body}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={promoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={trackClick}
              className="inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              {content.cta}
            </a>
            <span className="text-xs text-neutral-500">
              இலவசம் • Android
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-amber-300 hover:text-neutral-900"
          aria-label="Dismiss Solputhir promo"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}
