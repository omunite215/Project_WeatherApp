import { NextResponse } from "next/server";

import { reverseGeocode, searchCities } from "@/lib/api/openweather";
import {
  coordinatesQuerySchema,
  parseQuery,
  searchQuerySchema,
  withErrorHandling,
} from "@/lib/api/route-helpers";

/**
 * Handles both directions of geocoding:
 *   `?q=paris`          forward  — autocomplete suggestions
 *   `?lat=..&lon=..`    reverse  — naming the device's coordinates
 *
 * Both return `CityResult[]`, so the client has one response shape to handle.
 */
export const GET = withErrorHandling(async (request) => {
  const params = new URL(request.url).searchParams;

  if (params.has("lat") && params.has("lon")) {
    const { lat, lon } = parseQuery(request, coordinatesQuerySchema);
    const result = await reverseGeocode({ lat, lon });
    return NextResponse.json(result ? [result] : []);
  }

  const { q, limit } = parseQuery(request, searchQuerySchema);
  const results = await searchCities(q, limit ?? 5);
  return NextResponse.json(results);
});
