import xior, { isXiorError } from "xior";

import { ApiError, apiErrorFromResponseBody } from "@/lib/api/errors";
import type {
  AirQuality,
  CityResult,
  Coordinates,
  CurrentWeather,
  Forecast,
} from "@/types/domain";

/**
 * Browser-side data access.
 *
 * Talks only to this app's own `/api/*` routes, never to OpenWeather, so the API
 * key stays on the server. Failures are normalised to `ApiError` so the query
 * layer can decide on retries without inspecting raw status codes.
 */

const http = xior.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

async function get<T>(
  path: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  try {
    const response = await http.get<T>(path, { params, signal });
    return response.data;
  } catch (error) {
    if (isXiorError(error)) {
      const status = error.response?.status;
      if (typeof status === "number") {
        throw apiErrorFromResponseBody(error.response?.data, status);
      }
      // No response at all: offline, DNS failure, or timeout.
      throw new ApiError("NETWORK", 503);
    }
    throw new ApiError("UNKNOWN", 500);
  }
}

export function getCurrentWeather(
  coord: Coordinates,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  return get<CurrentWeather>("/weather", coord, signal);
}

export function getForecast(
  coord: Coordinates,
  signal?: AbortSignal,
): Promise<Forecast> {
  return get<Forecast>("/forecast", coord, signal);
}

export function getAirQuality(
  coord: Coordinates,
  signal?: AbortSignal,
): Promise<AirQuality> {
  return get<AirQuality>("/air-quality", coord, signal);
}

export function getCitySuggestions(
  query: string,
  signal?: AbortSignal,
): Promise<CityResult[]> {
  return get<CityResult[]>("/geo", { q: query, limit: 5 }, signal);
}

export async function getCityFromCoordinates(
  coord: Coordinates,
  signal?: AbortSignal,
): Promise<CityResult | null> {
  const results = await get<CityResult[]>("/geo", coord, signal);
  return results[0] ?? null;
}
