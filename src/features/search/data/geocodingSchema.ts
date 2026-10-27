import { z } from 'zod';

// the api leaves out fields that are empty, so everything except the
// basics is optional
const placeSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  admin1: z.string().optional(),
  country: z.string().optional(),
});

// `results` is missing completely when nothing matches
export const geocodingResponseSchema = z.object({
  results: z.array(placeSchema).optional(),
});

export type GeocodingResponse = z.infer<typeof geocodingResponseSchema>;
