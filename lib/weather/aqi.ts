import type { AirQualityIndex } from "@/types/domain";

/**
 * OpenWeather's air quality index, used in place of UV index (which requires a
 * paid One Call 3.0 subscription). The scale is 1..5, coarser than the US AQI's
 * 0..500 but available on the free tier.
 */

export type AirQualityBand = {
  index: AirQualityIndex;
  label: string;
  /** CSS custom property holding this band's colour. */
  colorVar: string;
  /** Plain-language guidance shown under the reading. */
  advice: string;
};

const BANDS: Record<AirQualityIndex, AirQualityBand> = {
  1: {
    index: 1,
    label: "Good",
    colorVar: "var(--aqi-1)",
    advice: "Ideal for outdoor activity",
  },
  2: {
    index: 2,
    label: "Fair",
    colorVar: "var(--aqi-2)",
    advice: "Acceptable for most people",
  },
  3: {
    index: 3,
    label: "Moderate",
    colorVar: "var(--aqi-3)",
    advice: "Sensitive groups take care",
  },
  4: {
    index: 4,
    label: "Poor",
    colorVar: "var(--aqi-4)",
    advice: "Limit outdoor exertion",
  },
  5: {
    index: 5,
    label: "Very Poor",
    colorVar: "var(--aqi-5)",
    advice: "Avoid outdoor exertion",
  },
};

export function airQualityBand(index: AirQualityIndex): AirQualityBand {
  return BANDS[index];
}

export function airQualityLabel(index: AirQualityIndex): string {
  return BANDS[index].label;
}

/** `"2 of 5"`, mirroring the reference design's "0 of 10" phrasing. */
export function formatAirQualityScale(index: AirQualityIndex): string {
  return `${index} of 5`;
}

/** Narrows an arbitrary number to the index union, defaulting to the mid band. */
export function toAirQualityIndex(value: number): AirQualityIndex {
  const rounded = Math.round(value);
  if (rounded >= 1 && rounded <= 5) return rounded as AirQualityIndex;
  return 3;
}

export const AIR_QUALITY_BANDS = Object.values(BANDS);
