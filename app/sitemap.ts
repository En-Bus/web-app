import type { MetadataRoute } from 'next';
import { SEO_ROUTE_SLUGS } from './lib/seo-routes';
import { SITE_URL } from './lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  for (const route of SEO_ROUTE_SLUGS) {
    urls.push({
      url: `${SITE_URL}/bus/${route}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  return urls;
}
