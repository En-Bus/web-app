import type { MetadataRoute } from 'next';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, getHubCities } from './lib/seo-routes';
import { SITE_URL } from './lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/bus`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/city-bus`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Hub pages — /buses-from/[city]
  for (const city of getHubCities()) {
    urls.push({
      url: `${SITE_URL}/buses-from/${city}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Inter-city route pages
  for (const route of SEO_ROUTE_SLUGS) {
    urls.push({
      url: `${SITE_URL}/bus/${route}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  // City bus route pages
  for (const route of CITY_BUS_ROUTE_SLUGS) {
    urls.push({
      url: `${SITE_URL}/city-bus/${route}`,
      changeFrequency: 'daily',
      priority: 0.7,
    });
  }

  return urls;
}
