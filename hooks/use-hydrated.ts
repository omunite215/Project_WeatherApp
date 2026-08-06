"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False during SSR and the first client render, true afterwards.
 *
 * Persisted Zustand state is only available in the browser, so reading it during
 * the first render produces markup that disagrees with the server's. Gating on
 * this hook keeps the first paint identical on both sides and swaps in the stored
 * value on the next commit.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
