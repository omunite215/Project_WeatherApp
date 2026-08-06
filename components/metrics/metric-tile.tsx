import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One quadrant of the metric card.
 *
 * One props contract that every metric satisfies, so tiles are interchangeable
 * and reordering the grid needs no component changes. `accent` tints the icon,
 * carrying the air-quality band colour.
 */
export type MetricTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Optional secondary line, e.g. an air-quality descriptor. */
  detail?: string;
  /** CSS colour applied to the icon. */
  accent?: string;
  className?: string;
};

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  accent,
  className,
}: MetricTileProps) {
  return (
    <div
      data-reveal
      className={cn(
        "flex items-center gap-3 p-4 sm:p-5 xl:gap-4 xl:p-6",
        className,
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 xl:size-11"
        style={accent ? { backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)` } : undefined}
      >
        <Icon
          aria-hidden="true"
          className="size-5 text-primary"
          style={accent ? { color: accent } : undefined}
        />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        <p className="truncate font-semibold xl:text-lg">{value}</p>
        {/* Advice copy is the first thing to go when the tile is narrow. */}
        {detail && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
