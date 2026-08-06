import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import {
  fetchAirQuality,
  fetchCurrentWeather,
  fetchForecast,
} from "@/lib/api/openweather";
import { queryKeys } from "@/lib/query/keys";
import type { Coordinates } from "@/types/domain";

/**
 * Server-side prefetch.
 *
 * Calls the adapter directly rather than looping through `/api`: a request to
 * ourselves during render costs a round trip and needs an absolute URL. Query
 * keys are shared with the browser hooks so hydration matches.
 *
 * Promises are not awaited. `shouldDehydrateQuery` includes pending queries, so
 * each result streams down as it resolves instead of blocking the shell.
 */
export function prefetchWeatherData(
  queryClient: QueryClient,
  coord: Coordinates,
): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.weather(coord),
    queryFn: () => fetchCurrentWeather(coord),
  });

  void queryClient.prefetchQuery({
    queryKey: queryKeys.forecast(coord),
    queryFn: () => fetchForecast(coord),
  });

  void queryClient.prefetchQuery({
    queryKey: queryKeys.airQuality(coord),
    queryFn: () => fetchAirQuality(coord),
  });
}
