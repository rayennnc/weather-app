import { z } from 'zod';

// mirrors the open-meteo json, only the fields we use (zod drops the rest).
// the mapper turns this into the app's own model

const currentSchema = z.object({
  time: z.string(),
  temperature_2m: z.number(),
  apparent_temperature: z.number(),
  relative_humidity_2m: z.number(),
  is_day: z.number(), // 1 or 0
  precipitation: z.number(),
  weather_code: z.number(),
  wind_speed_10m: z.number(),
  wind_direction_10m: z.number(),
});

// one value per hour, so every field is an array
const hourlySchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  // not every weather model provides this, so it can be null
  precipitation_probability: z.array(z.number().nullable()),
  weather_code: z.array(z.number()),
  is_day: z.array(z.number()),
});

const dailySchema = z.object({
  time: z.array(z.string()),
  weather_code: z.array(z.number()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  precipitation_probability_max: z.array(z.number().nullable()),
  sunrise: z.array(z.string()),
  sunset: z.array(z.string()),
  uv_index_max: z.array(z.number().nullable()),
});

export const forecastResponseSchema = z.object({
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  current: currentSchema,
  hourly: hourlySchema,
  daily: dailySchema,
});

export type ForecastResponse = z.infer<typeof forecastResponseSchema>;
