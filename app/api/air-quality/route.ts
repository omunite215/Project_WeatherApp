import { NextResponse } from "next/server";

import { fetchAirQuality } from "@/lib/api/openweather";
import {
  coordinatesQuerySchema,
  parseQuery,
  withErrorHandling,
} from "@/lib/api/route-helpers";

export const GET = withErrorHandling(async (request) => {
  const { lat, lon } = parseQuery(request, coordinatesQuerySchema);
  const airQuality = await fetchAirQuality({ lat, lon });
  return NextResponse.json(airQuality);
});
