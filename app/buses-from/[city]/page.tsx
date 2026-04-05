import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SearchForm } from '../../components/search-form';
import { Breadcrumb } from '../../components/breadcrumb';
import { toDisplayName } from '../../lib/bus-search';
import { getHubCities, getRoutesFromCity } from '../../lib/seo-routes';

export function generateStaticParams() {
  return getHubCities().map((city) => ({ city }));
}

type BusesFromPageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({
  params,
}: BusesFromPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = toDisplayName(city);
  const routes = getRoutesFromCity(city);
  const totalRoutes = routes.interCity.length + routes.cityBus.length;

  return {
    title: `Buses from ${cityName} — Routes to ${totalRoutes}+ Destinations (2026)`,
    description: `Find all bus routes from ${cityName} — TNSTC, SETC & MTC services to ${totalRoutes}+ destinations. Timings, stops, and intermediate stop search.`,
    alternates: {
      canonical: `/buses-from/${city}`,
    },
  };
}

export default async function BusesFromPage({ params }: BusesFromPageProps) {
  const { city } = await params;
  const cities = getHubCities();

  if (!cities.includes(city)) {
    notFound();
  }

  const cityName = toDisplayName(city);
  const routes = getRoutesFromCity(city);
  const totalRoutes = routes.interCity.length + routes.cityBus.length;

  if (totalRoutes === 0) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: `Buses from ${cityName}` },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Buses from {cityName}
            </h1>
            <p className="text-sm text-neutral-500">
              {totalRoutes} destinations &middot; TNSTC, SETC &amp; MTC services &middot; Updated 2026
            </p>
          </section>

          <SearchForm defaultFrom={cityName} />

          {routes.interCity.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                Inter-city bus routes from {cityName}
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {routes.interCity.map((route) => (
                  <li key={route.routeSlug}>
                    <Link
                      href={`/bus/${route.routeSlug}`}
                      className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                    >
                      {cityName} to {toDisplayName(route.toSlug)} bus timings
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {routes.cityBus.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold tracking-tight">
                City bus routes from {cityName}
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {routes.cityBus.map((route) => (
                  <li key={route.routeSlug}>
                    <Link
                      href={`/city-bus/${route.routeSlug}`}
                      className="text-sm text-brand-600 underline underline-offset-2 hover:text-brand-700"
                    >
                      {cityName} to {toDisplayName(route.toSlug)} bus routes
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
