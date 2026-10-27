import jakarta from './__fixtures__/geocoding-jakarta.json';
import noResults from './__fixtures__/geocoding-no-results.json';
import { mapGeocoding } from './geocodingMapper';
import { geocodingResponseSchema } from './geocodingSchema';

describe('mapGeocoding', () => {
  it('maps the real response to places', () => {
    const places = mapGeocoding(geocodingResponseSchema.parse(jakarta));

    expect(places).toHaveLength(2);
    expect(places[0]).toEqual({
      id: 1642911,
      name: 'Jakarta',
      region: 'Jakarta Special Capital Region',
      country: 'Indonesia',
      latitude: -6.21462,
      longitude: 106.84513,
    });
    expect(places[1]).toMatchObject({ id: 6754874, name: 'Jakarta Pusat' });
  });

  it('returns an empty list when the api found nothing', () => {
    expect(mapGeocoding(geocodingResponseSchema.parse(noResults))).toEqual([]);
  });

  it('uses null for a region or country that is missing or empty', () => {
    const [place] = mapGeocoding({
      results: [
        { id: 1, name: 'Nowhere', latitude: 1, longitude: 2, admin1: '' },
      ],
    });

    expect(place.region).toBeNull();
    expect(place.country).toBeNull();
  });
});
