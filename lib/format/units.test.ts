import { describe, expect, it } from "vitest";

import {
  celsiusToFahrenheit,
  formatHumidity,
  formatPercent,
  formatPrecipitation,
  formatTemperature,
  formatTemperatureWithUnit,
  formatVisibility,
  formatWindDirection,
  formatWindSpeed,
  metersPerSecondToKph,
  metersToKilometers,
} from "@/lib/format/units";

describe("temperature", () => {
  it("converts celsius to fahrenheit", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it("formats in the requested scale", () => {
    expect(formatTemperature(13.4, "metric")).toBe("13°");
    expect(formatTemperature(0, "imperial")).toBe("32°");
  });

  it("appends the scale letter when asked", () => {
    expect(formatTemperatureWithUnit(13.4, "metric")).toBe("13°C");
    expect(formatTemperatureWithUnit(0, "imperial")).toBe("32°F");
  });

  it("rounds rather than truncating", () => {
    expect(formatTemperature(21.6, "metric")).toBe("22°");
    expect(formatTemperature(21.4, "metric")).toBe("21°");
  });

  /** `Math.round(-0.4)` is `-0`. */
  it("never renders a negative zero", () => {
    expect(formatTemperature(-0.4, "metric")).toBe("0°");
  });

  it("keeps genuinely negative temperatures signed", () => {
    expect(formatTemperature(-5.2, "metric")).toBe("-5°");
  });
});

describe("wind speed", () => {
  /** `units=metric` returns metres per second, not km/h. */
  it("converts m/s to km/h before labelling", () => {
    expect(metersPerSecondToKph(10)).toBeCloseTo(36);
    expect(formatWindSpeed(10, "metric")).toBe("36 km/h");
  });

  it("converts m/s to mph for imperial", () => {
    expect(formatWindSpeed(10, "imperial")).toBe("22 mph");
  });

  it("names the compass point for a bearing", () => {
    expect(formatWindDirection(0)).toBe("N");
    expect(formatWindDirection(90)).toBe("E");
    expect(formatWindDirection(180)).toBe("S");
    expect(formatWindDirection(270)).toBe("W");
    expect(formatWindDirection(45)).toBe("NE");
  });

  it("wraps bearings outside 0..360", () => {
    expect(formatWindDirection(360)).toBe("N");
    expect(formatWindDirection(-90)).toBe("W");
    expect(formatWindDirection(450)).toBe("E");
  });
});

describe("visibility", () => {
  /** OpenWeather reports metres and caps at 10000. */
  it("converts metres to kilometres before labelling", () => {
    expect(metersToKilometers(10_000)).toBe(10);
    expect(formatVisibility(10_000, "metric")).toBe("10 km");
  });

  it("keeps one decimal below 10 km", () => {
    expect(formatVisibility(2500, "metric")).toBe("2.5 km");
  });

  it("converts to miles for imperial", () => {
    expect(formatVisibility(1609.344, "imperial")).toBe("1.0 mi");
  });
});

describe("precipitation and percentages", () => {
  it("formats millimetres", () => {
    expect(formatPrecipitation(4.25, "metric")).toBe("4.3 mm");
    expect(formatPrecipitation(12.4, "metric")).toBe("12 mm");
  });

  it("formats inches for imperial", () => {
    expect(formatPrecipitation(25.4, "imperial")).toBe("1.00 in");
  });

  it("renders a 0..1 fraction as a percentage", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.68)).toBe("68%");
    expect(formatPercent(1)).toBe("100%");
  });

  it("renders humidity, which already arrives as a percentage", () => {
    expect(formatHumidity(64)).toBe("64%");
  });
});
