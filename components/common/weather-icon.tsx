import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Tornado,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { iconKeyFor, type WeatherIconKey } from "@/lib/weather/condition-map";
import { cn } from "@/lib/utils";

/**
 * Renders the icon for a weather condition.
 *
 * The mapping from condition group to icon *key* lives in `lib/weather`, which is
 * React-free and unit-testable; this component only turns a key into an element.
 */
const ICONS: Record<WeatherIconKey, LucideIcon> = {
  "clear-day": Sun,
  "clear-night": Moon,
  "clouds-day": CloudSun,
  "clouds-night": CloudMoon,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
  fog: CloudFog,
  wind: Wind,
  tornado: Tornado,
};

/** Fallback keeps the component total even if a key is ever missing. */
const FALLBACK: LucideIcon = Cloud;

export function WeatherIcon({
  group,
  isDay = true,
  className,
}: {
  /** OpenWeather condition group, e.g. `"Rain"`. */
  group: string;
  isDay?: boolean;
  className?: string;
}) {
  const Icon = ICONS[iconKeyFor(group, isDay)] ?? FALLBACK;
  return <Icon aria-hidden="true" className={cn("size-5", className)} />;
}
