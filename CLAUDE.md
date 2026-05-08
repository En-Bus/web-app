# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

enbus.in (TN Bus Finder) — a Next.js 16 app for searching Tamil Nadu (TNSTC/SETC) bus routes and timings. The frontend is server-rendered; bus data comes from a Supabase Edge Function API.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm test` — run all tests (vitest)
- `npm run test:watch` — run tests in watch mode
- `npx vitest run tests/bus-search.util.test.ts` — run a single test file

## Architecture

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Vitest + Testing Library.

**Data flow:** All bus search data is fetched server-side from a Supabase Edge Function API (`/functions/v1/api/search`). There is no database or ORM in this repo — it's purely a frontend that consumes the external API. The API base URL is configured via `NEXT_PUBLIC_SEARCH_API_BASE_URL`.

**Key modules:**

- `app/lib/bus-search.ts` — Core logic: slug normalization, route slug parsing (`{from}-to-{to}` format), search API fetching with deduplication. All route slugs use the pattern `{city}-to-{city}`.
- `app/lib/seo-routes.ts` — Static list of pre-defined SEO route slugs used for sitemap generation, homepage popular routes, and related route suggestions.
- `app/lib/site-url.ts` — Canonical site URL from env or default `https://enbus.in`.

**Routes:**

- `/` — Homepage with search form and popular routes from `SEO_ROUTE_SLUGS`
- `/search` — Server-side search with query params (`from`, `to`, `time`); noindex'd by robots
- `/bus/[route]` — SEO route pages (e.g., `/bus/chennai-to-madurai`); returns 404 if slug is invalid, self-referencing, or has zero results
- `/city-bus` — City bus search page (MTC/urban routes)
- `/city-bus/[route]` — City bus SEO route pages
- `/buses-from/[city]` — Hub pages showing all routes from a city
- `/about` — About page

**Components are all server components** except `GAAnalytics` and `SearchFeedback` (client components). `SearchForm` uses native HTML form submission (GET to `/search`), not client-side state. `SearchFeedback` collects user feedback with optional phone number and sends events to GA.

## Environment Variables

Copy `.env.local.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_SITE_URL` — canonical URL (default: `https://enbus.in`)
- `NEXT_PUBLIC_SEARCH_API_BASE_URL` — Supabase API endpoint
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Google Analytics ID

## Testing

Tests live in `tests/` directory (not colocated). Vitest with jsdom environment. Test files follow `*.test.ts` / `*.test.tsx` naming. Setup file: `vitest.setup.ts`.

## SEO Considerations

The `/search` page is noindex'd. SEO value comes from `/bus/[route]` pages (~126 pages). Zero-result routes have been pruned. When adding new routes, add them to `SEO_ROUTE_SLUGS` in `app/lib/seo-routes.ts` — this drives sitemap.xml generation and related route suggestions.

The search API supports a `type` parameter (`inter-city` or `city`) to filter between TNSTC/SETC and MTC/urban routes.

The README.md in this repo is unrelated (it's a Supabase CLI readme, not project documentation).

## warm-cache policy (Vercel free tier: 200k ISR Writes/month)

**Only run `npm run warm-cache` after a significant data change** — each run costs ~560 ISR Writes. Routine code-only deploys do NOT need warm-cache because ISR generates pages on-demand as users visit. Run it only after:
- A new scraping/ETL run that changes bus schedule data (run `build:fallback` first)
- Adding new pages that have no fallback data and need immediate cache seeding

Do NOT run after: code changes (seo-routes.ts edits, UI fixes, bug fixes), or multiple rapid deploys in one session.

## check-seo-routes requirements

The script (`scripts/check-seo-routes.ts`) sends `time=00:00` to match the production page which always fetches with `time='00:00'` (all-day results). Without this, late-night runs return artificially low result counts. Also note:
- Use canonical city slugs (e.g. `tiruchirappalli-to-erode`, not `trichy-to-erode`) — `next.config.ts` redirects colloquials to canonical forms, and `seo-routes.ts` must use the canonical (post-redirect) slug.
- Verify any newly failing route with `curl .../search?from=X&to=Y&type=inter-city&time=00:00` before removing it.
