import { SITE_URL } from '../lib/site-url';

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'enbus.in',
        url: SITE_URL,
        description:
          'Search Tamil Nadu bus routes with intermediate stop support. Find TNSTC, SETC, and MTC buses.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?from={from}&to={to}`,
          },
          'query-input': [
            'required name=from',
            'required name=to',
          ],
        },
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'enbus.in',
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        description:
          'Tamil Nadu bus route finder with intermediate stop search support.',
      }}
    />
  );
}

export type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
      }}
    />
  );
}

export type BusTripData = {
  routeNo: string;
  serviceType: string | null;
  boardStop: string;
  alightStop: string;
  departsAt: string | null;
};

export function BusTripsJsonLd({
  trips,
  fromName,
  toName,
}: {
  trips: BusTripData[];
  fromName: string;
  toName: string;
}) {
  if (trips.length === 0) return null;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Buses from ${fromName} to ${toName}`,
        numberOfItems: trips.length,
        itemListElement: trips.slice(0, 20).map((trip, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'BusTrip',
            name: `${trip.routeNo}${trip.serviceType ? ` (${trip.serviceType})` : ''} — ${fromName} to ${toName}`,
            departureBusStop: {
              '@type': 'BusStop',
              name: trip.boardStop,
            },
            arrivalBusStop: {
              '@type': 'BusStop',
              name: trip.alightStop,
            },
            ...(trip.departsAt ? { departureTime: trip.departsAt } : {}),
            busName: trip.routeNo,
            provider: {
              '@type': 'Organization',
              name: 'TNSTC',
            },
          },
        })),
      }}
    />
  );
}

export function BusRouteJsonLd({
  fromName,
  toName,
  resultCount,
  firstBusTime,
  lastBusTime,
  serviceTypes,
}: {
  fromName: string;
  toName: string;
  resultCount: number;
  firstBusTime: string | null;
  lastBusTime: string | null;
  serviceTypes: string[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BusRoute',
        name: `${fromName} to ${toName} Bus`,
        alternateName: `${fromName} ${toName} bus timings`,
        description: `${resultCount} TNSTC and SETC government buses from ${fromName} to ${toName}. ${serviceTypes.length ? `Service types: ${serviceTypes.join(', ')}.` : ''}`,
        provider: {
          '@type': 'Organization',
          name: 'Tamil Nadu State Transport Corporation (TNSTC)',
          url: 'https://www.tnstc.in',
        },
        departureBusStop: {
          '@type': 'BusStop',
          name: fromName,
          address: { '@type': 'PostalAddress', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
        },
        arrivalBusStop: {
          '@type': 'BusStop',
          name: toName,
          address: { '@type': 'PostalAddress', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
        },
        ...(firstBusTime ? { departureTime: firstBusTime } : {}),
        ...(lastBusTime ? { arrivalTime: lastBusTime } : {}),
      }}
    />
  );
}

export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  );
}
