"use client";

import { CloudRain } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePreferences } from "@/hooks/use-preferences";
import { useForecast } from "@/hooks/use-weather-data";
import { formatPercent, formatPrecipitation } from "@/lib/format/units";
import type { Forecast, SavedLocation } from "@/types/domain";

/**
 * The accent card, standing in for the reference design's "Monthly Rainfall".
 *
 * Historical rainfall is a paid OpenWeather tier, so this reports the next 24
 * hours instead — derived from forecast data already being fetched, at no extra
 * API cost, and considerably more actionable than a monthly total.
 */

const HOURS_AHEAD = 24;
const SECONDS_AHEAD = HOURS_AHEAD * 3600;

export function summariseNextDayRain(forecast: Forecast, nowSeconds: number) {
  const horizon = nowSeconds + SECONDS_AHEAD;
  const slots = forecast.slots.filter(
    (slot) => slot.at >= nowSeconds && slot.at <= horizon,
  );

  if (slots.length === 0) {
    return { totalMm: 0, peakProbability: 0, hasData: false };
  }

  return {
    totalMm: slots.reduce((sum, slot) => sum + slot.rainMm, 0),
    peakProbability: Math.max(
      ...slots.map((slot) => slot.precipitationProbability),
    ),
    hasData: true,
  };
}

/**
 * Exported so the route-level `loading.tsx` renders the identical placeholder
 * rather than its own copy, which would drift the moment either side changes.
 */
export function RainCardSkeleton() {
  return (
    <Card className="flex items-center justify-between gap-4 p-4 sm:p-5 xl:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 sm:h-7 xl:h-8" />
      </div>
      <Skeleton className="size-10 rounded-full sm:size-12 xl:size-14" />
    </Card>
  );
}

export function RainCard({ location }: { location: SavedLocation }) {
  const { data, isPending, isError } = useForecast(location);
  const { units } = usePreferences();

  if (isPending) return <RainCardSkeleton />;

  // This card is supplementary; on failure it simply steps aside rather than
  // pushing an error into the middle of a working column.
  if (isError || !data) return null;

  const { totalMm, peakProbability } = summariseNextDayRain(
    data,
    Math.floor(Date.now() / 1000),
  );

  return (
    <Card
      data-reveal
      className="flex items-center justify-between gap-4 border-0 bg-primary p-4 text-primary-foreground sm:p-5 xl:p-6"
    >
      <div className="min-w-0">
        <p className="text-xs opacity-90 sm:text-sm">
          Rain next {HOURS_AHEAD}h
        </p>
        <p className="text-xl font-semibold sm:text-2xl xl:text-3xl">
          {formatPrecipitation(totalMm, units)}
        </p>
        <p className="text-xs opacity-90">
          {totalMm > 0
            ? `Peak chance ${formatPercent(peakProbability)}`
            : "No rain expected"}
        </p>
      </div>

      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 sm:size-12 xl:size-14">
        <CloudRain aria-hidden="true" className="size-5 sm:size-6 xl:size-7" />
      </span>
    </Card>
  );
}
