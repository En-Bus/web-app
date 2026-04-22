# Sitemap Expansion Roadmap

## Why gradual?

Going from ~572 to 3,000+ URLs overnight risks triggering Google's auto-generated content
quality review for low-authority domains. Gradual expansion lets Googlebot digest and index
pages before the next batch arrives, building a track record of quality pages.

Rule of thumb: wait until indexed/discovered ratio > 50% before the next batch.

---

## Phase 3 launch date: ___________ (fill in when deployed)

---

## Schedule

### Week 0 — Phase 3 launch (LIMIT: 2000)
- [ ] DB-driven sitemap goes live (`/sitemap-routes` endpoint, LIMIT 2000)
- [ ] Priority tier: `seo-routes.ts` slugs (daily frequency, priority 0.8)
- [ ] Secondary tier: DB routes (weekly frequency, priority 0.6)
- [ ] Submit updated sitemap to Google Search Console
- Target: impressions should start rising within 2–3 weeks

### Week 3 — Check GSC Coverage report
- [ ] Open Search Console → Coverage → "Discovered - currently not indexed"
- [ ] If indexed / (indexed + discovered-not-indexed) > 50% → proceed to LIMIT 3000
- [ ] If ratio < 30% → hold at LIMIT 2000 for 2 more weeks

### Week 4–6 — Raise LIMIT to 3000
- [ ] Edit `backend/supabase/functions/api/index.ts` → `/sitemap-routes` → change `LIMIT 2000` to `LIMIT 3000`
- [ ] `npx supabase functions deploy api --project-ref hopivdsbzzfklohyllut`
- [ ] Resubmit sitemap in GSC (Sitemaps tab → Resubmit)

### Week 8 — Raise LIMIT to 5000 (if GSC healthy)
- [ ] Same process — check ratio first, then raise
- [ ] Goal: cover all inter-city pairs with ≥3 trips

### Week 12+ — City-bus expansion
- [ ] Lower city-bus threshold in `/sitemap-routes` from ≥5 to ≥3 trips
- [ ] Only after inter-city rollout is stable
- [ ] MTC routes are more numerous and potentially thinner — monitor closely

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
