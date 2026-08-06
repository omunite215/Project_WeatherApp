"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/**
 * Section-level failure state.
 *
 * Renders the `userMessage` carried by `ApiError` so copy lives with the error
 * definition instead of being reinvented at each call site. Retry is only offered
 * when a retry could actually help — a misspelled city will 404 forever, and a
 * button that cannot fix anything is worse than no button.
 */
export function ErrorState({
  error,
  onRetry,
  className,
  compact = false,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}) {
  const message = isApiError(error)
    ? error.userMessage
    : "Something went wrong. Try again.";

  const canRetry = Boolean(onRetry) && (!isApiError(error) || error.retryable);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center sm:p-6",
        compact && "p-3 sm:p-4",
        className,
      )}
    >
      <TriangleAlert
        aria-hidden="true"
        className={cn("text-muted-foreground", compact ? "size-5" : "size-6")}
      />
      <p
        className={cn(
          "max-w-prose text-muted-foreground",
          compact ? "text-xs" : "text-xs sm:text-sm",
        )}
      >
        {message}
      </p>
      {canRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
