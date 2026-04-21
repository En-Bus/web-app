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
  arrives_at?: string | null;
  board_stop: string;
  board_stop_id?: string | null;
  alight_stop: string;
  alight_stop_id?: string | null;
  distance_km?: string | null;
};

// ─── Fare calculation (arasubus.tn.gov.in published rates) ───────────────────
// Rates in paise per km:
//   Ordinary 58 · Express 75 · Deluxe/SuperExpress 85 · Ultra Deluxe 100
//   AC 130 · AC Volvo 170 · AC Sleeper 180 (lean) · Non-AC Sleeper 135 (lean)

function fareRateForServiceType(serviceType: string): number {
  const s = serviceType.toLowerCase().replace(/[\s_-]+/g, '');
  if (s.includes('volvo'))                                return 170;
  if (s.includes('acsleeper') || s.includes('sleeper'))  return 180;
  if (s.includes('nonac'))                                return 135;
  if (s.includes('ac'))                                   return 130;
  if (s.includes('ultra') || s.includes('ultradeluxe'))  return 100;
  if (s.includes('deluxe') || s.includes('superdel'))     return 85;
  if (s.includes('express'))                              return 75;
  return 58; // Ordinary default
}

export function calculateFare(
  distanceKm: number | string | null | undefined,
  serviceType: string | null | undefined,
): number | null {
  if (!distanceKm || !serviceType) return null;
  const dist = typeof distanceKm === 'string' ? parseFloat(distanceKm) : distanceKm;
  if (!dist || isNaN(dist) || dist <= 0) return null;
  const rate = fareRateForServiceType(serviceType);
  // Minimum fare ₹10; round to nearest rupee
  return Math.max(10, Math.round((dist * rate) / 100));
}

export function calculateFareRange(
  results: SearchResult[],
): { min: number; max: number } | null {
  const fares = results
    .map((r) => calculateFare(r.distance_km, r.service_type))
    .filter((f): f is number => f !== null);
  if (fares.length === 0) return null;
  return { min: Math.min(...fares), max: Math.max(...fares) };
}

export function calculateDuration(departure: string, arrival: string): string | null {
  const depParts = departure.slice(0, 5).split(':').map(Number);
  const arrParts = arrival.slice(0, 5).split(':').map(Number);
  const dh = depParts[0] ?? NaN;
  const dm = depParts[1] ?? NaN;
  const ah = arrParts[0] ?? NaN;
  const am = arrParts[1] ?? NaN;
  if (isNaN(dh) || isNaN(dm) || isNaN(ah) || isNaN(am)) return null;

  let depMins = dh * 60 + dm;
  let arrMins = ah * 60 + am;
  if (arrMins <= depMins) arrMins += 24 * 60; // overnight journey

  const diff = arrMins - depMins;
  if (diff <= 0 || diff > 24 * 60) return null;

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

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

const COLLOQUIAL_NAMES: Record<string, string> = {
  'covai': 'coimbatore',
  'pondy': 'puducherry',
  'pondicherry': 'puducherry',
  'trichy': 'tiruchirappalli',
  'tiruchi': 'tiruchirappalli',
  'madras': 'chennai',
  'tanjore': 'thanjavur',
  'tindivanam': 'tindivanam',
  'tuticorin': 'thoothukudi',
  'nellai': 'tirunelveli',
  'cape comorin': 'kanyakumari',
};

function applyColloquial(value: string): string {
  const lowered = value.trim().toLowerCase();
  if (COLLOQUIAL_NAMES[lowered]) return COLLOQUIAL_NAMES[lowered];
  const slugged = lowered
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return COLLOQUIAL_NAMES[slugged] ?? lowered;
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

export function normalizeQuerySlug(value: string): string {
  const canonical = applyColloquial(value);
  return canonical
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

export function normalizeTime(value: string): string {
  const trimmed = value.trim();
  if (trimmed && !TIME_FORMAT.test(trimmed)) {
    return '';
  }
  return trimmed;
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

export function to12h(time: string | null | undefined): string {
  if (!time || time === '00:00:00') return '';
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export function getBestDisplayTime(result: SearchResult): string {
  const raw = result.boards_at ?? result.departs_at;
  return to12h(raw) || 'No timing info';
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

function bucketTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const bucketed = Math.floor(m / 15) * 15;
  return `${String(h).padStart(2, '0')}:${String(bucketed).padStart(2, '0')}`;
}

export type TripStop = {
  stop_name: string;
  stop_sequence: number;
  departure_time: string | null;
};

export async function fetchTripStops(
  tripId: string,
): Promise<{ stops: TripStop[] | null; error: string | null }> {
  const params = new URLSearchParams({ trip_id: tripId });
  const response = await fetch(`${API_BASE_URL}/trip-stops?${params.toString()}`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return { stops: null, error: `Trip stops request failed with status ${response.status}.` };
  }

  try {
    const data = (await response.json()) as { stops: TripStop[] };
    return { stops: data.stops ?? [], error: null };
  } catch {
    return { stops: null, error: 'Invalid response from trip stops API.' };
  }
}

export type ViaStopResult = {
  trip_id: string;
  via_time: string | null;
  route_no: string;
  service_type: string | null;
  origin: string;
  origin_time: string | null;
  destination: string;
  dest_time: string | null;
};

export type ViaStopsResponse = {
  results: ViaStopResult[];
  count: number;
  stop: string;
};

export async function fetchViaStops(
  stopSlug: string,
): Promise<{ data: ViaStopsResponse | null; error: string | null }> {
  const params = new URLSearchParams({ stop: slugToQuery(stopSlug) });
  const response = await fetch(`${API_BASE_URL}/via-stops?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!response.ok) {
    return { data: null, error: `Via stops request failed with status ${response.status}.` };
  }
  try {
    const data = (await response.json()) as ViaStopsResponse;
    return { data, error: null };
  } catch {
    return { data: null, error: 'Invalid response from via stops API.' };
  }
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
    params.set('time', bucketTime(time));
  }

  if (type) {
    params.set('type', type);
  }

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    return {
      data: null,
      error: `Search request failed with status ${response.status}.`,
    };
  }

  let data: SearchResponse;
  try {
    data = (await response.json()) as SearchResponse;
  } catch {
    return {
      data: null,
      error: 'Invalid response from search API.',
    };
  }

  const deduped = new Map<string, SearchResult>();

  for (const rawResult of data.results ?? []) {
    const result: SearchResult = {
      trip_id: (rawResult as SearchResult).trip_id,
      route_no: rawResult.route_no,
      service_type: (rawResult as SearchResult).service_type ?? null,
      departs_at: (rawResult as SearchResult).departs_at ?? null,
      boards_at: rawResult.boards_at,
      arrives_at: (rawResult as SearchResult).arrives_at ?? null,
      board_stop: rawResult.board_stop,
      board_stop_id: (rawResult as SearchResult).board_stop_id ?? null,
      alight_stop: rawResult.alight_stop,
      alight_stop_id: (rawResult as SearchResult).alight_stop_id ?? null,
      distance_km: (rawResult as SearchResult).distance_km ?? null,
    };

    const dedupeKey = result.trip_id
      ?? [
        result.route_no,
        result.board_stop,
        result.alight_stop,
        result.boards_at ?? result.departs_at ?? '',
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
