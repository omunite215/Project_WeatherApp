"use client";

import { useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { formatRelativeTime } from "@/lib/format/time";
import { queryKeys } from "@/lib/query/keys";
import type { SavedLocation } from "@/types/domain";

/**
 * Connectivity and data-freshness strip.
 *
 * Without this, cached readings look identical to live ones — the user has no way
 * to tell whether "13°" is current or forty minutes stale. Shows when the data was
 * last fetched, warns when offline, and offers a manual refresh.
 */
export function StatusBar({ location }: { location: SavedLocation }) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;

  const [, forceTick] = useState(0);
  const updatedAt = queryClient.getQueryState(queryKeys.weather(location))
    ?.dataUpdatedAt;

  // Re-render each minute so the relative label stays honest while idle.
  useEffect(() => {
    const timer = setInterval(() => forceTick((value) => value + 1), 60_000);
    return () => clearInterval(timer);
  }, []);

  const refreshAll = () => {
    void queryClient.invalidateQueries();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
      <span className="flex items-center gap-1.5">
        {!isOnline && (
          <>
            <WifiOff aria-hidden="true" className="size-3.5 text-destructive" />
            {/* Shortened below `sm` so the row does not wrap to two lines. */}
            <span className="text-destructive">
              Offline<span className="hidden sm:inline"> — showing saved data</span>
            </span>
            <span aria-hidden="true">·</span>
          </>
        )}
        {updatedAt ? `Updated ${formatRelativeTime(updatedAt)}` : "Loading…"}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={refreshAll}
        disabled={isFetching || !isOnline}
        className="h-7 gap-1.5 px-2 text-xs sm:h-8 sm:text-sm"
      >
        <RefreshCw
          aria-hidden="true"
          className={isFetching ? "animate-spin" : undefined}
        />
        Refresh
      </Button>
    </div>
  );
}
