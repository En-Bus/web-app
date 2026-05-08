/**
 * Build-time fallback data generator.
 *
 * Fetches search results for every SEO slug and saves them as three JSON
 * files in data/fallback/. These files are committed to git so Vercel builds
 * never depend on the Supabase API being available.
 *
 * Usage:
 *   npx tsx scripts/build-fallback.ts                   # hits https://enbus.in
 *   BASE_URL=https://preview.vercel.app npx tsx scripts/build-fallback.ts
 *
 * Run this after any data pipeline update:
 *   npm run build:fallback && git add data/fallback/ && git commit -m "chore: refresh fallback data"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, VIA_STOP_SLUGS } from '../app/lib/seo-routes.js';
import { parseBusRouteSlug, slugToQuery } from '../app/lib/bus-search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? 'https://enbus.in';
const API_BASE = `${BASE_URL}/api` === `https://enbus.in/api`
  ? 'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api'
  : `${BASE_URL}/api`;

// Allow override for the Supabase Edge Function directly
const API_URL = process.env.API_URL ?? API_BASE;

const CONCURRENCY = Number(process.env.CONCURRENCY) || 5;
const TIMEOUT_MS = 20_000;
const OUT_DIR = path.join(__dirname, '..', 'data', 'fallback');

type AnyResult = Record<string, unknown>;

let ok = 0;
let fail = 0;

async function fetchJSON(url: string): Promise<AnyResult | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      fail++;
      process.stdout.write(` FAIL(${res.status})`);
      return null;
    }
    ok++;
    return (await res.json()) as AnyResult;
  } catch (err) {
    fail++;
    process.stdout.write(` ERR(${(err as Error).message.slice(0, 30)})`);
    return null;
  }
}

async function runBatch<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(fn));
    const pct = Math.round(((i + batch.length) / items.length) * 100);
    process.stdout.write(`\r  ${i + batch.length}/${items.length} (${pct}%) — ${ok} ok, ${fail} failed`);
  }
  console.log();
}

// ── Inter-city routes ────────────────────────────────────────────────────────

console.log(`\nFetching ${SEO_ROUTE_SLUGS.length} inter-city routes…`);
const interCity: Record<string, AnyResult> = {};
ok = 0; fail = 0;

await runBatch([...SEO_ROUTE_SLUGS], async (slug) => {
  const parsed = parseBusRouteSlug(slug);
  if (!parsed) return;
  const url = `${API_URL}/search?from=${encodeURIComponent(slugToQuery(parsed.fromSlug))}&to=${encodeURIComponent(slugToQuery(parsed.toSlug))}&type=inter-city`;
  const data = await fetchJSON(url);
  if (data) interCity[slug] = data;
});

// ── City-bus routes ──────────────────────────────────────────────────────────

console.log(`Fetching ${CITY_BUS_ROUTE_SLUGS.length} city-bus routes…`);
const cityBus: Record<string, AnyResult> = {};
ok = 0; fail = 0;

await runBatch([...CITY_BUS_ROUTE_SLUGS], async (slug) => {
  const parsed = parseBusRouteSlug(slug);
  if (!parsed) return;
  const url = `${API_URL}/search?from=${encodeURIComponent(slugToQuery(parsed.fromSlug))}&to=${encodeURIComponent(slugToQuery(parsed.toSlug))}&type=city`;
  const data = await fetchJSON(url);
  if (data) cityBus[slug] = data;
});

// ── Via stops ────────────────────────────────────────────────────────────────

console.log(`Fetching ${VIA_STOP_SLUGS.length} via stops…`);
const viaStops: Record<string, AnyResult> = {};
ok = 0; fail = 0;

await runBatch([...VIA_STOP_SLUGS], async (slug) => {
  const url = `${API_URL}/via-stops?stop=${encodeURIComponent(slugToQuery(slug))}`;
  const data = await fetchJSON(url);
  if (data) viaStops[slug] = data;
});

// ── Write output ─────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'inter-city.json'), JSON.stringify(interCity));
fs.writeFileSync(path.join(OUT_DIR, 'city-bus.json'), JSON.stringify(cityBus));
fs.writeFileSync(path.join(OUT_DIR, 'via.json'), JSON.stringify(viaStops));

const totalSlugs = SEO_ROUTE_SLUGS.length + CITY_BUS_ROUTE_SLUGS.length + VIA_STOP_SLUGS.length;
const totalFetched = Object.keys(interCity).length + Object.keys(cityBus).length + Object.keys(viaStops).length;
const totalFailed = totalSlugs - totalFetched;
const failRate = totalFailed / totalSlugs;

console.log(`\nWrote:`);
console.log(`  data/fallback/inter-city.json — ${Object.keys(interCity).length} routes`);
console.log(`  data/fallback/city-bus.json   — ${Object.keys(cityBus).length} routes`);
console.log(`  data/fallback/via.json        — ${Object.keys(viaStops).length} stops`);
console.log(`\nDone. ${totalFetched} fetched, ${totalFailed} failed (${(failRate * 100).toFixed(1)}%)`);

if (failRate > 0.05) {
  console.error('FAIL: >5% of slugs failed — check API availability');
  process.exit(1);
}
