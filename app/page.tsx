import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { StatusBar } from "@/components/common/status-bar";
import { ForecastPanel } from "@/components/forecast/forecast-panel";
import { Hero } from "@/components/hero/hero";
import { Navbar } from "@/components/layout/navbar";
import { MetricGrid } from "@/components/metrics/metric-grid";
import { RainCard } from "@/components/metrics/rain-card";
import { LocationBootstrap } from "@/components/layout/location-bootstrap";
import { MAIN_GRID, PAGE_CONTAINER } from "@/lib/layout";
import {
  formatLocationLabel,
  hasExplicitLocation,
  locationFromParams,
} from "@/lib/location";
import { getQueryClient } from "@/lib/query/client";
import { prefetchWeatherData } from "@/lib/query/prefetch";
import { cn } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const location = locationFromParams(await searchParams);
  return {
    title: formatLocationLabel(location),
    description: `Current conditions, air quality and a 5-day forecast for ${formatLocationLabel(location)}.`,
  };
}

/**
 * Server Component: resolves the active location from the URL, warms the query
 * cache, and hands the dehydrated state to the client.
 *
 * The location lives in search params rather than client state so the server can
 * prefetch the correct city on the very first request — which is also what makes
 * the skeletons meaningful, since there is now a real Suspense boundary to fill.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const location = locationFromParams(params);

  // A shared or bookmarked link already names its city; only a cold visit with
  // no coordinates should try to detect where the visitor actually is.
  const shouldDetectLocation = !hasExplicitLocation(params);

  const queryClient = getQueryClient();
  prefetchWeatherData(queryClient, location);

  return (
    <>
      <Navbar location={location} />

      <main
        id="main-content"
        className={cn("padding-x pb-16 lg:pb-20", PAGE_CONTAINER)}
      >
        <HydrationBoundary state={dehydrate(queryClient)}>
          <div className="flex flex-col gap-4 py-4 lg:gap-5 lg:py-5 xl:gap-6 xl:py-6">
            <Hero location={location} />

            {/* Renders nothing unless it is actively locating. */}
            {shouldDetectLocation && <LocationBootstrap />}

            <StatusBar location={location} />

            {/* Metrics take the narrower column; the chart needs the width. */}
            <div className={MAIN_GRID}>
              <div className="flex flex-col gap-4 lg:gap-5 xl:gap-6">
                <MetricGrid location={location} />
                <RainCard location={location} />
              </div>

              <ForecastPanel location={location} />
            </div>
          </div>
        </HydrationBoundary>
      </main>
    </>
  );
}
