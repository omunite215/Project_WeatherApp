/**
 * Time formatting in a city's local wall clock.
 *
 * OpenWeather returns timestamps as UTC unix seconds plus a `timezone` offset in
 * seconds. Shift the instant by that offset, then read the UTC components of the
 * result. Reading local components instead applies the viewer's offset twice.
 */

const WEEKDAY_LONG = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
});

/**
 * Shift a UTC instant so its UTC components read as the city's wall clock.
 * The returned Date is only meaningful when read via its `getUTC*` methods.
 */
export function shiftToCity(unixSeconds: number, offsetSeconds: number): Date {
  return new Date((unixSeconds + offsetSeconds) * 1000);
}

export type ClockParts = {
  /** 0..23 */
  hours24: number;
  /** 1..12 */
  hours12: number;
  /** 0..59 */
  minutes: number;
  meridiem: "AM" | "PM";
};

export function clockParts(
  unixSeconds: number,
  offsetSeconds: number,
): ClockParts {
  const shifted = shiftToCity(unixSeconds, offsetSeconds);
  const hours24 = shifted.getUTCHours();

  // Must read the 24-hour value; `% 12` gives 0..11 and always compares as AM.
  const meridiem: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";

  // Midnight and noon display as 12, not 0.
  const remainder = hours24 % 12;
  const hours12 = remainder === 0 ? 12 : remainder;

  return { hours24, hours12, minutes: shifted.getUTCMinutes(), meridiem };
}

/** `"7:05 PM"` (12h) or `"19:05"` (24h). */
export function formatClock(
  unixSeconds: number,
  offsetSeconds: number,
  options: { hour12?: boolean } = {},
): string {
  const { hour12 = true } = options;
  const { hours24, hours12, minutes, meridiem } = clockParts(
    unixSeconds,
    offsetSeconds,
  );
  const mm = String(minutes).padStart(2, "0");

  return hour12
    ? `${hours12}:${mm} ${meridiem}`
    : `${String(hours24).padStart(2, "0")}:${mm}`;
}

/** Compact axis label, `"7 PM"`. */
export function formatHourLabel(
  unixSeconds: number,
  offsetSeconds: number,
): string {
  const { hours12, meridiem } = clockParts(unixSeconds, offsetSeconds);
  return `${hours12} ${meridiem}`;
}

/** `"Monday"` in the city's local time. */
export function formatWeekday(
  unixSeconds: number,
  offsetSeconds: number,
): string {
  return WEEKDAY_LONG.format(shiftToCity(unixSeconds, offsetSeconds));
}

/** `"Mon"` in the city's local time. */
export function formatWeekdayShort(
  unixSeconds: number,
  offsetSeconds: number,
): string {
  return WEEKDAY_SHORT.format(shiftToCity(unixSeconds, offsetSeconds));
}

/**
 * `"YYYY-MM-DD"` in the city's local time. Used to group 3-hourly forecast slots
 * into calendar days and as a stable React key.
 */
export function toCityDateKey(
  unixSeconds: number,
  offsetSeconds: number,
): string {
  const shifted = shiftToCity(unixSeconds, offsetSeconds);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * `"UTC+5:30"`. Used instead of a zone abbreviation: `timeZoneName: "short"`
 * reports the viewer's zone, and OpenWeather gives an offset, not an IANA name.
 */
export function formatUtcOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? "-" : "+";
  const abs = Math.abs(offsetSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);

  return minutes === 0
    ? `UTC${sign}${hours}`
    : `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

/** `"just now"`, `"3m ago"`, `"2h ago"` — for the data-freshness indicator. */
export function formatRelativeTime(
  fromMs: number,
  nowMs: number = Date.now(),
): string {
  const seconds = Math.max(0, Math.round((nowMs - fromMs) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

/** True when the instant falls between sunrise and sunset. Drives day/night art. */
export function isDaytime(
  observedAt: number,
  sunriseAt: number,
  sunsetAt: number,
): boolean {
  return observedAt >= sunriseAt && observedAt < sunsetAt;
}
