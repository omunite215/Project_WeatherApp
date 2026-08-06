"use client";

import { WeatherIcon } from "@/components/common/weather-icon";
import { usePreferences } from "@/hooks/use-preferences";
import { formatWeekdayShort } from "@/lib/format/time";
import { formatTemperature } from "@/lib/format/units";
import { isDayFromIconCode } from "@/lib/weather/condition-map";
import { DAY_CHIP_GRID, DAY_CHIP_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { ForecastDay } from "@/types/domain";

/**
 * Day selector under the chart.
 *
 * Selecting a chip scopes the chart to that day.
 *
 * Native radio inputs inside a fieldset, so arrow-key navigation and
 * screen-reader grouping come from the platform.
 */
export function DayChips({
  days,
  selectedDate,
  onSelect,
  timezoneOffsetSeconds,
}: {
  days: ForecastDay[];
  /** `null` shows the whole forecast window. */
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
  timezoneOffsetSeconds: number;
}) {
  const { units } = usePreferences();

  return (
    <fieldset className={DAY_CHIP_GRID}>
      <legend className="sr-only">Filter the chart by day</legend>

      {days.map((day) => {
        const selected = day.date === selectedDate;

        return (
          <label
            key={day.date}
            className={cn(
              // Stacked while narrow; from `xl` the chip is wide enough that a
              // horizontal icon-then-text layout fills it instead of leaving a
              // small stack marooned in the middle.
              "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors sm:p-3",
              "xl:flex-row xl:gap-3",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
              DAY_CHIP_HEIGHT,
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent bg-muted/40 hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <input
              type="radio"
              name="forecast-day"
              value={day.date}
              checked={selected}
              // Clicking the active day clears the filter and shows all 5 days.
              onClick={() => selected && onSelect(null)}
              onChange={() => onSelect(day.date)}
              className="sr-only"
            />

            <WeatherIcon
              group={day.condition.group}
              isDay={isDayFromIconCode(day.condition.icon)}
              className="size-5 shrink-0 xl:size-9"
            />

            <span className="flex flex-col items-center xl:items-start">
              <span className="text-[11px] font-medium uppercase tracking-wide sm:text-xs">
                {formatWeekdayShort(day.at, timezoneOffsetSeconds)}
              </span>

              {/* Hi and lo sit side by side once there is width for them. */}
              <span className="flex flex-col items-center gap-0 sm:flex-row sm:gap-1.5">
                <span className="text-xs font-semibold sm:text-sm xl:text-lg">
                  {formatTemperature(day.maxC, units)}
                </span>
                <span className="text-[11px] text-muted-foreground sm:text-xs xl:text-sm">
                  {formatTemperature(day.minC, units)}
                </span>
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
