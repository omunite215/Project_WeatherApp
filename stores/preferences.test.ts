import { describe, expect, it } from "vitest";

import {
  PREFERENCE_DEFAULTS,
  PREFERENCES_VERSION,
  migratePreferences,
} from "@/stores/preferences";

/**
 * A version mismatch with no migration makes Zustand discard the persisted
 * state, silently resetting the user's preferences.
 */
describe("migratePreferences", () => {
  it("carries v1 preferences forward", () => {
    const v1 = { units: "imperial", hour12: false };

    expect(migratePreferences(v1, 1)).toEqual({
      units: "imperial",
      hour12: false,
      autoLocateDeclined: false,
    });
  });

  it("adds the new v2 field with its default", () => {
    expect(migratePreferences({ units: "metric", hour12: true }, 1))
      .toHaveProperty("autoLocateDeclined", false);
  });

  it("leaves current-version state untouched", () => {
    const v2 = {
      units: "imperial" as const,
      hour12: false,
      autoLocateDeclined: true,
    };
    expect(migratePreferences(v2, PREFERENCES_VERSION)).toEqual(v2);
  });

  it("ignores a v1 payload that somehow already carried the flag", () => {
    // v1 predates the location prompt, so a stored `true` cannot be genuine.
    const result = migratePreferences(
      { units: "metric", hour12: true, autoLocateDeclined: true },
      1,
    );
    expect(result.autoLocateDeclined).toBe(false);
  });

  it("falls back to defaults for junk input rather than throwing", () => {
    expect(migratePreferences(null, 1)).toEqual(PREFERENCE_DEFAULTS);
    expect(migratePreferences(undefined, 1)).toEqual(PREFERENCE_DEFAULTS);
    expect(migratePreferences("corrupt", 1)).toEqual(PREFERENCE_DEFAULTS);
    expect(migratePreferences(42, 1)).toEqual(PREFERENCE_DEFAULTS);
  });

  it("repairs individual fields of the wrong type", () => {
    const result = migratePreferences(
      { units: "kelvin", hour12: "yes", autoLocateDeclined: 1 },
      PREFERENCES_VERSION,
    );
    expect(result).toEqual(PREFERENCE_DEFAULTS);
  });

  it("keeps a partial payload's valid fields", () => {
    expect(migratePreferences({ hour12: false }, PREFERENCES_VERSION)).toEqual({
      units: "metric",
      hour12: false,
      autoLocateDeclined: false,
    });
  });

  it("always returns every key the store expects", () => {
    for (const input of [null, {}, { units: "imperial" }]) {
      expect(Object.keys(migratePreferences(input, 1)).toSorted()).toEqual(
        Object.keys(PREFERENCE_DEFAULTS).toSorted(),
      );
    }
  });
});
