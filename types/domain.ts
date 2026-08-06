/**
 * Application-facing weather model.
 *
 * Deliberately decoupled from OpenWeather's wire format so a provider swap is
 * confined to `lib/api/openweather.ts`. Components never import wire types.
 *
 * All measurements are stored in canonical SI units (celsius, m/s, metres) and
 * converted at render time from the user's unit preference. That means toggling
 * °C/°F is a pure formatting change and never triggers a refetch.
 */

export type UnitSystem = "metric" | "imperial";

export type Coordinates = {
  lat: number;
  lon: number;
};

export type WeatherCondition = {
  /** OpenWeather condition id, e.g. 800 */
  id: number;
  /** Condition group, e.g. "Clear", "Rain" */
  group: string;
  /** Human description, e.g. "light intensity drizzle" */
  description: string;
  /** OpenWeather icon code, e.g. "04n". Trailing d/n marks day/night. */
  icon: string;
};

export type CurrentWeather = {
  city: string;
  country: string;
  coord: Coordinates;
  /** Seconds to add to a UTC instant to get this city's wall clock. */
  timezoneOffsetSeconds: number;
  /** Observation time, UTC unix seconds. */
  observedAt: number;
  condition: WeatherCondition;
  tempC: number;
  feelsLikeC: number;
  tempMinC: number;
  tempMaxC: number;
  humidityPct: number;
  pressureHpa: number;
  /** Metres. OpenWeather caps this at 10000. */
  visibilityMeters: number;
  windSpeedMs: number;
  windDeg: number;
  windGustMs: number | null;
  cloudsPct: number;
  sunriseAt: number;
  sunsetAt: number;
};

export type ForecastSlot = {
  /** UTC unix seconds. */
  at: number;
  tempC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedMs: number;
  condition: WeatherCondition;
  /** Probability of precipitation, 0..1. */
  precipitationProbability: number;
  /** Rain accumulation over the slot's 3 hour window, mm. */
  rainMm: number;
};

export type ForecastDay = {
  /** `YYYY-MM-DD` in the city's local time, used as a stable React key. */
  date: string;
  /** UTC unix seconds for local midnight; used for weekday labelling. */
  at: number;
  minC: number;
  maxC: number;
  /** Representative condition, taken from the slot closest to local midday. */
  condition: WeatherCondition;
  slots: ForecastSlot[];
};

export type Forecast = {
  city: string;
  country: string;
  coord: Coordinates;
  timezoneOffsetSeconds: number;
  /** Flat 3-hourly series, ascending. */
  slots: ForecastSlot[];
  /** Same data grouped into local calendar days. */
  days: ForecastDay[];
};

/** OpenWeather air quality index. 1 = Good, 5 = Very Poor. */
export type AirQualityIndex = 1 | 2 | 3 | 4 | 5;

export type AirQuality = {
  index: AirQualityIndex;
  components: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
};

export type CityResult = {
  name: string;
  country: string;
  state: string | null;
  lat: number;
  lon: number;
};

/** A place the user has selected, persisted in local storage. */
export type SavedLocation = {
  name: string;
  country: string;
  state: string | null;
  lat: number;
  lon: number;
};
