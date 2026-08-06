"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UnitSystem } from "@/types/domain";

/**
 * Display preferences. Holds no weather data; that is TanStack Query's job.
 *
 * The domain model stores canonical metric values and converts at render time,
 * so flipping units is a formatting change and never triggers a refetch.
 */

export const PREFERENCES_VERSION = 2;

/** The persisted slice. Actions are recreated on load and are never stored. */
export type PersistedPreferences = {
  units: UnitSystem;
  hour12: boolean;
  autoLocateDeclined: boolean;
};

type PreferencesState = PersistedPreferences & {
  setUnits: (units: UnitSystem) => void;
  toggleUnits: () => void;
  setHour12: (hour12: boolean) => void;
  setAutoLocateDeclined: (declined: boolean) => void;
};

export const PREFERENCE_DEFAULTS: PersistedPreferences = {
  units: "metric",
  /** 12-hour clock when true, 24-hour when false. */
  hour12: true,
  /**
   * Set when the user turns down the automatic location prompt, so the browser
   * permission dialog is raised at most once.
   */
  autoLocateDeclined: false,
};

/**
 * Upgrades state written by an older build. Required whenever `version` moves:
 * on a version mismatch with no migration, Zustand discards the saved state.
 *
 * Exported so it can be unit tested against payloads this build never writes.
 *
 *   v1 → v2  adds `autoLocateDeclined`
 */
export function migratePreferences(
  persisted: unknown,
  version: number,
): PersistedPreferences {
  const saved = (
    typeof persisted === "object" && persisted !== null ? persisted : {}
  ) as Partial<PersistedPreferences>;

  // Repair per field rather than discarding: a partial read keeps what it can.
  const merged: PersistedPreferences = {
    units: saved.units === "imperial" ? "imperial" : PREFERENCE_DEFAULTS.units,
    hour12:
      typeof saved.hour12 === "boolean"
        ? saved.hour12
        : PREFERENCE_DEFAULTS.hour12,
    autoLocateDeclined:
      typeof saved.autoLocateDeclined === "boolean"
        ? saved.autoLocateDeclined
        : PREFERENCE_DEFAULTS.autoLocateDeclined,
  };

  // v1 predates the location prompt, so a stored flag cannot be genuine.
  if (version < 2) {
    merged.autoLocateDeclined = PREFERENCE_DEFAULTS.autoLocateDeclined;
  }

  return merged;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...PREFERENCE_DEFAULTS,
      setUnits: (units) => set({ units }),
      toggleUnits: () =>
        set((state) => ({
          units: state.units === "metric" ? "imperial" : "metric",
        })),
      setHour12: (hour12) => set({ hour12 }),
      setAutoLocateDeclined: (autoLocateDeclined) =>
        set({ autoLocateDeclined }),
    }),
    {
      name: "omiweather:preferences",
      storage: createJSONStorage(() => localStorage),
      version: PREFERENCES_VERSION,
      migrate: migratePreferences,
      partialize: (state) => ({
        units: state.units,
        hour12: state.hour12,
        autoLocateDeclined: state.autoLocateDeclined,
      }),
    },
  ),
);
