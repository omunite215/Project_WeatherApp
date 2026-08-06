"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePreferences } from "@/hooks/use-preferences";
import { CHART_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { formatHourLabel, formatWeekdayShort } from "@/lib/format/time";
import {
  temperatureUnitLabel,
  temperatureValue,
  windSpeedUnitLabel,
  windSpeedValue,
} from "@/lib/format/units";
import type { ForecastSlot } from "@/types/domain";

export type ChartMetric = "temperature" | "precipitation" | "wind";

type ChartPoint = {
  at: number;
  label: string;
  weekday: string;
  value: number;
};

const METRIC_COLORS: Record<ChartMetric, string> = {
  temperature: "var(--chart-1)",
  precipitation: "var(--chart-2)",
  wind: "var(--chart-4)",
};

/**
 * Defined at module scope rather than inside `ForecastChart`. A component created
 * during render is a new type on every pass, so React unmounts and remounts the
 * tooltip instead of updating it.
 */
function ChartTooltip({
  active,
  payload,
  color,
  unitLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload?: ChartPoint }>;
  color: string;
  unitLabel: string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">
        {point.weekday} · {point.label}
      </p>
      <p style={{ color }}>
        {point.value}
        {unitLabel}
      </p>
    </div>
  );
}

/**
 * Area chart for one of three series over the forecast window.
 *
 * Recharts is SSR-safe, so no dynamic import or client-only guard is needed. The
 * series is derived with `useMemo` because the projection runs over 40 slots on
 * every unit toggle and tab switch.
 */
export function ForecastChart({
  slots,
  metric,
  timezoneOffsetSeconds,
}: {
  slots: ForecastSlot[];
  metric: ChartMetric;
  timezoneOffsetSeconds: number;
}) {
  const { units } = usePreferences();

  const { points, unitLabel } = useMemo(() => {
    const project = (slot: ForecastSlot): number => {
      switch (metric) {
        case "temperature":
          return temperatureValue(slot.tempC, units);
        case "precipitation":
          return Math.round(slot.precipitationProbability * 100);
        case "wind":
          return windSpeedValue(slot.windSpeedMs, units);
      }
    };

    const label =
      metric === "temperature"
        ? temperatureUnitLabel(units)
        : metric === "precipitation"
          ? "%"
          : windSpeedUnitLabel(units);

    return {
      points: slots.map<ChartPoint>((slot) => ({
        at: slot.at,
        label: formatHourLabel(slot.at, timezoneOffsetSeconds),
        weekday: formatWeekdayShort(slot.at, timezoneOffsetSeconds),
        value: project(slot),
      })),
      unitLabel: label,
    };
  }, [slots, metric, units, timezoneOffsetSeconds]);

  const color = METRIC_COLORS[metric];
  const gradientId = `fill-${metric}`;

  return (
    // Axis labels are sized here rather than via Recharts' `fontSize` prop: SVG
    // <text> inherits font-size from CSS, so a class on the wrapper scales the
    // ticks across breakpoints without a JS media query.
    <div
      className={cn("w-full text-[11px] sm:text-xs xl:text-sm", CHART_HEIGHT)}
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* No negative left margin: it clips the y-axis tick labels, leaving
            the unit suffix visible and the number cut off. */}
        <AreaChart
          data={points}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)" }}
            minTickGap={28}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            // Wide enough for the longest label a metric can produce, e.g.
            // "-10°C" or "100%".
            width={56}
            tick={{ fill: "var(--muted-foreground)" }}
            tickFormatter={(value: number) => `${value}${unitLabel}`}
            domain={
              metric === "precipitation" ? [0, 100] : ["auto", "auto"]
            }
          />

          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
            content={<ChartTooltip color={color} unitLabel={unitLabel} />}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            // Dots on 40 points is visual noise; they appear on hover instead.
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
