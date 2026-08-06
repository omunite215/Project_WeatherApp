"use client";

import { Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSelectLocation } from "@/hooks/use-select-location";
import { formatLocationLabel } from "@/lib/location";
import { useSavedLocationsStore } from "@/stores/saved-locations";
import { cn } from "@/lib/utils";
import type { SavedLocation } from "@/types/domain";

/**
 * Pin the current city and jump between pinned ones.
 *
 * Reads are gated on `useHydrated` so the server-rendered markup (an empty list)
 * matches the client's first render before the persisted store loads.
 */
export function FavoritesMenu({ current }: { current: SavedLocation }) {
  const hydrated = useHydrated();
  const favorites = useSavedLocationsStore((state) => state.favorites);
  const toggleFavorite = useSavedLocationsStore(
    (state) => state.toggleFavorite,
  );
  const clearRecents = useSavedLocationsStore((state) => state.clearRecents);
  const selectLocation = useSelectLocation();

  const isCurrentSaved =
    hydrated &&
    favorites.some(
      (item) =>
        item.lat.toFixed(4) === current.lat.toFixed(4) &&
        item.lon.toFixed(4) === current.lon.toFixed(4),
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full sm:size-10 xl:size-11"
          aria-label="Saved places"
        >
          <Star
            className={cn(
              "size-4 sm:size-5",
              isCurrentSaved && "fill-primary text-primary",
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem
          onClick={() => toggleFavorite(current)}
          className="gap-2"
        >
          <Star
            className={cn(
              "size-4",
              isCurrentSaved && "fill-primary text-primary",
            )}
          />
          {isCurrentSaved ? "Remove from saved" : "Save this place"}
        </DropdownMenuItem>

        {hydrated && favorites.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Saved places</DropdownMenuLabel>
            {favorites.map((place) => (
              <DropdownMenuItem
                key={`${place.lat},${place.lon}`}
                onClick={() => selectLocation(place)}
                className="gap-2"
              >
                <Star className="size-4 fill-primary text-primary" />
                <span className="truncate">{formatLocationLabel(place)}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearRecents} className="gap-2">
              <Trash2 className="size-4" />
              Clear recent searches
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
