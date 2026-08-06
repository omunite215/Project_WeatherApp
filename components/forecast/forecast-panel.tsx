"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { DayChips } from "@/components/forecast/day-chips";
import {
  ForecastChart,
  type ChartMetric,
} from "@/components/forecast/forecast-chart";
import { ForecastSkeleton } from "@/components/forecast/forecast-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForecast } from "@/hooks/use-weather-data";
import type { SavedLocation } from "@/types/domain";

/**
 * `short` is shown below `sm`. "Temperature · Precipitation · Wind" is ~290px of
 * text, which overflows a 360px phone once card padding is taken out.
 */
const METRIC_TABS: ReadonlyArray<{
  value: ChartMetric;
  label: string;
  short: string;
}> = [
  { value: "temperature", label: "Temperature", short: "Temp" },
  { value: "precipitation", label: "Precipitation", short: "Rain" },
  { value: "wind", label: "Wind", short: "Wind" },
];

/**
 * The 40 three-hourly slots span six *calendar* days whenever the window opens
 * mid-day: a partial today at the front and a partial sixth day at the back.
 * Six chips would overflow the five-column grid and contradict the "5 days"
 * heading, so the trailing partial day is trimmed.
 */
const MAX_DAYS = 5;

/**
 * Chart panel plus day selector.
 *
 * Owns which metric and which day are shown; the chart and chips below it are
 * presentational and take everything as props, so each can be reasoned about
 * without knowing where the data came from.
 */
export function ForecastPanel({ location }: { location: SavedLocation }) {
  const { data, isPending, isError, error, refetch } = useForecast(location);
  const [metric, setMetric] = useState<ChartMetric>("temperature");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(
    () => data?.days.slice(0, MAX_DAYS) ?? [],
    [data],
  );

  const visibleSlots = useMemo(() => {
    if (!data) return [];
    if (!selectedDate) return data.slots;
    return days.find((day) => day.date === selectedDate)?.slots ?? data.slots;
  }, [data, days, selectedDate]);

  if (isPending) return <ForecastSkeleton />;

  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-2 sm:gap-3">
        <CardTitle className="text-sm sm:text-base xl:text-lg">
          {selectedDate ? "Selected day" : "Next 5 days"}
        </CardTitle>

        <Tabs
          value={metric}
          onValueChange={(value) => setMetric(value as ChartMetric)}
        >
          <TabsList>
            {METRIC_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 sm:gap-4 xl:gap-5">
        <ForecastChart
          slots={visibleSlots}
          metric={metric}
          timezoneOffsetSeconds={data.timezoneOffsetSeconds}
        />

        <DayChips
          days={days}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          timezoneOffsetSeconds={data.timezoneOffsetSeconds}
        />
      </CardContent>
    </Card>
  );
}
