# Cloudflare CDN Migration (July 2026)

## Problem
Vercel free tier hit 100% quota on Edge Requests (1M/mo limit). Organic traffic growth from ~600 pageviews/day (early June) to ~1000-1300/day (early July) exhausted the free allowance. Quota resets July 7 but will recur monthly, requiring a permanent solution.

## Solution
Fronted enbus.in with Cloudflare's free plan to cache static assets and pages at Cloudflare's edge, preventing repeat requests from hitting Vercel's Edge Requests counter.

## Implementation (Completed July 7, 2026)

### 1. Cloudflare Zone Setup
- **Zone**: enbus.in
- **Plan**: Free
- **Zone ID**: 642f0880db663badf5265a1bc44bce1d
- **Account ID**: 82d5389fc80cfad78646a94839c365e9
- **Nameservers**: ace.ns.cloudflare.com, paige.ns.cloudflare.com (switched at Namecheap registrar, propagated successfully)

### 2. DNS Records (Recreated in Cloudflare)
| Record | Type | Value | Proxied | Notes |
|--------|------|-------|---------|-------|
| @ | A | 76.76.21.21 | Yes | Vercel anycast IP |
| www | CNAME | cname.vercel-dns.com | Yes | Vercel apex |
| @ | MX x5 | eforward1-5.registrar-servers.com | No (DNS only) | Registrar email forwarding |
| @ | TXT | v=spf1 include:spf.efwd.registrar-servers.com ~all | No | SPF for email forwarding |
| @ | TXT | google-site-verification=OW2Eg1FGUgEOAb34PoNM7hmGi4P0LhJNKQJS7bOPFOI | No | Search Console ownership |

### 3. SSL/TLS
- Mode: **Full (strict)** — Vercel already serves valid TLS, no cert issues

### 4. Cache Rules
#### Rule A: Static Assets
- **Pattern**: `/path.startswith("/_next/static")`
- **TTL**: 31536000s (1 year, immutable)
- **Mode**: override_origin
- **Status**: ✓ Working — cf-cache-status: HIT on repeated requests

#### Rule B: HTML Pages
- **Pattern**: 
  ```
  (http.request.uri.path wildcard "/bus/*") or 
  (http.request.uri.path wildcard "/city-bus/*") or 
  (http.request.uri.path wildcard "/via/*") or 
  (http.request.uri.path wildcard "/buses-from/*") or 
  (http.request.uri.path eq "/about") or 
  (http.request.uri.path eq "/contribute") or 
  (http.request.uri.path eq "/")
  ```
- **TTL**: 7200s (2 hours)
- **Mode**: override_origin (ignores cache-control header from Vercel's ISR `max-age=0, must-revalidate`)
- **Status**: ✓ Working — cf-cache-status: MISS on first visit, HIT on repeat requests

### 5. Security (Not Yet Completed)
- **Bot Fight Mode**: Still enabled (default). Should be turned OFF or scoped to avoid blocking GitHub Actions monitor cron (`/api/health` endpoint) and linkinator (`check:links` test). TODO: disable before relying on this setup long-term.

## Impact

### Before
- All requests (static + HTML) hit Vercel's edge, counted against 1M/mo quota
- ~40 edge requests per pageview (1 HTML + ~39 static assets + fonts)
- ~1000 pageviews/day × 40 reqs/pv = ~40k edge requests/day
- Quota exhausted mid-month

### After
- **First request** to any URL: MISS (fetched from Vercel, cached at Cloudflare)
- **Repeat requests**: HIT (served from Cloudflare, zero Vercel edge requests)
- Estimated ~80-90% of traffic is repeat requests → ~80-90% reduction in Vercel Edge Requests quota usage
- Within free tier indefinitely (Cloudflare free has no meaningful request limit)

## Verification (July 7, 2026)
```bash
# Static assets (Rule A)
curl -sI https://enbus.in/_next/static/chunks/main.js  # cf-cache-status: HIT

# HTML pages (Rule B)
curl -sD - -o /dev/null https://enbus.in/bus/bangalore-to-chennai  # first: MISS, second: HIT
curl -sD - -o /dev/null https://enbus.in/about  # first: MISS, second: HIT
```

## Notes
- No code changes to the application — caching is purely DNS/CDN infrastructure
- Next.js ISR headers (`cache-control: public, max-age=0, must-revalidate`) still respected by Vercel for revalidation; Cloudflare TTL (2h) is separate layer
- Vary headers (`rsc`, `next-router-state-tree`, `next-router-prefetch`) are respected by browsers but not partitioned by Cloudflare free plan — acceptable because full HTML responses are cached, RSC partials bypass via browser-side detection
- Email forwarding and Search Console verification records preserved without disruption
- GitHub Actions monitor and linkinator health checks may be affected by Bot Fight Mode; should be disabled/scoped before full production reliance

## References
- Cloudflare Rulesets API: `GET /zones/{zone_id}/rulesets/phases/http_request_cache_settings/entrypoint`
- Vercel Edge Requests meter: https://vercel.com/dashboard/udhayakumarans-projects/usage
- Plan document: [../vercel-your-site-is-curious-backus.md](../plans/vercel-your-site-is-curious-backus.md)
