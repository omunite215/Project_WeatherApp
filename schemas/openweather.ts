import { z } from "zod";

/**
 * Wire schemas for the OpenWeather responses this app consumes.
 *
 * These run inside the route handlers, so a malformed or changed upstream payload
 * fails loudly on the server with a clear message instead of surfacing in a
 * component as `undefined.weather[0]`.
 *
 * Fields OpenWeather documents as conditional are modelled `.optional()` rather
 * than required: `wind.gust` and `rain` are frequently absent, and treating them
 * as required would reject perfectly valid responses.
 */

const conditionSchema = z.object({
  id: z.number(),
  main: z.string(),
  description: z.string(),
  icon: z.string(),
});

const coordSchema = z.object({
  lon: z.number(),
  lat: z.number(),
});

export const currentWeatherWireSchema = z.object({
  coord: coordSchema,
  weather: z.array(conditionSchema).min(1),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    pressure: z.number(),
    humidity: z.number(),
  }),
  visibility: z.number().optional(),
  wind: z.object({
    speed: z.number(),
    deg: z.number(),
    gust: z.number().optional(),
  }),
  clouds: z.object({ all: z.number() }),
  dt: z.number(),
  sys: z.object({
    country: z.string().optional(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
  timezone: z.number(),
  id: z.number(),
  name: z.string(),
});

export const forecastWireSchema = z.object({
  list: z
    .array(
      z.object({
        dt: z.number(),
        main: z.object({
          temp: z.number(),
          feels_like: z.number(),
          temp_min: z.number(),
          temp_max: z.number(),
          humidity: z.number(),
        }),
        weather: z.array(conditionSchema).min(1),
        wind: z.object({
          speed: z.number(),
          deg: z.number(),
          gust: z.number().optional(),
        }),
        pop: z.number().optional(),
        rain: z.object({ "3h": z.number() }).optional(),
        dt_txt: z.string(),
      }),
    )
    .min(1),
  city: z.object({
    name: z.string(),
    coord: coordSchema,
    country: z.string().optional(),
    timezone: z.number(),
  }),
});

export const airQualityWireSchema = z.object({
  list: z
    .array(
      z.object({
        main: z.object({ aqi: z.number().int().min(1).max(5) }),
        components: z.object({
          co: z.number(),
          no2: z.number(),
          o3: z.number(),
          so2: z.number(),
          pm2_5: z.number(),
          pm10: z.number(),
        }),
      }),
    )
    .min(1),
});

export const geocodeWireSchema = z.array(
  z.object({
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    country: z.string(),
    state: z.string().optional(),
  }),
);

export type CurrentWeatherWire = z.infer<typeof currentWeatherWireSchema>;
export type ForecastWire = z.infer<typeof forecastWireSchema>;
export type AirQualityWire = z.infer<typeof airQualityWireSchema>;
export type GeocodeWire = z.infer<typeof geocodeWireSchema>;
