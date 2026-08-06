import { describe, expect, it } from "vitest";

import {
  AIR_QUALITY_BANDS,
  airQualityBand,
  airQualityLabel,
  formatAirQualityScale,
  toAirQualityIndex,
} from "@/lib/weather/aqi";
import type { AirQualityIndex } from "@/types/domain";

describe("air quality bands", () => {
  it("covers the full 1..5 scale", () => {
    expect(AIR_QUALITY_BANDS).toHaveLength(5);
  });

  it("labels each index", () => {
    expect(airQualityLabel(1)).toBe("Good");
    expect(airQualityLabel(2)).toBe("Fair");
    expect(airQualityLabel(3)).toBe("Moderate");
    expect(airQualityLabel(4)).toBe("Poor");
    expect(airQualityLabel(5)).toBe("Very Poor");
  });

  it("gives every band a colour and advice", () => {
    for (const index of [1, 2, 3, 4, 5] as AirQualityIndex[]) {
      const band = airQualityBand(index);
      expect(band.colorVar).toMatch(/^var\(--aqi-[1-5]\)$/);
      expect(band.advice.length).toBeGreaterThan(0);
    }
  });

  it("formats the scale for display", () => {
    expect(formatAirQualityScale(2)).toBe("2 of 5");
  });
});

describe("toAirQualityIndex", () => {
  it("passes valid indices through", () => {
    expect(toAirQualityIndex(1)).toBe(1);
    expect(toAirQualityIndex(5)).toBe(5);
  });

  it("rounds fractional values", () => {
    expect(toAirQualityIndex(2.4)).toBe(2);
    expect(toAirQualityIndex(3.6)).toBe(4);
  });

  it("falls back to the middle band for out-of-range input", () => {
    expect(toAirQualityIndex(0)).toBe(3);
    expect(toAirQualityIndex(9)).toBe(3);
    expect(toAirQualityIndex(Number.NaN)).toBe(3);
  });
});
