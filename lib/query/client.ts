import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

import { isApiError } from "@/lib/api/errors";

const MINUTE = 60 * 1000;

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Weather does not change minute to minute; this also stops the
        // client immediately refetching everything the server just prefetched.
        staleTime: 5 * MINUTE,
        gcTime: 30 * MINUTE,
        refetchOnWindowFocus: false,

        /**
         * Retry only what a retry can fix. A misspelled city returns 404 forever,
         * so retrying it three times just delays the error message by ~7s.
         */
        retry: (failureCount, error) => {
          if (isApiError(error)) {
            return error.retryable && failureCount < 3;
          }
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      },
      dehydrate: {
        /**
         * Also dehydrate *pending* queries (React Query >= 5.40). This lets the
         * server start a fetch and stream the result down as it resolves, rather
         * than blocking the whole Suspense boundary until every request finishes.
         */
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * A fresh client per request on the server so no cache is ever shared between
 * users; a singleton in the browser so navigation preserves the cache.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
