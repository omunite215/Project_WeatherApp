import { NextResponse } from "next/server";

import { fetchCurrentWeather } from "@/lib/api/openweather";
import {
  coordinatesQuerySchema,
  parseQuery,
  withErrorHandling,
} from "@/lib/api/route-helpers";

export const GET = withErrorHandling(async (request) => {
  const { lat, lon } = parseQuery(request, coordinatesQuerySchema);
  const weather = await fetchCurrentWeather({ lat, lon });
  return NextResponse.json(weather);
});
