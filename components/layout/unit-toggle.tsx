"use client";

import { usePreferences } from "@/hooks/use-preferences";
import { usePreferencesStore } from "@/stores/preferences";
import { cn } from "@/lib/utils";
import type { UnitSystem } from "@/types/domain";

const OPTIONS: ReadonlyArray<{
  value: UnitSystem;
  symbol: string;
  label: string;
}> = [
  { value: "metric", symbol: "°C", label: "Celsius" },
  { value: "imperial", symbol: "°F", label: "Fahrenheit" },
];

/**
 * Unit switch.
 *
 * Because the domain model stores canonical metric values and converts at render
 * time, this only changes formatting — it never refetches.
 *
 * Built on real `input[type=radio]` elements rather than buttons with
 * `role="radio"`: a native radio group gives arrow-key navigation, form
 * semantics and screen-reader grouping without reimplementing any of it.
 */
export function UnitToggle() {
  const { units } = usePreferences();
  const setUnits = usePreferencesStore((state) => state.setUnits);

  return (
    <fieldset className="flex h-9 items-center rounded-full border bg-card p-1 sm:h-10 xl:h-11">
      <legend className="sr-only">Temperature units</legend>

      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className={cn(
            "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
            units === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <input
            type="radio"
            name="unit-system"
            value={option.value}
            checked={units === option.value}
            onChange={() => setUnits(option.value)}
            className="sr-only"
          />
          <span aria-hidden="true">{option.symbol}</span>
          <span className="sr-only">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
