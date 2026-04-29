#!/usr/bin/env tsx
/**
 * check-seo-routes.ts
 *
 * Validates every slug in SEO_ROUTE_SLUGS and CITY_BUS_ROUTE_SLUGS
 * returns at least 3 results from the search API (matches the page's notFound threshold).
 *
 * Exit 1 if any routes return fewer than 3 results (would 404 on production).
 *
 * Run:  npx tsx scripts/check-seo-routes.ts
 * Hook: installed as a pre-push git hook to prevent broken routes shipping
 *
 * Uses the production API by default; override with CHECK_API_BASE_URL env var.
 */

import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, VIA_STOP_SLUGS } from '../app/lib/seo-routes.ts';

const API_BASE =
  process.env.CHECK_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

const CONCURRENCY = 8;
const DELAY_MS = 50; // be polite to the API

function slugToQuery(slug: string): string {
  return slug.replace(/-+/g, ' ').trim();
}

function parseBusRouteSlug(slug: string): { from: string; to: string } | null {
  const parts = slug.split('-to-');
  if (parts.length !== 2) return null;
  const from = slugToQuery(parts[0] ?? '');
  const to = slugToQuery(parts[1] ?? '');
  if (!from || !to) return null;
  return { from, to };
}

async function checkSlug(slug: string, type: 'inter-city' | 'city'): Promise<boolean> {
  const parsed = parseBusRouteSlug(slug);
  if (!parsed) return false;

  const params = new URLSearchParams({ from: parsed.from, to: parsed.to, type });
  try {
    const res = await fetch(`${API_BASE}/search?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { count?: number; results?: unknown[] };
    return (data.count ?? data.results?.length ?? 0) >= 3;
  } catch {
    return false;
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
      if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  });
  await Promise.all(workers);
}

async function checkViaSlug(slug: string): Promise<boolean> {
  const stopName = slug.replace(/-+/g, ' ').trim();
  const params = new URLSearchParams({ stop: stopName });
  try {
    const res = await fetch(`${API_BASE}/via-stops?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { count?: number };
    return (data.count ?? 0) > 0;
  } catch {
    return false;
  }
}

async function main() {
  const interCitySlugs = [...SEO_ROUTE_SLUGS];
  const cityBusSlugs = [...CITY_BUS_ROUTE_SLUGS];
  const viaStopSlugs = [...VIA_STOP_SLUGS];
  const total = interCitySlugs.length + cityBusSlugs.length + viaStopSlugs.length;

  console.log(`Checking ${interCitySlugs.length} inter-city + ${cityBusSlugs.length} city bus + ${viaStopSlugs.length} via-stop routes...`);
  console.log(`API: ${API_BASE}\n`);

  const broken: string[] = [];
  let checked = 0;

  const checkAndReport = (type: 'inter-city' | 'city') => async (slug: string) => {
    const ok = await checkSlug(slug, type);
    checked++;
    if (!ok) {
      broken.push(`/${type === 'city' ? 'city-bus' : 'bus'}/${slug}`);
      process.stdout.write(`  FAIL: /bus/${slug}\n`);
    } else {
      process.stdout.write(`  [${checked}/${total}] OK: ${slug}\r`);
    }
  };

  const checkViaAndReport = async (slug: string) => {
    const ok = await checkViaSlug(slug);
    checked++;
    if (!ok) {
      broken.push(`/via/${slug}`);
      process.stdout.write(`  FAIL: /via/${slug}\n`);
    } else {
      process.stdout.write(`  [${checked}/${total}] OK: via/${slug}\r`);
    }
  };

  await runWithConcurrency(interCitySlugs, CONCURRENCY, checkAndReport('inter-city'));
  await runWithConcurrency(cityBusSlugs, CONCURRENCY, checkAndReport('city'));
  await runWithConcurrency(viaStopSlugs, CONCURRENCY, checkViaAndReport);

  console.log(`\n\nChecked ${checked}/${total} routes.`);

  if (broken.length > 0) {
    console.error(`\n❌ ${broken.length} route(s) return fewer than 3 results and will 404 in production:`);
    for (const route of broken) {
      console.error(`   ${route}`);
    }
    console.error('\nRemove these from seo-routes.ts before pushing.\n');
    process.exit(1);
  } else {
    console.log(`✅ All ${total} routes return results. Safe to deploy.`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
