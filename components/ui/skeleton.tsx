import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Placeholder surface shown while data loads.
 *
 * Every skeleton in this app is sized to match the component it stands in for, so
 * content does not shift when the real data arrives.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
