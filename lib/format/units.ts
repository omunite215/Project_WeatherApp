import type { UnitSystem } from "@/types/domain";

/**
 * Unit conversion and display.
 *
 * The domain model stores celsius, metres and metres-per-second; these helpers
 * convert on the way to the screen.
 */

// ---------------------------------------------------------------- temperature

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32;
}

/** `"13°"` — the large hero reading, no unit suffix. */
export function formatTemperature(
  celsius: number,
  units: UnitSystem = "metric",
): string {
  const value = units === "imperial" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°`;
}

/** `"13°C"` — used where the scale needs to be explicit. */
export function formatTemperatureWithUnit(
  celsius: number,
  units: UnitSystem = "metric",
): string {
  return `${formatTemperature(celsius, units)}${units === "imperial" ? "F" : "C"}`;
}

/** Numeric value in the active scale, for chart axes and tween targets. */
export function temperatureValue(
  celsius: number,
  units: UnitSystem = "metric",
): number {
  const value = units === "imperial" ? celsiusToFahrenheit(celsius) : celsius;
  return Math.round(value);
}

export function temperatureUnitLabel(units: UnitSystem = "metric"): string {
  return units === "imperial" ? "°F" : "°C";
}

// ----------------------------------------------------------------- wind speed

export function metersPerSecondToKph(mps: number): number {
  return mps * 3.6;
}

export function metersPerSecondToMph(mps: number): number {
  return mps * 2.236936;
}

/** `units=metric` returns m/s, not km/h — convert before labelling. */
export function formatWindSpeed(
  metersPerSecond: number,
  units: UnitSystem = "metric",
): string {
  return units === "imperial"
    ? `${Math.round(metersPerSecondToMph(metersPerSecond))} mph`
    : `${Math.round(metersPerSecondToKph(metersPerSecond))} km/h`;
}

export function windSpeedValue(
  metersPerSecond: number,
  units: UnitSystem = "metric",
): number {
  return Math.round(
    units === "imperial"
      ? metersPerSecondToMph(metersPerSecond)
      : metersPerSecondToKph(metersPerSecond),
  );
}

export function windSpeedUnitLabel(units: UnitSystem = "metric"): string {
  return units === "imperial" ? "mph" : "km/h";
}

const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

/** Meteorological degrees to a 16-point compass label. */
export function formatWindDirection(degrees: number): string {
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS_POINTS[index] ?? "N";
}

// ------------------------------------------------------------------ visibility

export function metersToKilometers(meters: number): number {
  return meters / 1000;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

/** OpenWeather reports visibility in metres, capped at 10000. */
export function formatVisibility(
  meters: number,
  units: UnitSystem = "metric",
): string {
  if (units === "imperial") {
    const miles = metersToMiles(meters);
    return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
  }

  const km = metersToKilometers(meters);
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
}

// ------------------------------------------------------------------- rainfall

export function millimetersToInches(mm: number): number {
  return mm / 25.4;
}

export function formatPrecipitation(
  millimeters: number,
  units: UnitSystem = "metric",
): string {
  if (units === "imperial") {
    return `${millimetersToInches(millimeters).toFixed(2)} in`;
  }
  return `${millimeters < 10 ? millimeters.toFixed(1) : Math.round(millimeters)} mm`;
}

// -------------------------------------------------------------------- simple

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

export function formatHumidity(percent: number): string {
  return `${Math.round(percent)}%`;
}

export function formatPressure(hPa: number): string {
  return `${Math.round(hPa)} hPa`;
}
