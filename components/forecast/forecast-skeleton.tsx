import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_HEIGHT, DAY_CHIP_GRID, DAY_CHIP_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";

const CHIPS = ["d1", "d2", "d3", "d4", "d5"] as const;

/**
 * Same footprint as the real panel at every breakpoint: tab row, a chart area
 * sharing `CHART_HEIGHT`, then the chip grid sharing `DAY_CHIP_GRID`.
 */
export function ForecastSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-sm" />
          <Skeleton className="h-8 w-28 rounded-sm" />
          <Skeleton className="h-8 w-16 rounded-sm" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Skeleton className={cn("w-full rounded-lg", CHART_HEIGHT)} />
        <div className={DAY_CHIP_GRID}>
          {CHIPS.map((key) => (
            <Skeleton key={key} className={cn("rounded-lg", DAY_CHIP_HEIGHT)} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
