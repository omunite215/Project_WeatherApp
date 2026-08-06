"use client";

import { useCallback, useState } from "react";

import { getCityFromCoordinates } from "@/lib/api/client";
import type { SavedLocation } from "@/types/domain";

export type GeolocationFailure = "denied" | "unavailable" | "error";

type GeolocationStatus = "idle" | "locating" | GeolocationFailure;

/**
 * Discriminated result rather than `SavedLocation | null`.
 *
 * Callers need to tell a *denial* apart from a transient failure: a denial is
 * remembered so the browser prompt is never raised again, while a lookup error
 * should stay retryable. Reading `status` after `await` would see the previous
 * render's value, so the reason is returned directly.
 */
export type LocateResult =
  | { ok: true; location: SavedLocation }
  | { ok: false; reason: GeolocationFailure };

const STATUS_MESSAGES: Record<GeolocationFailure, string> = {
  denied: "Location permission was denied. Search for a city instead.",
  unavailable: "This browser can't share your location.",
  error: "Couldn't determine your location. Try searching instead.",
};

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");

  const locate = useCallback(async (): Promise<LocateResult> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return { ok: false, reason: "unavailable" };
    }

    setStatus("locating");

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10_000,
            maximumAge: 5 * 60 * 1000,
          });
        },
      );

      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      const city = await getCityFromCoordinates(coords);
      setStatus("idle");

      // Fall back to raw coordinates when the reverse lookup finds no settlement
      // (mid-ocean, Antarctica) rather than failing the whole action.
      return {
        ok: true,
        location: city ?? {
          name: "My location",
          country: "",
          state: null,
          ...coords,
        },
      };
    } catch (error) {
      const denied =
        typeof GeolocationPositionError !== "undefined" &&
        error instanceof GeolocationPositionError &&
        error.code === error.PERMISSION_DENIED;

      const reason: GeolocationFailure = denied ? "denied" : "error";
      setStatus(reason);
      return { ok: false, reason };
    }
  }, []);

  const message =
    status === "idle" || status === "locating" ? null : STATUS_MESSAGES[status];

  return { locate, status, message, isLocating: status === "locating" };
}
