/**
 * Maps OpenWeather condition groups to presentation assets.
 *
 * Table-driven so supporting a new condition is a data edit. Contains no React
 * imports, which keeps it usable on the server and unit-testable: icon keys are
 * returned and a component maps them to elements.
 */

/** Hero background slugs, one per file in `public/hero`. */
export const HERO_SLUGS = [
  "clear",
  "clouds",
  "drizzle",
  "fog",
  "rain",
  "sand",
  "smoke",
  "snow",
  "squall",
  "thunderstorm",
  "imageNotFound",
] as const;

export type HeroSlug = (typeof HERO_SLUGS)[number];

export const FALLBACK_HERO_SLUG: HeroSlug = "imageNotFound";

export type WeatherIconKey =
  | "clear-day"
  | "clear-night"
  | "clouds-day"
  | "clouds-night"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm"
  | "fog"
  | "wind"
  | "tornado";

type ConditionEntry = {
  hero: HeroSlug;
  /** Icon when the sun is up, or the only icon if the condition is time-agnostic. */
  icon: WeatherIconKey;
  /** Icon after sunset, where a distinct night variant exists. */
  nightIcon?: WeatherIconKey;
  /** Short label used on forecast chips. */
  label: string;
};

/**
 * Keyed on the lowercased `weather[0].main` group. Covers all fifteen groups
 * OpenWeather documents.
 */
const CONDITIONS: Record<string, ConditionEntry> = {
  thunderstorm: { hero: "thunderstorm", icon: "thunderstorm", label: "Storm" },
  drizzle: { hero: "drizzle", icon: "drizzle", label: "Drizzle" },
  rain: { hero: "rain", icon: "rain", label: "Rain" },
  snow: { hero: "snow", icon: "snow", label: "Snow" },
  clear: {
    hero: "clear",
    icon: "clear-day",
    nightIcon: "clear-night",
    label: "Clear",
  },
  clouds: {
    hero: "clouds",
    icon: "clouds-day",
    nightIcon: "clouds-night",
    label: "Cloudy",
  },
  // Obscuration group: no dedicated art each, so they share the closest match.
  mist: { hero: "fog", icon: "fog", label: "Mist" },
  fog: { hero: "fog", icon: "fog", label: "Fog" },
  haze: { hero: "smoke", icon: "fog", label: "Haze" },
  smoke: { hero: "smoke", icon: "fog", label: "Smoke" },
  ash: { hero: "smoke", icon: "fog", label: "Ash" },
  dust: { hero: "sand", icon: "wind", label: "Dust" },
  sand: { hero: "sand", icon: "wind", label: "Sand" },
  squall: { hero: "squall", icon: "wind", label: "Squall" },
  tornado: { hero: "squall", icon: "tornado", label: "Tornado" },
};

function lookup(group: string): ConditionEntry | undefined {
  return CONDITIONS[group.trim().toLowerCase()];
}

/** Hero image slug for a condition group, falling back to the placeholder. */
export function heroSlugFor(group: string): HeroSlug {
  return lookup(group)?.hero ?? FALLBACK_HERO_SLUG;
}

export function heroImagePathFor(group: string): string {
  return `/hero/${heroSlugFor(group)}.webp`;
}

/**
 * Icon key for a condition group. `isDay` selects the night variant where one
 * exists; conditions without a night variant ignore it.
 */
export function iconKeyFor(group: string, isDay = true): WeatherIconKey {
  const entry = lookup(group);
  if (!entry) return "clouds-day";
  return isDay ? entry.icon : (entry.nightIcon ?? entry.icon);
}

/** Short display label, e.g. `"Storm"` for Thunderstorm. */
export function conditionLabelFor(group: string): string {
  return lookup(group)?.label ?? group;
}

/** True when the group is recognised. Used by tests and diagnostics. */
export function isKnownCondition(group: string): boolean {
  return lookup(group) !== undefined;
}

/** Every group this module handles. Exported so tests can assert full coverage. */
export const KNOWN_CONDITION_GROUPS = Object.keys(CONDITIONS);

/** OpenWeather icon codes end in `d` or `n`. */
export function isDayFromIconCode(iconCode: string): boolean {
  return iconCode.endsWith("d");
}
