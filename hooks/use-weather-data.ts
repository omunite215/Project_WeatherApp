"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAirQuality,
  getCurrentWeather,
  getForecast,
} from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { Coordinates } from "@/types/domain";

/**
 * The data-access surface every component uses.
 *
 * Components call these hooks and never see xior, TanStack Query internals, or
 * OpenWeather's response shape. Changing transport or provider does not touch a
 * single component.
 */

export function useWeather(coord: Coordinates) {
  return useQuery({
    queryKey: queryKeys.weather(coord),
    queryFn: ({ signal }) => getCurrentWeather(coord, signal),
  });
}

export function useForecast(coord: Coordinates) {
  return useQuery({
    queryKey: queryKeys.forecast(coord),
    queryFn: ({ signal }) => getForecast(coord, signal),
  });
}

export function useAirQuality(coord: Coordinates) {
  return useQuery({
    queryKey: queryKeys.airQuality(coord),
    queryFn: ({ signal }) => getAirQuality(coord, signal),
    // Air quality is supplementary; a failure here must not surface as a
    // page-level error while the main reading is fine.
    retry: 1,
  });
}
