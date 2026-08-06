"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Section-level failures are handled inside each
 * section, so reaching this means something outside the data layer broke.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page] render failed", error);
  }, [error]);

  return (
    <main className="padding-x flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 text-center">
      <TriangleAlert
        aria-hidden="true"
        className="size-8 text-destructive sm:size-10 xl:size-12"
      />

      <div className="space-y-1">
        <h1 className="text-lg font-semibold sm:text-xl xl:text-2xl">
          This page didn&apos;t load
        </h1>
        <p className="max-w-md text-xs text-muted-foreground sm:text-sm">
          Something went wrong while rendering the forecast. Trying again will
          usually fix it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <Button onClick={reset}>
        <RefreshCw aria-hidden="true" />
        Try again
      </Button>
    </main>
  );
}
