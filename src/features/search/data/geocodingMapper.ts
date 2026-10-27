import { GeocodingResponse } from './geocodingSchema';
import { Place } from './place';

export function mapGeocoding(response: GeocodingResponse): Place[] {
  return (response.results ?? []).map(result => ({
    id: result.id,
    name: result.name,
    // `||` so an empty string counts as missing too
    region: result.admin1 || null,
    country: result.country || null,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}
