import type { MetadataRoute } from 'next';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, VIA_STOP_SLUGS, getHubCities } from './lib/seo-routes';
import { SITE_URL } from './lib/site-url';

const API_BASE =
  process.env.SEARCH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

export const revalidate = 86400;

type SitemapRoute = { from: string; to: string; type: 'inter-city' | 'city' };

async function fetchDBRoutes(): Promise<SitemapRoute[]> {
  try {
    const res = await fetch(`${API_BASE}/sitemap-routes`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    return (await res.json()) as SitemapRoute[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 0.5, lastModified },
    { url: `${SITE_URL}/bus`, changeFrequency: 'weekly', priority: 0.5, lastModified },
    { url: `${SITE_URL}/city-bus`, changeFrequency: 'weekly', priority: 0.5, lastModified },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5, lastModified },
    { url: `${SITE_URL}/contribute`, changeFrequency: 'monthly', priority: 0.4, lastModified },
  ];

  // Hub pages
  for (const city of getHubCities()) {
    staticUrls.push({ url: `${SITE_URL}/buses-from/${city}`, changeFrequency: 'weekly', priority: 0.7, lastModified });
  }

  // Priority tier: manually curated slugs (daily, high priority — always pre-built)
  const curatedSet = new Set<string>();
  for (const route of SEO_ROUTE_SLUGS) {
    staticUrls.push({ url: `${SITE_URL}/bus/${route}`, changeFrequency: 'daily', priority: 0.8, lastModified });
    curatedSet.add(`inter-city:${route}`);
  }
  for (const route of CITY_BUS_ROUTE_SLUGS) {
    staticUrls.push({ url: `${SITE_URL}/city-bus/${route}`, changeFrequency: 'daily', priority: 0.6, lastModified });
    curatedSet.add(`city:${route}`);
  }

  // Via-stop pages
  for (const stop of VIA_STOP_SLUGS) {
    staticUrls.push({ url: `${SITE_URL}/via/${stop}`, changeFrequency: 'weekly', priority: 0.7, lastModified });
  }

  // Secondary tier: DB-sourced routes not already in curated list
  const dbRoutes = await fetchDBRoutes();
  for (const r of dbRoutes) {
    const slug = `${r.from}-to-${r.to}`;
    const key = `${r.type}:${slug}`;
    if (curatedSet.has(key)) continue;
    const urlPath = r.type === 'city' ? `/city-bus/${slug}` : `/bus/${slug}`;
    staticUrls.push({ url: `${SITE_URL}${urlPath}`, changeFrequency: 'weekly', priority: 0.6, lastModified });
  }

  return staticUrls;
}
