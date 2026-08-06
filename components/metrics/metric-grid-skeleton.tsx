import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { METRIC_GRID_COLS } from "@/lib/layout";
import { cn } from "@/lib/utils";

/** Must stay in step with the tile list in `metric-grid.tsx` or the layout shifts. */
const QUADRANTS = [
  "humidity",
  "sunset",
  "air-quality",
  "sunrise",
  "wind",
  "feels-like",
] as const;

/** Shares `METRIC_GRID_COLS` with the real grid so both reflow at the same widths. */
export function MetricGridSkeleton() {
  return (
    <Card
      className={cn(
        "grid divide-x divide-y overflow-hidden p-0",
        METRIC_GRID_COLS,
      )}
    >
      {QUADRANTS.map((key) => (
        <div
          key={key}
          className="flex items-center gap-3 p-4 sm:p-5 xl:gap-4 xl:p-6"
        >
          <Skeleton className="size-10 shrink-0 rounded-full xl:size-11" />
          <div className="flex w-full flex-col gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </Card>
  );
}
