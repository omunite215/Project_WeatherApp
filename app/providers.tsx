"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { getQueryClient } from "@/lib/query/client";

/**
 * Client-side provider stack.
 *
 * `getQueryClient()` returns a per-request client on the server and a singleton in
 * the browser, so no cache is ever shared between users while client navigation
 * still preserves it.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
