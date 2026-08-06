"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Loader2, MapPin, Navigation, Search } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCitySearch } from "@/hooks/use-city-search";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSelectLocation } from "@/hooks/use-select-location";
import { formatLocationLabel } from "@/lib/location";
import { useSavedLocationsStore } from "@/stores/saved-locations";

/**
 * City autocomplete.
 *
 * Queries the geocoding API as the user types (debounced) so they pick a real
 * place, with recent searches and "use my location" as shortcuts.
 */
export function CitySearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isFetching, enabled } = useCitySearch(query);
  const { locate, isLocating, message } = useGeolocation();
  const selectLocation = useSelectLocation();
  const hydrated = useHydrated();
  const recents = useSavedLocationsStore((state) => state.recents);

  // Ctrl/Cmd-K focuses search, the convention users already expect.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelect = (location: Parameters<typeof selectLocation>[0]) => {
    selectLocation(location);
    setOpen(false);
    setQuery("");
  };

  const handleLocate = async () => {
    const result = await locate();
    if (result.ok) handleSelect(result.location);
  };

  const showRecents = hydrated && query.length === 0 && recents.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Search for a city"
          className="flex h-10 w-full max-w-md items-center gap-2 rounded-full border bg-card px-4 text-sm text-muted-foreground transition-colors hover:bg-accent lg:max-w-lg xl:h-11 xl:max-w-xl"
        >
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">Enter city name…</span>
          <kbd className="ml-auto hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
            Ctrl K
          </kbd>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) min-w-80 p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {/* cmdk's own filter is disabled: results are already ranked by the
            geocoding API, and re-filtering them client-side hides valid matches. */}
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 border-b px-3">
            <Search
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder="Search cities…"
            />
            {isFetching && (
              <Loader2
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin text-muted-foreground"
              />
            )}
          </div>

          <CommandList>
            {enabled && !isFetching && results?.length === 0 && (
              <CommandEmpty>No places match “{query}”.</CommandEmpty>
            )}

            {results && results.length > 0 && (
              <CommandGroup heading="Results">
                {results.map((city) => (
                  <CommandItem
                    key={`${city.lat},${city.lon}`}
                    value={`${city.name}-${city.lat}-${city.lon}`}
                    onSelect={() => handleSelect(city)}
                  >
                    <MapPin />
                    {formatLocationLabel(city)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showRecents && (
              <CommandGroup heading="Recent">
                {recents.map((city) => (
                  <CommandItem
                    key={`${city.lat},${city.lon}`}
                    value={`recent-${city.lat}-${city.lon}`}
                    onSelect={() => handleSelect(city)}
                  >
                    <Clock />
                    {formatLocationLabel(city)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup>
              <CommandItem value="use-my-location" onSelect={handleLocate}>
                {isLocating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Navigation />
                )}
                Use my location
              </CommandItem>
            </CommandGroup>

            {message && (
              <p className="px-3 pb-3 pt-1 text-xs text-destructive">
                {message}
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
