"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { usePreferencesStore } from "@/stores/preferences";
import type { UnitSystem } from "@/types/domain";

/**
 * Hydration-safe read of the persisted display preferences.
 *
 * Before hydration the defaults are reported so server and client markup match;
 * afterwards the stored values take over.
 */
export function usePreferences(): {
  units: UnitSystem;
  hour12: boolean;
  hydrated: boolean;
} {
  const hydrated = useHydrated();
  const units = usePreferencesStore((state) => state.units);
  const hour12 = usePreferencesStore((state) => state.hour12);

  return {
    units: hydrated ? units : "metric",
    hour12: hydrated ? hour12 : true,
    hydrated,
  };
}
