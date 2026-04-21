import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '../../components/breadcrumb';
import { FAQJsonLd } from '../../components/json-ld';
import { fetchViaStops, to12h, toDisplayName, normalizeSlug } from '../../lib/bus-search';
import { VIA_STOP_SLUGS, SEO_ROUTE_SLUGS } from '../../lib/seo-routes';

export function generateStaticParams() {
  return VIA_STOP_SLUGS.map((stop) => ({ stop }));
}

type ViaStopPageProps = {
  params: Promise<{ stop: string }>;
};

export async function generateMetadata({ params }: ViaStopPageProps): Promise<Metadata> {
  const { stop } = await params;
  const stopName = toDisplayName(stop);
  const year = new Date().getFullYear();
  return {
    title: `Buses passing through ${stopName} — Tamil Nadu Bus Routes (${year})`,
    description: `Find all TNSTC and SETC buses that pass through ${stopName} with departure times, origin, and destination. Updated ${year}.`,
    alternates: { canonical: `/via/${stop}` },
    openGraph: {
      title: `Buses via ${stopName} — TNSTC & SETC Routes`,
      description: `All Tamil Nadu government buses passing through ${stopName} with timings.`,
    },
  };
}

function formatTime(time: string | null | undefined): string {
  return to12h(time);
}

function titleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

function buildRouteSlug(origin: string, destination: string): string {
  const from = normalizeSlug(origin);
  const to = normalizeSlug(destination);
  return `${from}-to-${to}`;
}

function hasRouteSlug(slug: string): boolean {
  return (SEO_ROUTE_SLUGS as readonly string[]).includes(slug);
}

export default async function ViaStopPage({ params }: ViaStopPageProps) {
  const { stop } = await params;
  const stopName = toDisplayName(stop);
  const year = new Date().getFullYear();

  const { data, error } = await fetchViaStops(stop);

  if (error || !data || data.count === 0) {
    notFound();
  }

  const results = data.results;
  const count = data.count;

  // Count unique origin→destination pairs
  const uniqueRoutes = new Set(results.map((r) => `${r.origin}|${r.destination}`)).size;

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: `Via ${stopName}` },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">

          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Buses passing through {stopName}
            </h1>
            <p className="text-sm text-neutral-500">
              {count} bus{count !== 1 ? 'es' : ''} on {uniqueRoutes} route{uniqueRoutes !== 1 ? 's' : ''} stop at {stopName} &middot; TNSTC &amp; SETC &middot; Updated {year}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Bus timetable via {stopName}</h2>
            <ul className="space-y-2">
              {results.map((r) => {
                const originDisplay = titleCase(r.origin);
                const destDisplay = titleCase(r.destination);
                const routeSlug = buildRouteSlug(r.origin, r.destination);
                const hasPage = hasRouteSlug(routeSlug);
                const viaTime = formatTime(r.via_time);
                const originTime = formatTime(r.origin_time);

                return (
                  <li
                    key={r.trip_id}
                    className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-medium text-neutral-900">
                          {hasPage ? (
                            <Link
                              href={`/bus/${routeSlug}`}
                              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                            >
                              {originDisplay}
                            </Link>
                          ) : (
                            <span>{originDisplay}</span>
                          )}
                          <span aria-hidden="true" className="text-neutral-400">→</span>
                          <span className="font-semibold text-neutral-700">{stopName}</span>
                          <span aria-hidden="true" className="text-neutral-400">→</span>
                          <span>{destDisplay}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-neutral-500">
                          {originTime ? <span>Dep {originTime}</span> : null}
                          {viaTime ? (
                            <span className="font-medium text-neutral-700">
                              via {stopName} {viaTime}
                            </span>
                          ) : null}
                          <span>Route {r.route_no}</span>
                        </div>
                      </div>
                      {r.service_type ? (
                        <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                          {r.service_type}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <h2 className="text-lg font-semibold tracking-tight">
              About buses via {stopName}
            </h2>
            <div className="space-y-2 text-sm leading-6 text-neutral-700">
              <p>
                {count} TNSTC and SETC government buses have {stopName} as an intermediate stop on
                their route. These buses connect {uniqueRoutes} different origin–destination pairs,
                making {stopName} a key transit point for Tamil Nadu inter-city travel.
              </p>
              <p>
                enbus.in is the only site that lets you search for buses by intermediate stop.
                If you need to board or alight at {stopName} mid-route, use the search box above
                to find buses between any two cities that pass through {stopName}.
              </p>
            </div>
          </section>

          <FAQJsonLd
            questions={[
              {
                question: `How many buses pass through ${stopName}?`,
                answer: `${count} TNSTC and SETC buses stop at ${stopName} as an intermediate point, covering ${uniqueRoutes} different routes.`,
              },
              {
                question: `Can I board a bus at ${stopName} mid-route?`,
                answer: `Yes. Many TNSTC and SETC long-distance buses stop at ${stopName} even if it is not the origin or terminus. You can board at ${stopName} on any bus that passes through it.`,
              },
              {
                question: `Which routes pass through ${stopName}?`,
                answer: `${count} buses across ${uniqueRoutes} routes pass through ${stopName}. These include services from major cities like Chennai, Madurai, Coimbatore, Salem, and more.`,
              },
              {
                question: `How do I find buses via ${stopName} to a specific destination?`,
                answer: `Use the enbus.in search and enter your origin and destination. The search matches intermediate stops, so buses stopping at ${stopName} will appear even if ${stopName} is not the final stop.`,
              },
            ]}
          />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Search buses through {stopName}</h2>
            <p className="text-sm text-neutral-600">
              Find buses from any city that pass through {stopName} on enbus.in — the only Tamil Nadu
              bus finder that searches intermediate stops.
            </p>
            <Link
              href="/"
              className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Search buses
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
