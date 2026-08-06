"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useGeolocation } from "@/hooks/use-geolocation";
import { useHydrated } from "@/hooks/use-hydrated";
import { locationToHref } from "@/lib/location";
import { usePreferencesStore } from "@/stores/preferences";
import { useSavedLocationsStore } from "@/stores/saved-locations";

/**
 * Resolves the visitor's own location on a cold visit.
 *
 * Rendered only when the URL carries no coordinates — a shared or bookmarked
 * link already names its city and must never be overridden.
 *
 * Resolution order:
 *   1. The browser's geolocation, asked for exactly once, ever.
 *   2. The last city they looked at, if they declined.
 *   3. `FALLBACK_LOCATION`, which the server already rendered.
 *
 * The page is useful throughout: the server has already streamed the fallback
 * city, so this upgrades a working page rather than gating it behind a
 * permission dialog.
 */
export function LocationBootstrap() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { locate } = useGeolocation();

  const declined = usePreferencesStore((state) => state.autoLocateDeclined);
  const setDeclined = usePreferencesStore(
    (state) => state.setAutoLocateDeclined,
  );
  const recents = useSavedLocationsStore((state) => state.recents);

  const [isLocating, setIsLocating] = useState(false);
  // StrictMode double-invokes effects in development; without this the
  // permission prompt would be requested twice.
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    startedRef.current = true;

    const lastVisited = recents[0];

    if (declined) {
      // Already said no once. Honour the previous answer and use their history.
      if (lastVisited) router.replace(locationToHref(lastVisited));
      return;
    }

    setIsLocating(true);

    void (async () => {
      const result = await locate();
      setIsLocating(false);

      if (result.ok) {
        router.replace(locationToHref(result.location));
        return;
      }

      // Only a refusal is remembered. A timeout or a failed lookup is
      // transient, and shouldn't cost them the feature permanently.
      if (result.reason === "denied") setDeclined(true);

      if (lastVisited) router.replace(locationToHref(lastVisited));
    })();
    // Runs once per mount; `recents`/`declined` are read as initial values on
    // purpose, so a later store update cannot retrigger navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!isLocating) return null;

  return (
    // `output` is the native live-region element, so no explicit role is needed.
    <output className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
      <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
      Finding your location…
    </output>
  );
}
