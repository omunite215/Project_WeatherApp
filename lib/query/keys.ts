import type { Coordinates } from "@/types/domain";

/**
 * Centralised query keys.
 *
 * Coordinates are rounded to four decimals (~11 m) before entering a key. Without
 * this, geocoding float noise produces a different key for what is effectively the
 * same place and every lookup misses the cache.
 */

function roundCoord(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function coordKey(coord: Coordinates): [number, number] {
  return [roundCoord(coord.lat), roundCoord(coord.lon)];
}

export const queryKeys = {
  weather: (coord: Coordinates) => ["weather", ...coordKey(coord)] as const,
  forecast: (coord: Coordinates) => ["forecast", ...coordKey(coord)] as const,
  airQuality: (coord: Coordinates) =>
    ["air-quality", ...coordKey(coord)] as const,
  citySearch: (query: string) =>
    ["city-search", query.trim().toLowerCase()] as const,
  reverseGeocode: (coord: Coordinates) =>
    ["reverse-geocode", ...coordKey(coord)] as const,
} as const;
