import type { Metadata } from 'next';
import Link from 'next/link';

import { Breadcrumb } from '../components/breadcrumb';

export const metadata: Metadata = {
  title: 'About enbus.in — Tamil Nadu Bus Route Finder',
  description:
    'Learn how enbus.in works — data sources, intermediate stop search, and why we built a free bus route finder for Tamil Nadu.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'About' },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              About enbus.in
            </h1>
            <p className="text-base leading-7 text-neutral-600">
              A free, ad-free bus route finder built for Tamil Nadu travellers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Why enbus.in?
            </h2>
            <div className="space-y-3 text-sm leading-6 text-neutral-700">
              <p>
                Most bus search apps only match the origin and terminus of a
                route. If your town is a mid-route stop, those apps show zero
                results — even though a bus passes right through.
              </p>
              <p>
                enbus.in solves this by searching <strong>intermediate stops</strong>.
                We index every stop on every route, so you can find buses that
                pick up or drop off at any point along the way.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Our data
            </h2>
            <div className="space-y-3 text-sm leading-6 text-neutral-700">
              <p>
                We aggregate timetable and route data from official Tamil Nadu
                government transit sources:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>TNSTC</strong> — Tamil Nadu State Transport Corporation
                  (mofussil and town buses across all divisions)
                </li>
                <li>
                  <strong>SETC</strong> — State Express Transport Corporation
                  (long-distance inter-city services)
                </li>
                <li>
                  <strong>MTC</strong> — Metropolitan Transport Corporation
                  (Chennai city buses)
                </li>
              </ul>
              <p>
                Our database currently covers <strong>2,200+ stops</strong>,{' '}
                <strong>93,000+ trips</strong>, and <strong>3 agencies</strong>{' '}
                (TNSTC, SETC, MTC) across Tamil Nadu.
              </p>
              <p>
                Timetables are indicative and sourced from published schedules.
                Actual timings may vary due to traffic, weather, or operational
                changes.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              How it works
            </h2>
            <div className="space-y-3 text-sm leading-6 text-neutral-700">
              <p>
                We collect published timetables and route data, normalize stop
                names using alias matching (so &ldquo;T.Nagar&rdquo; matches
                &ldquo;Thyagaraya Nagar&rdquo;), and index every stop on every
                trip.
              </p>
              <p>
                When you search, we find all trips where your origin and
                destination appear as stops — in the correct order — regardless
                of whether they are the first or last stop on the route.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">
              Free and open
            </h2>
            <div className="space-y-3 text-sm leading-6 text-neutral-700">
              <p>
                enbus.in is free to use with no ads, no booking fees, and no
                account required. We believe public transit information should be
                accessible to everyone.
              </p>
            </div>
          </section>

          <div className="border-t border-neutral-200 pt-6">
            <p className="text-sm text-neutral-500">
              Have feedback or found incorrect data?{' '}
              <Link
                href="/search"
                className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
              >
                Search for your route
              </Link>{' '}
              and use the feedback button on the results page.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
