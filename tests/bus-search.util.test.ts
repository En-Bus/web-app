import {
  buildBusRouteSlug,
  normalizeSlug,
  parseBusRouteSlug,
  slugToQuery,
  toDisplayName,
  getBestDisplayTime,
} from '../app/lib/bus-search';

describe('bus-search utils', () => {
  it('normalizes slugs consistently', () => {
    expect(normalizeSlug('  Chennai  Central ')).toBe('chennai-central');
    expect(normalizeSlug('Chennai@@ to * Madurai')).toBe('chennai-to-madurai');
  });

  it('builds and parses route slugs', () => {
    const slug = buildBusRouteSlug('chennai', 'madurai');
    expect(slug).toBe('chennai-to-madurai');
    expect(parseBusRouteSlug(slug)).toEqual({ fromSlug: 'chennai', toSlug: 'madurai' });
  });

  it('rejects malformed slugs', () => {
    expect(parseBusRouteSlug('bad-slug')).toBeNull();
    expect(parseBusRouteSlug('to-')).toBeNull();
  });

  it('converts slugs to queries and display names', () => {
    expect(slugToQuery('chennai-central')).toBe('chennai central');
    expect(toDisplayName('chennai central')).toBe('Chennai Central');
  });

  it('selects best display time with fallbacks', () => {
    expect(
      getBestDisplayTime({
        route_no: '1',
        board_stop: 'A',
        alight_stop: 'B',
        boards_at: '10:00',
      }),
    ).toBe('10:00 AM');

    expect(
      getBestDisplayTime({
        route_no: '1',
        board_stop: 'A',
        alight_stop: 'B',
        boards_at: null,
        departs_at: '10:05',
      }),
    ).toBe('10:05 AM');

    expect(
      getBestDisplayTime({
        route_no: '1',
        board_stop: 'A',
        alight_stop: 'B',
        boards_at: null,
        departs_at: null,
      }),
    ).toBe('No timing info');
  });
});
