import 'server-only';

import { getFallbackSearch, getFallbackVia } from './fallback-search';
import {
  fetchSearchResults as _fetchSearchResults,
  fetchViaStops as _fetchViaStops,
  fetchTripStops,
  type BusType,
  type SearchResponse,
  type ViaStopsResponse,
  type TripStop,
} from './bus-search';

export type { BusType, SearchResponse, ViaStopsResponse, TripStop };
export { fetchTripStops };

export async function fetchSearchResults(
  fromSlug: string,
  toSlug: string,
  time: string,
  type?: BusType,
): Promise<{ data: SearchResponse | null; error: string | null }> {
  const result = await _fetchSearchResults(fromSlug, toSlug, time, type);

  // Filter out results with missing times (00:00:00 placeholder in DB)
  if (result.data?.results) {
    result.data.results = result.data.results.filter(
      (r) => (r.boards_at && r.boards_at !== '00:00:00') || (r.departs_at && r.departs_at !== '00:00:00')
    );
  }

  const needsFallback = result.error || (result.data?.results.length ?? 0) < 3;
  if (needsFallback) {
    const fallback = getFallbackSearch(fromSlug, toSlug, type);
    if (fallback) return { data: fallback, error: null };
  }
  return result;
}

export async function fetchViaStops(
  stopSlug: string,
): Promise<{ data: ViaStopsResponse | null; error: string | null }> {
  const result = await _fetchViaStops(stopSlug);
  if (result.error) {
    const fallback = getFallbackVia(stopSlug);
    if (fallback) return { data: fallback, error: null };
  }
  return result;
}
