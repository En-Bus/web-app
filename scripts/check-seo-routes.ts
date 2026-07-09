#!/usr/bin/env tsx
/**
 * check-seo-routes.ts
 *
 * Validates every slug in SEO_ROUTE_SLUGS and CITY_BUS_ROUTE_SLUGS
 * returns at least 3 results (matches the page's notFound threshold).
 *
 * DEFAULT: Validates against committed fallback data (data/fallback/*.json) — zero network calls.
 * This is what the pre-push hook runs.
 *
 * --live: Validates against the live production API. Use manually after regenerating fallback data
 * to confirm the fallback snapshots are accurate. Example:
 *   npm run build:fallback  # regenerate from live API
 *   npm run check:routes:live  # verify the freshly-generated snapshots
 *
 * Run:  npx tsx scripts/check-seo-routes.ts [--live]
 * Hook: installed as a pre-push git hook; runs in default (local) mode to prevent broken routes shipping
 *
 * Exit 1 if any routes return fewer than 3 results (would 404 in production).
 */

import * as fs from 'fs';
import * as path from 'path';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, VIA_STOP_SLUGS } from '../app/lib/seo-routes.ts';

const USE_LIVE = process.argv.includes('--live');
const API_BASE = USE_LIVE
  ? (process.env.CHECK_API_BASE_URL ??
      process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
      'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api')
  : '';

const FALLBACK_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/fallback');
const CONCURRENCY = 3;
const DELAY_MS = 300;

type FallbackData = Record<string, { results?: unknown[] }>;

let fallbackData: {
  interCity: FallbackData;
  cityBus: FallbackData;
  via: FallbackData;
} = { interCity: {}, cityBus: {}, via: {} };

function loadFallbackData() {
  if (USE_LIVE) return;

  try {
    const interCityPath = path.join(FALLBACK_DIR, 'inter-city.json');
    const cityBusPath = path.join(FALLBACK_DIR, 'city-bus.json');
    const viaPath = path.join(FALLBACK_DIR, 'via.json');

    if (!fs.existsSync(interCityPath)) throw new Error(`Missing ${interCityPath}`);
    if (!fs.existsSync(cityBusPath)) throw new Error(`Missing ${cityBusPath}`);
    if (!fs.existsSync(viaPath)) throw new Error(`Missing ${viaPath}`);

    fallbackData.interCity = JSON.parse(fs.readFileSync(interCityPath, 'utf-8')) as FallbackData;
    fallbackData.cityBus = JSON.parse(fs.readFileSync(cityBusPath, 'utf-8')) as FallbackData;
    fallbackData.via = JSON.parse(fs.readFileSync(viaPath, 'utf-8')) as FallbackData;
  } catch (err) {
    console.error('Failed to load fallback data:', err);
    process.exit(1);
  }
}

async function checkSlugLive(slug: string, type: 'inter-city' | 'city'): Promise<boolean> {
  const from = slug.split('-to-')[0]?.replace(/-+/g, ' ').trim();
  const to = slug.split('-to-')[1]?.replace(/-+/g, ' ').trim();
  if (!from || !to) return false;

  const params = new URLSearchParams({ from, to, type, time: '00:00' });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/search?${params}`, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        if (attempt === 0) await new Promise((r) => setTimeout(r, 2_000));
        continue;
      }
      const data = (await res.json()) as { count?: number; results?: unknown[] };
      return (data.count ?? data.results?.length ?? 0) >= 3;
    } catch {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 2_000));
    }
  }
  return false;
}

function checkSlugLocal(slug: string, type: 'inter-city' | 'city'): boolean {
  const data = type === 'city' ? fallbackData.cityBus : fallbackData.interCity;
  const entry = data[slug];
  if (!entry) return false;
  return (entry.results?.length ?? 0) >= 3;
}

async function checkSlug(slug: string, type: 'inter-city' | 'city'): Promise<boolean> {
  return USE_LIVE ? checkSlugLive(slug, type) : checkSlugLocal(slug, type);
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

async function checkViaSlugLive(slug: string): Promise<boolean> {
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

function checkViaSlugLocal(slug: string): boolean {
  const entry = fallbackData.via[slug];
  if (!entry) return false;
  return (entry.results?.length ?? 0) > 0;
}

async function checkViaSlug(slug: string): Promise<boolean> {
  return USE_LIVE ? checkViaSlugLive(slug) : checkViaSlugLocal(slug);
}

async function main() {
  loadFallbackData();

  const interCitySlugs = [...SEO_ROUTE_SLUGS];
  const cityBusSlugs = [...CITY_BUS_ROUTE_SLUGS];
  const viaStopSlugs = [...VIA_STOP_SLUGS];
  const total = interCitySlugs.length + cityBusSlugs.length + viaStopSlugs.length;

  const mode = USE_LIVE ? 'live API' : 'local fallback data';
  console.log(`Checking ${interCitySlugs.length} inter-city + ${cityBusSlugs.length} city bus + ${viaStopSlugs.length} via-stop routes...`);
  console.log(`Source: ${mode}\n`);

  const broken: string[] = [];
  let checked = 0;

  const checkAndReport = (type: 'inter-city' | 'city') => async (slug: string) => {
    const ok = await checkSlug(slug, type);
    checked++;
    if (!ok) {
      broken.push(`/${type === 'city' ? 'city-bus' : 'bus'}/${slug}`);
      process.stdout.write(`  FAIL: /${type === 'city' ? 'city-bus' : 'bus'}/${slug}\n`);
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
