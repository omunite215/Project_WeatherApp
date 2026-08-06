import type { SavedLocation } from "@/types/domain";

/**
 * The active location lives in the URL query string rather than in a store.
 *
 * That choice makes the server able to prefetch the right city on first paint,
 * makes any view shareable and bookmarkable, and makes browser back/forward work —
 * none of which is true when the selection lives only in client memory.
 */

/**
 * Shown only when the user's own location is unavailable — permission denied,
 * an unsupported browser, or a failed lookup — and they have no previous city
 * saved. The app's *actual* default is wherever the visitor is; see
 * `components/layout/location-bootstrap.tsx`.
 */
export const FALLBACK_LOCATION: SavedLocation = {
  name: "London",
  country: "GB",
  state: null,
  lat: 51.5073,
  lon: -0.1276,
};

type RawParams = Record<string, string | string[] | undefined>;

/**
 * True when the URL names a real location, i.e. the visitor picked it (or is
 * following a shared link) rather than landing on the fallback. Drives whether
 * automatic location detection should run at all.
 */
export function hasExplicitLocation(params: RawParams): boolean {
  const lat = parseCoordinate(firstValue(params["lat"]), 90);
  const lon = parseCoordinate(firstValue(params["lon"]), 180);
  return lat !== null && lon !== null;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCoordinate(
  raw: string | undefined,
  limit: number,
): number | null {
  if (raw === undefined) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || Math.abs(value) > limit) return null;
  return value;
}

/**
 * Reads a location from URL params, falling back to the default when anything is
 * missing or out of range. Never throws — a hand-edited URL should degrade to
 * London, not to an error page.
 */
export function locationFromParams(params: RawParams): SavedLocation {
  const lat = parseCoordinate(firstValue(params["lat"]), 90);
  const lon = parseCoordinate(firstValue(params["lon"]), 180);

  if (lat === null || lon === null) {
    return FALLBACK_LOCATION;
  }

  return {
    name: firstValue(params["name"]) ?? "Selected location",
    country: firstValue(params["country"]) ?? "",
    state: firstValue(params["state"]) ?? null,
    lat,
    lon,
  };
}

/** Builds the canonical URL for a location. */
export function locationToHref(location: SavedLocation): string {
  const params = new URLSearchParams({
    lat: location.lat.toFixed(4),
    lon: location.lon.toFixed(4),
    name: location.name,
  });

  if (location.country) params.set("country", location.country);
  if (location.state) params.set("state", location.state);

  return `/?${params.toString()}`;
}

/** `"Jamnagar, Gujarat, IN"` — omits parts that are absent. */
export function formatLocationLabel(location: {
  name: string;
  state?: string | null;
  country?: string | null;
}): string {
  return [location.name, location.state, location.country]
    .filter((part): part is string => Boolean(part))
    .join(", ");
}
