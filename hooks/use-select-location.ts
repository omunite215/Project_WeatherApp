"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { locationToHref } from "@/lib/location";
import { useSavedLocationsStore } from "@/stores/saved-locations";
import type { CityResult, SavedLocation } from "@/types/domain";

/**
 * Single entry point for changing the active location.
 *
 * Coordinates the two things that must always happen together — navigate to the
 * location's URL and record it in recent searches — so no caller can do one and
 * forget the other.
 */
export function useSelectLocation() {
  const router = useRouter();
  const addRecent = useSavedLocationsStore((state) => state.addRecent);

  return useCallback(
    (city: CityResult | SavedLocation) => {
      const location: SavedLocation = {
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
      };

      addRecent(location);
      router.push(locationToHref(location));
    },
    [addRecent, router],
  );
}
