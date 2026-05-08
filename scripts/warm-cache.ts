/**
 * Post-deploy cache warming script.
 *
 * Visits every SEO page so Vercel's ISR cache is pre-seeded. Pages already in
 * cache survive Supabase outages for up to 24h without any user-facing error.
 *
 * Usage:
 *   npx tsx scripts/warm-cache.ts                      # hits https://enbus.in
 *   BASE_URL=https://preview.vercel.app npx tsx scripts/warm-cache.ts
 *
 * Concurrency is capped at 10 to avoid hammering the API. Exits non-zero if
 * more than 5% of pages fail (useful in CI / deploy hooks).
 */

import { SEO_ROUTE_SLUGS, CITY_BUS_ROUTE_SLUGS, VIA_STOP_SLUGS, getHubCities } from '../app/lib/seo-routes.js';

const BASE_URL = process.env.BASE_URL ?? 'https://enbus.in';
const CONCURRENCY = 10;
const TIMEOUT_MS = 20_000;

const urls: string[] = [
  BASE_URL,
  ...SEO_ROUTE_SLUGS.map((s) => `${BASE_URL}/bus/${s}`),
  ...CITY_BUS_ROUTE_SLUGS.map((s) => `${BASE_URL}/city-bus/${s}`),
  ...VIA_STOP_SLUGS.map((s) => `${BASE_URL}/via/${s}`),
  ...getHubCities().map((c) => `${BASE_URL}/buses-from/${c}`),
];

console.log(`Warming ${urls.length} pages on ${BASE_URL} (concurrency=${CONCURRENCY})\n`);

let ok = 0;
let fail = 0;
const failures: string[] = [];

async function warm(url: string): Promise<void> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.ok) {
      ok++;
    } else {
      fail++;
      failures.push(`${res.status} ${url}`);
    }
  } catch (err) {
    fail++;
    failures.push(`ERR  ${url} — ${(err as Error).message}`);
  }
}

// Run in batches of CONCURRENCY
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(warm));
  const pct = Math.round(((i + batch.length) / urls.length) * 100);
  process.stdout.write(`\r  ${i + batch.length}/${urls.length} (${pct}%) — ${ok} ok, ${fail} failed`);
}

console.log('\n');

if (failures.length) {
  console.log('Failed pages:');
  failures.forEach((f) => console.log(' ', f));
  console.log();
}

const failRate = fail / urls.length;
console.log(`Done. ${ok} ok, ${fail} failed (${(failRate * 100).toFixed(1)}%)`);

if (failRate > 0.05) {
  console.error('FAIL: >5% of pages failed — something is wrong');
  process.exit(1);
}
