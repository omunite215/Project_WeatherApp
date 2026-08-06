import { ForecastSkeleton } from "@/components/forecast/forecast-skeleton";
import { HeroSkeleton } from "@/components/hero/hero-skeleton";
import { MetricGridSkeleton } from "@/components/metrics/metric-grid-skeleton";
import { RainCardSkeleton } from "@/components/metrics/rain-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MAIN_GRID, PAGE_CONTAINER } from "@/lib/layout";
import { cn } from "@/lib/utils";

/**
 * Route-level loading UI.
 *
 * Reuses the same skeleton components and the same layout constants as the real
 * page, so the shell shown here reflows at identical breakpoints and nothing
 * shifts when the sections take over.
 */
export default function Loading() {
  return (
    <main className={cn("padding-x pb-16 lg:pb-20", PAGE_CONTAINER)}>
      <div className="flex flex-col gap-4 py-4 lg:gap-5 lg:py-5 xl:gap-6 xl:py-6">
        <HeroSkeleton />

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-24" />
        </div>

        <div className={MAIN_GRID}>
          <div className="flex flex-col gap-4 lg:gap-5 xl:gap-6">
            <MetricGridSkeleton />
            <RainCardSkeleton />
          </div>

          <ForecastSkeleton />
        </div>
      </div>
    </main>
  );
}
