const API_BASE_URL =
  process.env.SEARCH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SEARCH_API_BASE_URL ??
  'https://hopivdsbzzfklohyllut.supabase.co/functions/v1/api';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type BusType = 'inter-city' | 'city';

export type SearchResult = {
  trip_id?: string;
  route_no: string;
  service_type?: string | null;
  departs_at?: string | null;
  boards_at: string | null;
  board_stop: string;
  alight_stop: string;
  distance_km?: string | null;
};

export type SearchResponse = {
  results: SearchResult[];
  count: number;
  query: {
    from: string;
    to: string;
    time?: string;
  };
};

export function getParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTime(value: string): string {
  return value.trim();
}

export function slugToQuery(value: string): string {
  return value.replace(/-+/g, ' ').trim();
}

export function toDisplayName(value: string): string {
  return slugToQuery(value)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatStopName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

export function getBestDisplayTime(result: SearchResult): string {
  return result.boards_at ?? result.departs_at ?? 'Time unknown';
}

export function buildBusRouteSlug(fromSlug: string, toSlug: string): string {
  return `${fromSlug}-to-${toSlug}`;
}

export function parseBusRouteSlug(routeSlug: string): {
  fromSlug: string;
  toSlug: string;
} | null {
  const pieces = routeSlug.split('-to-');

  if (pieces.length !== 2) {
    return null;
  }

  const fromSlug = normalizeSlug(pieces[0] ?? '');
  const toSlug = normalizeSlug(pieces[1] ?? '');

  if (!fromSlug || !toSlug) {
    return null;
  }

  return { fromSlug, toSlug };
}

export async function fetchSearchResults(
  fromSlug: string,
  toSlug: string,
  time: string,
  type?: BusType,
): Promise<{ data: SearchResponse | null; error: string | null }> {
  const params = new URLSearchParams({
    from: slugToQuery(fromSlug),
    to: slugToQuery(toSlug),
  });

  if (time) {
    params.set('time', time);
  }

  if (type) {
    params.set('type', type);
  }

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);

  if (!response.ok) {
    return {
      data: null,
      error: `Search request failed with status ${response.status}.`,
    };
  }

  const data = (await response.json()) as SearchResponse;
  const deduped = new Map<string, SearchResult>();

  for (const rawResult of data.results ?? []) {
    const result: SearchResult = {
      trip_id: (rawResult as SearchResult).trip_id,
      route_no: rawResult.route_no,
      service_type: (rawResult as SearchResult).service_type ?? null,
      departs_at: (rawResult as SearchResult).departs_at ?? null,
      boards_at: rawResult.boards_at,
      board_stop: rawResult.board_stop,
      alight_stop: rawResult.alight_stop,
      distance_km: (rawResult as SearchResult).distance_km ?? null,
    };

    const dedupeKey = [
      result.route_no,
      result.boards_at ?? result.departs_at ?? '',
      result.board_stop.trim().toLowerCase(),
      result.alight_stop.trim().toLowerCase(),
    ].join('|');

    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, result);
    }
  }

  return {
    data: {
      ...data,
      results: Array.from(deduped.values()).slice(0, 20),
    },
    error: null,
  };
}
