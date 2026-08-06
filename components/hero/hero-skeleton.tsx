import { Skeleton } from "@/components/ui/skeleton";
import { HERO_HEIGHT } from "@/lib/layout";
import { cn } from "@/lib/utils";

/**
 * Shares `HERO_HEIGHT` with the real hero, so the two are the same size at every
 * breakpoint and the photograph landing shifts nothing below it.
 */
export function HeroSkeleton() {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        HERO_HEIGHT,
      )}
    >
      <Skeleton className="size-full rounded-xl" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5 xl:p-7">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-36 rounded-lg sm:h-16 sm:w-40 xl:h-20 xl:w-48" />
          <Skeleton className="h-6 w-44 rounded-md sm:w-52" />
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-5 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}
