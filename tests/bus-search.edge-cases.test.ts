import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeSlug,
  normalizeTime,
  parseBusRouteSlug,
  slugToQuery,
  toDisplayName,
  formatStopName,
  getBestDisplayTime,
  getParamValue,
  buildBusRouteSlug,
  fetchSearchResults,
  type SearchResult,
} from '../app/lib/bus-search';

// ── Bug #15: Dedupe key collision when trip_id is null ──────────────
describe('dedupe key collision (bug #15)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not collapse two trips with same route_no when they have different stops', async () => {
    const fakeResponse = {
      ok: true,
      json: async () => ({
        results: [
          { route_no: '101', board_stop: 'A', alight_stop: 'B', boards_at: null, departs_at: null },
          { route_no: '101', board_stop: 'C', alight_stop: 'D', boards_at: null, departs_at: null },
        ],
        count: 2,
        query: { from: 'x', to: 'y' },
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));
    const { data } = await fetchSearchResults('x', 'y', '');

    // Fixed: dedupe key now includes board_stop + alight_stop, so different stops survive.
    expect(data!.results.length).toBe(2);
  });

  it('keeps two trips with same route_no when they have different times', async () => {
    const fakeResponse = {
      ok: true,
      json: async () => ({
        results: [
          { route_no: '101', board_stop: 'A', alight_stop: 'B', boards_at: '08:00', departs_at: null },
          { route_no: '101', board_stop: 'A', alight_stop: 'B', boards_at: '09:00', departs_at: null },
        ],
        count: 2,
        query: { from: 'x', to: 'y' },
      }),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));
    const { data } = await fetchSearchResults('x', 'y', '');
    expect(data!.results.length).toBe(2);
  });
});

// ── Bug #4: Unhandled JSON parse error from API ─────────────────────
describe('fetchSearchResults error handling (bug #4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns error when API responds with non-ok status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { data, error } = await fetchSearchResults('a', 'b', '');
    expect(data).toBeNull();
    expect(error).toContain('500');
  });

  it('returns error when API returns malformed JSON', async () => {
    const fakeResponse = {
      ok: true,
      json: async () => { throw new SyntaxError('Unexpected token'); },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fakeResponse));

    // Fixed: fetchSearchResults now catches json() parse failures.
    const { data, error } = await fetchSearchResults('a', 'b', '');
    expect(data).toBeNull();
    expect(error).toContain('Invalid response');
  });
});

// ── normalizeTime now validates HH:MM format ────────────────────────
describe('normalizeTime validation', () => {
  it('passes valid HH:MM times', () => {
    expect(normalizeTime('10:00')).toBe('10:00');
    expect(normalizeTime('  23:59  ')).toBe('23:59');
    expect(normalizeTime('00:00')).toBe('00:00');
  });

  it('returns empty string for invalid time formats', () => {
    expect(normalizeTime('abc')).toBe('');
    expect(normalizeTime('25:99')).toBe('');
    expect(normalizeTime('hello world')).toBe('');
    expect(normalizeTime('10:00AM')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeTime('')).toBe('');
    expect(normalizeTime('  ')).toBe('');
  });
});

// ── parseBusRouteSlug edge cases ────────────────────────────────────
describe('parseBusRouteSlug edge cases', () => {
  it('returns null for slug with multiple -to- segments', () => {
    // "a-to-b-to-c" splits into 3 pieces
    expect(parseBusRouteSlug('a-to-b-to-c')).toBeNull();
  });

  it('returns null for empty from or to', () => {
    expect(parseBusRouteSlug('-to-madurai')).toBeNull();
    expect(parseBusRouteSlug('chennai-to-')).toBeNull();
  });

  it('handles special characters in slugs', () => {
    // normalizeSlug strips non-alphanumeric
    const result = parseBusRouteSlug('ch@nnai-to-m@durai');
    expect(result).toEqual({ fromSlug: 'chnnai', toSlug: 'mdurai' });
  });
});

// ── getParamValue edge cases ────────────────────────────────────────
describe('getParamValue', () => {
  it('returns first element of array', () => {
    expect(getParamValue(['first', 'second'])).toBe('first');
  });

  it('returns empty string for empty array', () => {
    expect(getParamValue([])).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getParamValue(undefined)).toBe('');
  });

  it('returns string as-is', () => {
    expect(getParamValue('hello')).toBe('hello');
  });
});

// ── normalizeSlug thoroughness ──────────────────────────────────────
describe('normalizeSlug edge cases', () => {
  it('handles empty string', () => {
    expect(normalizeSlug('')).toBe('');
  });

  it('handles only special characters', () => {
    expect(normalizeSlug('@#$%^&*()')).toBe('');
  });

  it('collapses multiple spaces and dashes', () => {
    expect(normalizeSlug('a   b---c')).toBe('a-b-c');
  });

  it('strips leading and trailing dashes', () => {
    expect(normalizeSlug('--hello--')).toBe('hello');
  });

  it('handles Tamil transliterations with numbers', () => {
    expect(normalizeSlug('Route 101A')).toBe('route-101a');
  });
});

// ── formatStopName edge cases ───────────────────────────────────────
describe('formatStopName', () => {
  it('title-cases stop names', () => {
    expect(formatStopName('koyambedu')).toBe('Koyambedu');
    expect(formatStopName('CHENNAI CENTRAL')).toBe('Chennai Central');
  });

  it('handles empty and whitespace', () => {
    expect(formatStopName('')).toBe('');
    expect(formatStopName('  ')).toBe('');
  });
});

// ── toDisplayName edge cases ────────────────────────────────────────
describe('toDisplayName edge cases', () => {
  it('handles multi-word slugs', () => {
    expect(toDisplayName('new-bus-stand')).toBe('New Bus Stand');
  });

  it('handles single character words', () => {
    expect(toDisplayName('a-b-c')).toBe('A B C');
  });

  it('handles empty string', () => {
    expect(toDisplayName('')).toBe('');
  });
});
