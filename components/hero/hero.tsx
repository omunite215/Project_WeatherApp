"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { WeatherIcon } from "@/components/common/weather-icon";
import { HeroSkeleton } from "@/components/hero/hero-skeleton";
import { TemperatureCounter } from "@/components/hero/temperature-counter";
import { usePreferences } from "@/hooks/use-preferences";
import { useReveal } from "@/hooks/use-reveal";
import { useWeather } from "@/hooks/use-weather-data";
import { formatLocationLabel } from "@/lib/location";
import {
  formatClock,
  formatUtcOffset,
  formatWeekday,
  isDaytime,
} from "@/lib/format/time";
import {
  temperatureUnitLabel,
  temperatureValue,
} from "@/lib/format/units";
import {
  conditionLabelFor,
  heroImagePathFor,
} from "@/lib/weather/condition-map";
import { HERO_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { SavedLocation } from "@/types/domain";

/**
 * The banner: condition photography with the current reading laid over it.
 *
 * A gradient scrim sits beneath the text so white type stays legible over bright
 * conditions such as snow and clear sky.
 */
export function Hero({ location }: { location: SavedLocation }) {
  const { data, isPending, isError, error, refetch } = useWeather(location);
  const { units, hour12 } = usePreferences();
  const scope = useReveal([data?.city, units]);

  if (isPending) return <HeroSkeleton />;

  if (isError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border",
          HERO_HEIGHT,
        )}
      >
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const isDay = isDaytime(data.observedAt, data.sunriseAt, data.sunsetAt);
  const offset = data.timezoneOffsetSeconds;

  return (
    <section
      ref={scope}
      aria-label="Current conditions"
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        HERO_HEIGHT,
      )}
    >
      <Image
        src={heroImagePathFor(data.condition.group)}
        alt={`${data.condition.description} in ${data.city}`}
        fill
        priority
        // The hero spans the viewport at every width now that the page is full
        // bleed, so there is no cap to describe here.
        sizes="100vw"
        className="object-cover"
      />

      {/* Scrim sits between photo and text so contrast holds on bright images. */}
      <div aria-hidden="true" className="hero-scrim absolute inset-0" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-4 text-white sm:flex-row sm:items-end sm:justify-between sm:p-5 xl:p-7 2xl:p-8">
        <div className="flex flex-col gap-2">
          <h1
            data-reveal
            className="flex items-start text-5xl font-light leading-none tracking-tight sm:text-6xl md:text-7xl xl:text-8xl"
          >
            <TemperatureCounter value={temperatureValue(data.tempC, units)} />
            <span className="mt-1 text-2xl sm:text-3xl md:text-4xl xl:text-5xl">
              {temperatureUnitLabel(units)}
            </span>
          </h1>

          <p
            data-reveal
            className="flex items-center gap-1.5 text-lg font-medium sm:text-xl md:text-2xl xl:text-3xl"
          >
            <MapPin aria-hidden="true" className="size-4 sm:size-5 xl:size-6" />
            {formatLocationLabel({
              name: data.city,
              country: data.country,
            })}
          </p>
        </div>

        <div
          data-reveal
          className="glass-panel flex flex-col gap-1 rounded-lg px-4 py-3 sm:items-end xl:px-5 xl:py-4"
        >
          <p className="text-xl font-semibold sm:text-2xl xl:text-3xl">
            {formatClock(data.observedAt, offset, { hour12 })}
          </p>
          <p className="flex items-center gap-1.5 text-sm font-medium sm:text-base xl:text-lg">
            <WeatherIcon
              group={data.condition.group}
              isDay={isDay}
              className="size-4 xl:size-5"
            />
            {conditionLabelFor(data.condition.group)}
            <span className="opacity-80">
              · {formatWeekday(data.observedAt, offset)}
            </span>
          </p>
          <p className="text-xs opacity-75">{formatUtcOffset(offset)}</p>
        </div>
      </div>
    </section>
  );
}
