import "server-only";

import xior, { isXiorError } from "xior";
import type { z } from "zod";

import {
  airQualityWireSchema,
  currentWeatherWireSchema,
  forecastWireSchema,
  geocodeWireSchema,
} from "@/schemas/openweather";
import { ApiError, codeFromUpstreamStatus } from "@/lib/api/errors";
import { clockParts, toCityDateKey } from "@/lib/format/time";
import { toAirQualityIndex } from "@/lib/weather/aqi";
import type {
  AirQuality,
  CityResult,
  Coordinates,
  CurrentWeather,
  Forecast,
  ForecastDay,
  ForecastSlot,
  WeatherCondition,
} from "@/types/domain";

/**
 * Server-only OpenWeather adapter.
 *
 * The `server-only` import above is a build-time guard: importing this module from
 * a client component fails the build rather than silently shipping the API key to
 * the browser.
 *
 * This is the single file that knows OpenWeather's wire format. Everything above
 * it consumes the domain model in `types/domain.ts`, so swapping providers means
 * rewriting this file and nothing else.
 */

const WEATHER_BASE = "https://api.openweathermap.org/data/2.5";
const GEO_BASE = "https://api.openweathermap.org/geo/1.0";

/** Cache windows, in seconds. Conditions move slowly; geocoding barely moves. */
const REVALIDATE = {
  weather: 600, // 10 min
  forecast: 1800, // 30 min
  airQuality: 1800,
  geocode: 86_400, // 24 h
} as const;

function apiKey(): string {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new ApiError(
      "INVALID_KEY",
      500,
      "OPENWEATHER_API_KEY is not set. Copy .env.example to .env and add your key.",
    );
  }
  return key;
}

