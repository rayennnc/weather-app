import { InvalidResponseError } from '../../../shared/lib/errors';
import { fetchJson } from '../../../shared/lib/http';
import { mapGeocoding } from './geocodingMapper';
import { geocodingResponseSchema } from './geocodingSchema';
import { Place } from './place';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const RESULT_COUNT = 10;
const LANGUAGE = 'en';

// the api returns nothing for a single character, so don't even ask
export const MIN_QUERY_LENGTH = 2;

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const name = query.trim();
  if (name.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const params = [
    `name=${encodeURIComponent(name)}`,
    `count=${RESULT_COUNT}`,
    `language=${LANGUAGE}`,
  ];
  const json = await fetchJson(`${GEOCODING_URL}?${params.join('&')}`, {
    signal,
  });

  const parsed = geocodingResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new InvalidResponseError(
      'Unexpected geocoding response',
      parsed.error,
    );
  }
  return mapGeocoding(parsed.data);
}
