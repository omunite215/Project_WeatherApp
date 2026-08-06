"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCitySuggestions } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/** Delays propagation of a rapidly changing value. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/**
 * Debounced city autocomplete.
 *
 * Replaces the old exact-name-or-nothing search: the user picks a real place from
 * geocoded results, so a typo produces suggestions instead of a silent failure.
 * Queries shorter than two characters are not sent — they would return noise and
 * burn quota.
 */
export function useCitySearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: queryKeys.citySearch(debouncedQuery),
    queryFn: ({ signal }) => getCitySuggestions(debouncedQuery, signal),
    enabled,
    // Place names are stable; keep results for the whole session.
    staleTime: 60 * 60 * 1000,
  });

  return {
    ...result,
    /** True while the user has typed but the debounce has not yet fired. */
    isDebouncing: enabled && debouncedQuery !== query.trim(),
    enabled,
  };
}
