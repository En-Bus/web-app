# Sitemap Expansion Roadmap

## Why gradual?

Going from ~572 to 3,000+ URLs overnight risks triggering Google's auto-generated content
quality review for low-authority domains. Gradual expansion lets Googlebot digest and index
pages before the next batch arrives, building a track record of quality pages.

Rule of thumb: wait until indexed/discovered ratio > 50% before the next batch.

---

## Phase 3 launch date: 2026-04-22

---

## Schedule

### 2026-04-22 — Week 0: Phase 3 live (LIMIT: 2000) ✅
- [x] DB-driven sitemap deployed (`/sitemap-routes` endpoint, LIMIT 2000)
- [x] Priority tier: `seo-routes.ts` slugs (daily frequency, priority 0.8)
- [x] Secondary tier: DB routes (weekly frequency, priority 0.6)
- [ ] Submit updated sitemap to Google Search Console
- Sitemap will expand from 572 → ~2,500 URLs on next daily revalidation
- Target: impressions should start rising by 2026-05-13

### 2026-05-13 — Week 3: Check GSC Coverage report
- [ ] Open Search Console → Coverage → "Discovered - currently not indexed"
- [ ] If indexed / (indexed + discovered-not-indexed) > 50% → proceed to LIMIT 3000
- [ ] If ratio < 30% → hold at LIMIT 2000, recheck on 2026-05-27

### 2026-05-27 — Week 5: Raise LIMIT to 3000 (if GSC ratio > 50%)
- [ ] Edit `backend/supabase/functions/api/index.ts` → `/sitemap-routes` → change `LIMIT 2000` to `LIMIT 3000`
- [ ] `npx supabase functions deploy api --project-ref hopivdsbzzfklohyllut`
- [ ] Resubmit sitemap in GSC (Sitemaps tab → Resubmit)

### 2026-06-17 — Week 8: Raise LIMIT to 5000 (if GSC still healthy)
- [ ] Check GSC ratio again before raising
- [ ] Goal: cover all inter-city pairs with ≥3 trips
- [ ] Change LIMIT to 5000, deploy, resubmit

### 2026-07-15 — Week 12: City-bus threshold expansion
- [ ] Lower city-bus threshold in `/sitemap-routes` SQL from `>= 3` for inter-city and `>= 5` for city to `>= 3` for both
- [ ] Only proceed if inter-city rollout is stable (position not dropping, crawl ratio healthy)
- [ ] MTC routes are more numerous and potentially thinner — monitor weekly after this

### 2026-04-28 — Via-stop expansion (pulled forward from Oct) ✅
- [x] Added 16 new via-stop pages from tickettogetlost data (22 → 38 stops)
- [x] Added 46 new SEO route slugs from TTL/tndata (new origins: rajapalayam, virudhunagar, kanchipuram, gobichettipalayam, batlagundu, chidambaram, cumbum, edappadi + expanded thanjavur/tirunelveli/dindigul)
- [x] Added /bus/[route] → /via/[stop] internal links (stops-on-route section now links to via pages)

### 2026-10-01 — Quarter 3: Next via-stop and hub city audit
- [ ] Run via-stop candidate query (see below) — add new stops crossing ≥20 appearances
- [ ] Run hub city query (see below) — add cities with ≥10 destinations
- [ ] Update `VIA_STOP_SLUGS` and hub logic in `web-app/app/lib/seo-routes.ts`

---

## How to raise the LIMIT

Edit `backend/supabase/functions/api/index.ts`, find the `/sitemap-routes` handler:

```sql
HAVING COUNT(DISTINCT t.trip_id) >= 3
ORDER BY trip_count DESC
LIMIT 2000   ← change this number
```

Deploy: `npx supabase functions deploy api --project-ref hopivdsbzzfklohyllut`

The web-app sitemap picks up changes on next daily revalidation (no redeploy needed).

---

## Signals to watch monthly

| Signal | Meaning | Action |
|--------|---------|--------|
| Impressions rising + indexed pages rising proportionally | ✅ Healthy growth | Continue rollout |
| "Crawled - not indexed" climbing fast | ⚠️ Google doesn't like quality | Hold expansion, raise threshold |
| Avg position dropping for good pages | 🔴 Thin pages dragging domain | Raise threshold to ≥5 trips |
| Indexed / (indexed + not-indexed) < 30% | ⚠️ Google busy/skeptical | Slow down |

---

## Via-stop expansion (separate track)

Run this DB query quarterly to find new `/via/[stop]` candidates:

```sql
SELECT stop_id, COUNT(*) as appearances
FROM stop_times
WHERE stop_sequence > 1
GROUP BY stop_id
HAVING COUNT(*) >= 20
ORDER BY appearances DESC
LIMIT 50;
```

Add qualifying stops to `VIA_STOP_SLUGS` in `web-app/app/lib/seo-routes.ts`.

---

## Hub city expansion

Run this to find cities ready for `/buses-from/[city]` pages:

```sql
SELECT origin_stop, COUNT(DISTINCT dest_stop) as destinations
FROM routes
GROUP BY origin_stop
HAVING COUNT(DISTINCT dest_stop) >= 10
ORDER BY destinations DESC;
```

Add qualifying cities to `getHubCities()` logic in `web-app/app/lib/seo-routes.ts`.
