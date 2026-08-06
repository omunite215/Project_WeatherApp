import { NextResponse } from "next/server";

import { fetchForecast } from "@/lib/api/openweather";
import {
  coordinatesQuerySchema,
  parseQuery,
  withErrorHandling,
} from "@/lib/api/route-helpers";

export const GET = withErrorHandling(async (request) => {
  const { lat, lon } = parseQuery(request, coordinatesQuerySchema);
  const forecast = await fetchForecast({ lat, lon });
  return NextResponse.json(forecast);
});
