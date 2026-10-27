import jakarta from './__fixtures__/geocoding-jakarta.json';
import noResults from './__fixtures__/geocoding-no-results.json';
import { geocodingResponseSchema } from './geocodingSchema';

describe('geocodingResponseSchema', () => {
  it('accepts a real response with results', () => {
    const result = geocodingResponseSchema.safeParse(jakarta);

    expect(result.success).toBe(true);
    expect(result.data?.results).toHaveLength(2);
  });

  it('accepts the real response for a search with no results', () => {
    const result = geocodingResponseSchema.safeParse(noResults);

    expect(result.success).toBe(true);
    expect(result.data?.results).toBeUndefined();
  });

  it('accepts a result that only has the basics', () => {
    const response = {
      results: [{ id: 1, name: 'Nowhere', latitude: 1, longitude: 2 }],
    };

    expect(geocodingResponseSchema.safeParse(response).success).toBe(true);
  });

  it('rejects a result without a latitude', () => {
    const response = { results: [{ id: 1, name: 'Nowhere', longitude: 2 }] };

    expect(geocodingResponseSchema.safeParse(response).success).toBe(false);
  });

  it('rejects a result without a longitude', () => {
    const response = { results: [{ id: 1, name: 'Nowhere', latitude: 1 }] };

    expect(geocodingResponseSchema.safeParse(response).success).toBe(false);
  });

  it('rejects results that are not a list', () => {
    expect(geocodingResponseSchema.safeParse({ results: 'x' }).success).toBe(
      false,
    );
  });
});