const client = xior.create({
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

/**
 * Performs the request, normalises transport failures into `ApiError`, then
 * validates the payload. Validation lives here rather than in each caller so no
 * unvalidated shape can escape this module.
 */
async function fetchAndParse<T>(
  url: string,
  params: Record<string, string | number>,
  schema: z.ZodType<T>,
  revalidate: number,
): Promise<T> {
  let payload: unknown;

  try {
    const response = await client.get<unknown>(url, {
      params: { ...params, appid: apiKey() },
      next: { revalidate },
    });
    payload = response.data;
  } catch (error) {
    if (isXiorError(error)) {
      const status = error.response?.status;
      if (typeof status === "number") {
        throw new ApiError(codeFromUpstreamStatus(status), status);
      }
      throw new ApiError("NETWORK", 503);
    }
    throw new ApiError("UPSTREAM_ERROR", 502);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      "INVALID_RESPONSE",
      502,
      `Unexpected payload from ${url}: ${parsed.error.issues
        .slice(0, 3)
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join("; ")}`,
    );
  }

  return parsed.data;
}

function toCondition(wire: {
  id: number;
  main: string;
  description: string;
  icon: string;
}): WeatherCondition {
  return {
    id: wire.id,
    group: wire.main,
    description: wire.description,
    icon: wire.icon,
  };
}

// ------------------------------------------------------------------ endpoints

export async function fetchCurrentWeather(
  coord: Coordinates,
): Promise<CurrentWeather> {
  const wire = await fetchAndParse(
    `${WEATHER_BASE}/weather`,
    { lat: coord.lat, lon: coord.lon, units: "metric" },
    currentWeatherWireSchema,
    REVALIDATE.weather,
  );

  // `.min(1)` on the schema guarantees this element exists.
  const condition = toCondition(wire.weather[0]!);

  return {
    city: wire.name,
    country: wire.sys.country ?? "",
    coord: { lat: wire.coord.lat, lon: wire.coord.lon },
    timezoneOffsetSeconds: wire.timezone,
    observedAt: wire.dt,
    condition,
    tempC: wire.main.temp,
    feelsLikeC: wire.main.feels_like,
    tempMinC: wire.main.temp_min,
    tempMaxC: wire.main.temp_max,
    humidityPct: wire.main.humidity,
    pressureHpa: wire.main.pressure,
    // Absent when the station does not report it; 10 km is OpenWeather's ceiling.
    visibilityMeters: wire.visibility ?? 10_000,
    windSpeedMs: wire.wind.speed,
    windDeg: wire.wind.deg,
    windGustMs: wire.wind.gust ?? null,
    cloudsPct: wire.clouds.all,
    sunriseAt: wire.sys.sunrise,
    sunsetAt: wire.sys.sunset,
  };
}

export async function fetchForecast(coord: Coordinates): Promise<Forecast> {
  const wire = await fetchAndParse(
    `${WEATHER_BASE}/forecast`,
    { lat: coord.lat, lon: coord.lon, units: "metric" },
    forecastWireSchema,
    REVALIDATE.forecast,
  );

  const offsetSeconds = wire.city.timezone;

  const slots: ForecastSlot[] = wire.list.map((entry) => ({
    at: entry.dt,
    tempC: entry.main.temp,
    feelsLikeC: entry.main.feels_like,
    humidityPct: entry.main.humidity,
    windSpeedMs: entry.wind.speed,
    condition: toCondition(entry.weather[0]!),
    precipitationProbability: entry.pop ?? 0,
    rainMm: entry.rain?.["3h"] ?? 0,
  }));

  return {
    city: wire.city.name,
    country: wire.city.country ?? "",
    coord: { lat: wire.city.coord.lat, lon: wire.city.coord.lon },
    timezoneOffsetSeconds: offsetSeconds,
    slots,
    days: groupIntoDays(slots, offsetSeconds),
  };
}

export async function fetchAirQuality(
  coord: Coordinates,
): Promise<AirQuality> {
  const wire = await fetchAndParse(
    `${WEATHER_BASE}/air_pollution`,
    { lat: coord.lat, lon: coord.lon },
    airQualityWireSchema,
    REVALIDATE.airQuality,
  );

  const first = wire.list[0]!;

  return {
    index: toAirQualityIndex(first.main.aqi),
    components: {
      pm2_5: first.components.pm2_5,
      pm10: first.components.pm10,
      o3: first.components.o3,
      no2: first.components.no2,
      so2: first.components.so2,
      co: first.components.co,
    },
  };
}

export async function searchCities(
  query: string,
  limit = 5,
): Promise<CityResult[]> {
  const wire = await fetchAndParse(
    `${GEO_BASE}/direct`,
    { q: query, limit },
    geocodeWireSchema,
    REVALIDATE.geocode,
  );

  return wire.map((entry) => ({
    name: entry.name,
    country: entry.country,
    state: entry.state ?? null,
    lat: entry.lat,
    lon: entry.lon,
  }));
}

export async function reverseGeocode(
  coord: Coordinates,
): Promise<CityResult | null> {
  const wire = await fetchAndParse(
    `${GEO_BASE}/reverse`,
    { lat: coord.lat, lon: coord.lon, limit: 1 },
    geocodeWireSchema,
    REVALIDATE.geocode,
  );

  const first = wire[0];
  if (!first) return null;

  return {
    name: first.name,
    country: first.country,
    state: first.state ?? null,
    lat: first.lat,
    lon: first.lon,
  };
}

// -------------------------------------------------------------------- helpers

/**
 * Collapses the flat 3-hourly series into local calendar days.
 *
 * The representative condition is taken from the slot nearest local midday rather
 * than the first slot, because the first slot of "today" is often 21:00 and would
 * label a sunny day as clear-night.
 */
export function groupIntoDays(
  slots: ForecastSlot[],
  offsetSeconds: number,
): ForecastDay[] {
  const buckets = new Map<string, ForecastSlot[]>();

  for (const slot of slots) {
    const key = toCityDateKey(slot.at, offsetSeconds);
    const existing = buckets.get(key);
    if (existing) existing.push(slot);
    else buckets.set(key, [slot]);
  }

  const days: ForecastDay[] = [];

  for (const [date, daySlots] of buckets) {
    const first = daySlots[0];
    if (!first) continue;

    let min = first.tempC;
    let max = first.tempC;
    let representative = first;
    let bestDistanceFromNoon = Number.POSITIVE_INFINITY;

    for (const slot of daySlots) {
      if (slot.tempC < min) min = slot.tempC;
      if (slot.tempC > max) max = slot.tempC;

      const distance = Math.abs(
        clockParts(slot.at, offsetSeconds).hours24 - 12,
      );
      if (distance < bestDistanceFromNoon) {
        bestDistanceFromNoon = distance;
        representative = slot;
      }
    }

    days.push({
      date,
      at: first.at,
      minC: min,
      maxC: max,
      condition: representative.condition,
      slots: daySlots,
    });
  }

  return days;
}
