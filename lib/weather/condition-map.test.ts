import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  FALLBACK_HERO_SLUG,
  HERO_SLUGS,
  conditionLabelFor,
  heroImagePathFor,
  heroSlugFor,
  iconKeyFor,
  isDayFromIconCode,
  isKnownCondition,
} from "@/lib/weather/condition-map";

/** Every condition group OpenWeather documents. */
const OPENWEATHER_GROUPS = [
  "Thunderstorm",
  "Drizzle",
  "Rain",
  "Snow",
  "Mist",
  "Smoke",
  "Haze",
  "Dust",
  "Fog",
  "Sand",
  "Ash",
  "Squall",
  "Tornado",
  "Clear",
  "Clouds",
] as const;

const PUBLIC_HERO_DIR = join(process.cwd(), "public", "hero");

describe("hero image mapping", () => {
  it.each(OPENWEATHER_GROUPS)("recognises %s", (group) => {
    expect(isKnownCondition(group)).toBe(true);
  });

  /** Guards against a 404, which types cannot catch. */
  it.each(OPENWEATHER_GROUPS)("resolves %s to a file on disk", (group) => {
    const slug = heroSlugFor(group);
    expect(existsSync(join(PUBLIC_HERO_DIR, `${slug}.webp`))).toBe(true);
  });

  it("every declared slug has a matching asset", () => {
    for (const slug of HERO_SLUGS) {
      expect(existsSync(join(PUBLIC_HERO_DIR, `${slug}.webp`))).toBe(true);
    }
  });

  it("is case insensitive", () => {
    expect(heroSlugFor("RAIN")).toBe("rain");
    expect(heroSlugFor("rain")).toBe("rain");
    expect(heroSlugFor(" Rain ")).toBe("rain");
  });

  it("falls back for unknown groups instead of returning a broken path", () => {
    expect(heroSlugFor("Sharknado")).toBe(FALLBACK_HERO_SLUG);
    expect(heroImagePathFor("")).toBe(`/hero/${FALLBACK_HERO_SLUG}.webp`);
  });

  it("routes obscuration groups to their closest art", () => {
    expect(heroSlugFor("Mist")).toBe("fog");
    expect(heroSlugFor("Haze")).toBe("smoke");
    expect(heroSlugFor("Ash")).toBe("smoke");
    expect(heroSlugFor("Dust")).toBe("sand");
    expect(heroSlugFor("Tornado")).toBe("squall");
  });
});

describe("icon selection", () => {
  it("swaps in night variants where they exist", () => {
    expect(iconKeyFor("Clear", true)).toBe("clear-day");
    expect(iconKeyFor("Clear", false)).toBe("clear-night");
    expect(iconKeyFor("Clouds", true)).toBe("clouds-day");
    expect(iconKeyFor("Clouds", false)).toBe("clouds-night");
  });

  it("ignores time of day for conditions with no night variant", () => {
    expect(iconKeyFor("Rain", true)).toBe("rain");
    expect(iconKeyFor("Rain", false)).toBe("rain");
  });

  it("falls back for unknown groups", () => {
    expect(iconKeyFor("Sharknado")).toBe("clouds-day");
  });

  it("reads day/night from OpenWeather icon codes", () => {
    expect(isDayFromIconCode("04d")).toBe(true);
    expect(isDayFromIconCode("04n")).toBe(false);
  });
});

describe("labels", () => {
  it("shortens verbose group names", () => {
    expect(conditionLabelFor("Thunderstorm")).toBe("Storm");
    expect(conditionLabelFor("Clouds")).toBe("Cloudy");
  });

  it("passes unknown groups through unchanged", () => {
    expect(conditionLabelFor("Sharknado")).toBe("Sharknado");
  });
});
