import fs from 'fs';
import path from 'path';
import type { SearchResponse, ViaStopsResponse, BusType } from './bus-search';
import { buildBusRouteSlug } from './bus-search';

const DATA_DIR = path.join(process.cwd(), 'data', 'fallback');

let interCity: Record<string, SearchResponse> | null = null;
let cityBus: Record<string, SearchResponse> | null = null;
let viaCache: Record<string, ViaStopsResponse> | null = null;

function load<T>(filename: string): Record<string, T> {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8')) as Record<string, T>;
  } catch {
    return {};
  }
}

export function getFallbackSearch(
  fromSlug: string,
  toSlug: string,
  type?: BusType,
): SearchResponse | null {
  const slug = buildBusRouteSlug(fromSlug, toSlug);
  if (type === 'city') {
    if (!cityBus) cityBus = load<SearchResponse>('city-bus.json');
    return cityBus[slug] ?? null;
  }
  if (!interCity) interCity = load<SearchResponse>('inter-city.json');
  return interCity[slug] ?? null;
}

export function getFallbackVia(stopSlug: string): ViaStopsResponse | null {
  if (!viaCache) viaCache = load<ViaStopsResponse>('via.json');
  return viaCache[stopSlug] ?? null;
}
