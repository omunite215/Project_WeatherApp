import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError } from "@/lib/api/errors";

/**
 * Shared plumbing for the route handlers so each one only expresses what is
 * unique to it: which params it takes and which adapter call it makes.
 */

export const coordinatesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(10).optional(),
});

/** Parses search params with a schema, throwing a typed `BAD_REQUEST` on failure. */
export function parseQuery<T>(
  request: Request,
  schema: z.ZodType<T>,
): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    throw new ApiError(
      "BAD_REQUEST",
      400,
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  }

  return parsed.data;
}

/**
 * Converts any thrown value into the standard error body. Unknown errors are
 * logged server-side but reported generically, so internal detail never reaches
 * the browser.
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      console.error(`[api] ${error.code}: ${error.message}`);
    }
    return NextResponse.json(error.toResponseBody(), { status: error.status });
  }

  console.error("[api] unhandled error", error);
  const fallback = new ApiError("UNKNOWN", 500);
  return NextResponse.json(fallback.toResponseBody(), { status: 500 });
}

/** Wraps a handler so every route shares the same error contract. */
export function withErrorHandling(
  handler: (request: Request) => Promise<NextResponse>,
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
