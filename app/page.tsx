import Link from 'next/link';

import { SearchForm } from './components/search-form';
import { PreLaunch } from './components/pre-launch';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS } from './lib/seo-routes';
import { parseBusRouteSlug, toDisplayName } from './lib/bus-search';

// High-impression routes from Search Console — drives homepage quick-links
const TRENDING_ROUTES = [
  { href: '/bus/dindigul-to-trichy', label: 'Dindigul → Trichy' },
  { href: '/bus/chennai-to-salem', label: 'Chennai → Salem' },
  { href: '/bus/chennai-to-coimbatore', label: 'Chennai → Coimbatore' },
  { href: '/bus/chennai-to-madurai', label: 'Chennai → Madurai' },
  { href: '/bus/chennai-to-trichy', label: 'Chennai → Trichy' },
  { href: '/bus/dindigul-to-erode', label: 'Dindigul → Erode' },
  { href: '/bus/trichy-to-salem', label: 'Trichy → Salem' },
  { href: '/bus/bangalore-to-chennai', label: 'Bangalore → Chennai' },
  { href: '/bus/chennai-to-tirunelveli', label: 'Chennai → Tirunelveli' },
];

const SUPABASE_URL = 'https://hopivdsbzzfklohyllut.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcGl2ZHNienpma2xvaHlsbHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYwMTEsImV4cCI6MjA5MDExMjAxMX0.UWJcu75b-JAEXdMirzeng14n9lPNY8s0zMkcGNzzTBM';

async function isLaunched(): Promise<boolean> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_config?key=eq.launched&select=value`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: 'no-store',
      },
    );
    const data = await res.json();
    return data?.[0]?.value === 'true';
  } catch {
    return true;
  }
}

function buildRouteLinks(
  slugs: readonly string[],
  prefix: string,
  labelSuffix: string,
  count: number,
) {
  return slugs
    .slice(0, count)
    .map((routeSlug) => {
      const parsed = parseBusRouteSlug(routeSlug);
      if (!parsed) return null;
      return {
        href: `${prefix}/${routeSlug}`,
        label: `${toDisplayName(parsed.fromSlug)} to ${toDisplayName(parsed.toSlug)} ${labelSuffix}`,
      };
    })
    .filter(Boolean) as { href: string; label: string }[];
}

export default async function HomePage() {
  const launched = await isLaunched();
  if (!launched) {
    return <PreLaunch />;
  }
  const interCityRoutes = buildRouteLinks(
    SEO_ROUTE_SLUGS,
    '/bus',
    'bus timings',
    8,
  );
  const cityBusRoutes = buildRouteLinks(
    CITY_BUS_ROUTE_SLUGS,
    '/city-bus',
    'bus routes',
    8,
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-10">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tamil Nadu Bus Routes &amp; Timings
          </h1>
          <p className="text-base leading-7 text-neutral-600">
            Search TNSTC, SETC, and MTC buses across Tamil Nadu and Chennai
            — including intermediate stops that other apps miss.
          </p>
        </section>

        <SearchForm />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Search buses from
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Chennai',
              'Madurai',
              'Coimbatore',
              'Trichy',
              'Salem',
              'Tirunelveli',
              'Erode',
              'Bangalore',
            ].map((city) => (
              <Link
                key={city}
                href={`/buses-from/${city.toLowerCase()}`}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm hover:bg-brand-50 hover:border-brand-300"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
          <span>2,500+ stops</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>100,000+ trips</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>TNSTC, SETC &amp; MTC</span>
          <span aria-hidden="true" className="text-neutral-300">&middot;</span>
          <span>Free, no ads</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Trending bus routes
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TRENDING_ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-sm font-medium text-neutral-800 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular inter-city bus routes
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {interCityRoutes.map((route) => (
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

        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Popular Chennai city bus routes
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cityBusRoutes.map((route) => (
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
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-2xl" aria-hidden="true">1</div>
              <h3 className="mt-1 text-sm font-semibold">Search</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Enter your origin and destination. We search intermediate stops
                too, not just terminals.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-2xl" aria-hidden="true">2</div>
              <h3 className="mt-1 text-sm font-semibold">Compare</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                See all matching buses with timings, route numbers, and the
                exact stops where you board and alight.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-2xl" aria-hidden="true">3</div>
              <h3 className="mt-1 text-sm font-semibold">Travel</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-600">
                Pick the best bus for your schedule. No account needed,
                no booking fees — just information.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
