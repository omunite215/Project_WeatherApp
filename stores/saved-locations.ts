"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SavedLocation } from "@/types/domain";

/**
 * Favourites and recent searches.
 *
 * The active location is not stored here; it lives in the URL query string so the
 * server can prefetch it and the page stays shareable.
 */

const MAX_RECENTS = 6;

export const SAVED_LOCATIONS_VERSION = 1;

export type PersistedSavedLocations = {
  favorites: SavedLocation[];
  recents: SavedLocation[];
};

/** Coordinates outside these ranges cannot name a real place. */
function isValidLocation(value: unknown): value is SavedLocation {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<SavedLocation>;

  return (
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat) &&
    Math.abs(candidate.lat) <= 90 &&
    typeof candidate.lon === "number" &&
    Number.isFinite(candidate.lon) &&
    Math.abs(candidate.lon) <= 180
  );
}

function sanitiseList(value: unknown, limit: number): SavedLocation[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isValidLocation)
    .map((location) => ({
      name: location.name,
      country: typeof location.country === "string" ? location.country : "",
      state: typeof location.state === "string" ? location.state : null,
      lat: location.lat,
      lon: location.lon,
    }))
    .slice(0, limit);
}

/** Drops entries that could not have come from the app, keeping the rest. */
export function migrateSavedLocations(
  persisted: unknown,
): PersistedSavedLocations {
  const saved = (
    typeof persisted === "object" && persisted !== null ? persisted : {}
  ) as Partial<PersistedSavedLocations>;

  return {
    favorites: sanitiseList(saved.favorites, 50),
    recents: sanitiseList(saved.recents, MAX_RECENTS),
  };
}

/** Coordinates make a more reliable identity than names, which repeat globally. */
export function locationId(location: SavedLocation): string {
  return `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`;
}

function sameLocation(a: SavedLocation, b: SavedLocation): boolean {
  return locationId(a) === locationId(b);
}

type SavedLocationsState = {
  favorites: SavedLocation[];
  recents: SavedLocation[];
  toggleFavorite: (location: SavedLocation) => void;
  isFavorite: (location: SavedLocation) => boolean;
  addRecent: (location: SavedLocation) => void;
  clearRecents: () => void;
};

export const useSavedLocationsStore = create<SavedLocationsState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recents: [],

      toggleFavorite: (location) =>
        set((state) => {
          const exists = state.favorites.some((item) =>
            sameLocation(item, location),
          );
          return {
            favorites: exists
              ? state.favorites.filter((item) => !sameLocation(item, location))
              : [...state.favorites, location],
          };
        }),

      isFavorite: (location) =>
        get().favorites.some((item) => sameLocation(item, location)),

      addRecent: (location) =>
        set((state) => ({
          // Re-selecting an existing entry moves it to the front rather than
          // duplicating it.
          recents: [
            location,
            ...state.recents.filter((item) => !sameLocation(item, location)),
          ].slice(0, MAX_RECENTS),
        })),

      clearRecents: () => set({ recents: [] }),
    }),
    {
      name: "omiweather:locations",
      storage: createJSONStorage(() => localStorage),
      version: SAVED_LOCATIONS_VERSION,
      /**
       * Present before `version` ever moves, since a bump without a migration
       * discards the store. Also sanitises on load: `LocationBootstrap`
       * navigates to `recents[0]`, so a malformed entry becomes a bad URL.
       */
      migrate: migrateSavedLocations,
      partialize: (state) => ({
        favorites: state.favorites,
        recents: state.recents,
      }),
    },
  ),
);
