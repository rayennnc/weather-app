import { InvalidResponseError } from '../../../shared/lib/errors';
import { fetchJson } from '../../../shared/lib/http';
import { mapGeocoding } from './geocodingMapper';
import { geocodingResponseSchema } from './geocodingSchema';
import { Place } from '../../../shared/types/place';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const RESULT_COUNT = 10;
const LANGUAGE = 'en';

// two letters only match an exact name and prefixes work from three on
// (Open-Meteo docs), so don't ask before that
export const MIN_QUERY_LENGTH = 3;

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
