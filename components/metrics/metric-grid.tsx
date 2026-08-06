"use client";

import { Droplets, Gauge, Sunrise, Sunset, Thermometer, Wind } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { MetricGridSkeleton } from "@/components/metrics/metric-grid-skeleton";
import { MetricTile, type MetricTileProps } from "@/components/metrics/metric-tile";
import { Card } from "@/components/ui/card";
import { usePreferences } from "@/hooks/use-preferences";
import { useReveal } from "@/hooks/use-reveal";
import { useAirQuality, useWeather } from "@/hooks/use-weather-data";
import { formatClock } from "@/lib/format/time";
import {
  formatHumidity,
  formatTemperature,
  formatWindDirection,
  formatWindSpeed,
} from "@/lib/format/units";
import { airQualityBand } from "@/lib/weather/aqi";
import { METRIC_GRID_COLS } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { SavedLocation } from "@/types/domain";

/**
 * The 2×2 metric quadrant.
 *
 * Air quality stands in for the reference design's UV index, which requires a paid
 * One Call 3.0 subscription. It is fetched separately and degrades on its own: if
 * the air-quality call fails the tile shows a dash while the other three keep
 * working, rather than failing the whole card.
 */
export function MetricGrid({ location }: { location: SavedLocation }) {
  const { data, isPending, isError, error, refetch } = useWeather(location);
  const airQuality = useAirQuality(location);
  const { units, hour12 } = usePreferences();
  const scope = useReveal([data?.city, units]);

  if (isPending) return <MetricGridSkeleton />;

  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState error={error} onRetry={() => refetch()} compact />
      </Card>
    );
  }

  const offset = data.timezoneOffsetSeconds;
  const band = airQuality.data ? airQualityBand(airQuality.data.index) : null;

  const tiles: MetricTileProps[] = [
    {
      icon: Droplets,
      label: "Humidity",
      value: formatHumidity(data.humidityPct),
    },
    {
      icon: Sunset,
      label: "Sunset",
      value: formatClock(data.sunsetAt, offset, { hour12 }),
    },
    {
      icon: Gauge,
      label: "Air Quality",
      value: band?.label ?? (airQuality.isPending ? "…" : "—"),
      detail: band?.advice,
      accent: band?.colorVar,
    },
    {
      icon: Sunrise,
      label: "Sunrise",
      value: formatClock(data.sunriseAt, offset, { hour12 }),
    },
    {
      icon: Wind,
      label: "Wind",
      value: formatWindSpeed(data.windSpeedMs, units),
      detail: formatWindDirection(data.windDeg),
    },
    {
      icon: Thermometer,
      label: "Feels like",
      value: formatTemperature(data.feelsLikeC, units),
    },
  ];

  return (
    <Card
      ref={scope}
      className={cn(
        "grid divide-x divide-y overflow-hidden p-0",
        METRIC_GRID_COLS,
      )}
    >
      {tiles.map((tile) => (
        <MetricTile key={tile.label} {...tile} />
      ))}
    </Card>
  );
}
