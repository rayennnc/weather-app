import { InvalidResponseError } from '../../../shared/lib/errors';
import jakarta from './__fixtures__/geocoding-jakarta.json';
import noResults from './__fixtures__/geocoding-no-results.json';
import { MIN_QUERY_LENGTH, searchPlaces } from './geocodingRepository';

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

// the url of the first request, so a test can look at its query params
const requestedUrl = () => new URL(String(fetchMock.mock.calls[0][0]));

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('searchPlaces', () => {
  it('searches by name with the count and language from the PRD', async () => {
    fetchMock.mockResolvedValue(jsonResponse(jakarta));

    await searchPlaces('Jakarta');

    const url = requestedUrl();
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://geocoding-api.open-meteo.com/v1/search',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      name: 'Jakarta',
      count: '10',
      language: 'en',
    });
  });

  it('returns the mapped places', async () => {
    fetchMock.mockResolvedValue(jsonResponse(jakarta));

    const places = await searchPlaces('Jakarta');

    expect(places).toHaveLength(2);
    expect(places[0]).toMatchObject({ name: 'Jakarta', country: 'Indonesia' });
  });

  it('returns an empty list when nothing matches', async () => {
    fetchMock.mockResolvedValue(jsonResponse(noResults));

    await expect(searchPlaces('zzzzqxv')).resolves.toEqual([]);
  });

  it('encodes the query and trims it', async () => {
    fetchMock.mockResolvedValue(jsonResponse(noResults));

    await searchPlaces('  São Paulo & co ');

    expect(requestedUrl().searchParams.get('name')).toBe('São Paulo & co');
  });

  it('does not call the api for a query that is too short', async () => {
    expect(MIN_QUERY_LENGTH).toBe(2);

    await expect(searchPlaces('a')).resolves.toEqual([]);
    await expect(searchPlaces('  ')).resolves.toEqual([]);
    await expect(searchPlaces('')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws InvalidResponseError when the response has the wrong shape', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: 'x' }));

    await expect(searchPlaces('Jakarta')).rejects.toBeInstanceOf(
      InvalidResponseError,
    );
  });

  it('cancels the request when the caller aborts', async () => {
    // a fetch that only ends when its signal is aborted
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const controller = new AbortController();

    const request = searchPlaces('Jakarta', controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});
