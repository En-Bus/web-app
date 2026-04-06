import { describe, it, expect } from 'vitest';
import {
  SEO_ROUTE_SLUGS,
  CITY_BUS_ROUTE_SLUGS,
  getHubCities,
  getRoutesFromCity,
} from '../app/lib/seo-routes';
import { parseBusRouteSlug } from '../app/lib/bus-search';

// ── Bug #5: getRoutesFromCity returns undefined toSlug ───────────────
describe('getRoutesFromCity safety (bug #5)', () => {
  it('every slug in SEO_ROUTE_SLUGS contains exactly one -to- separator', () => {
    for (const slug of SEO_ROUTE_SLUGS) {
      const parts = slug.split('-to-');
      expect(parts.length, `slug "${slug}" has ${parts.length - 1} -to- separators`).toBe(2);
    }
  });

  it('every slug in CITY_BUS_ROUTE_SLUGS contains exactly one -to- separator', () => {
    for (const slug of CITY_BUS_ROUTE_SLUGS) {
      const parts = slug.split('-to-');
      expect(parts.length, `slug "${slug}" has ${parts.length - 1} -to- separators`).toBe(2);
    }
  });

  it('split("-to-")[1] is never undefined for any SEO route', () => {
    for (const slug of SEO_ROUTE_SLUGS) {
      const toSlug = slug.split('-to-')[1];
      expect(toSlug, `slug "${slug}" has undefined toSlug`).toBeDefined();
      expect(toSlug!.length, `slug "${slug}" has empty toSlug`).toBeGreaterThan(0);
    }
  });

  it('getRoutesFromCity returns valid toSlug for all hub cities', () => {
    const cities = getHubCities();
    for (const city of cities) {
      const { interCity, cityBus } = getRoutesFromCity(city);
      for (const route of [...interCity, ...cityBus]) {
        expect(route.toSlug, `city "${city}" route has undefined toSlug`).toBeDefined();
        expect(route.toSlug.length, `city "${city}" route has empty toSlug`).toBeGreaterThan(0);
      }
    }
  });
});

// ── All SEO slugs must be parseable ─────────────────────────────────
describe('SEO route slug integrity', () => {
  it('all SEO_ROUTE_SLUGS are parseable by parseBusRouteSlug', () => {
    for (const slug of SEO_ROUTE_SLUGS) {
      const result = parseBusRouteSlug(slug);
      expect(result, `slug "${slug}" failed to parse`).not.toBeNull();
      expect(result!.fromSlug).toBeTruthy();
      expect(result!.toSlug).toBeTruthy();
    }
  });

  it('all CITY_BUS_ROUTE_SLUGS are parseable by parseBusRouteSlug', () => {
    for (const slug of CITY_BUS_ROUTE_SLUGS) {
      const result = parseBusRouteSlug(slug);
      expect(result, `slug "${slug}" failed to parse`).not.toBeNull();
    }
  });

  it('no SEO route is self-referencing (from === to)', () => {
    for (const slug of [...SEO_ROUTE_SLUGS, ...CITY_BUS_ROUTE_SLUGS]) {
      const result = parseBusRouteSlug(slug);
      if (result) {
        expect(
          result.fromSlug,
          `slug "${slug}" is self-referencing`,
        ).not.toBe(result.toSlug);
      }
    }
  });

  it('no duplicate slugs in SEO_ROUTE_SLUGS', () => {
    const unique = new Set(SEO_ROUTE_SLUGS);
    expect(unique.size).toBe(SEO_ROUTE_SLUGS.length);
  });

  it('no duplicate slugs in CITY_BUS_ROUTE_SLUGS', () => {
    const unique = new Set(CITY_BUS_ROUTE_SLUGS);
    expect(unique.size).toBe(CITY_BUS_ROUTE_SLUGS.length);
  });
});

// ── getHubCities consistency ────────────────────────────────────────
describe('getHubCities', () => {
  it('returns sorted array', () => {
    const cities = getHubCities();
    const sorted = [...cities].sort();
    expect(cities).toEqual(sorted);
  });

  it('returns no empty strings', () => {
    const cities = getHubCities();
    for (const city of cities) {
      expect(city.length).toBeGreaterThan(0);
    }
  });

  it('all hub cities have at least one route', () => {
    const cities = getHubCities();
    for (const city of cities) {
      const { interCity, cityBus } = getRoutesFromCity(city);
      expect(
        interCity.length + cityBus.length,
        `hub city "${city}" has no routes`,
      ).toBeGreaterThan(0);
    }
  });
});
