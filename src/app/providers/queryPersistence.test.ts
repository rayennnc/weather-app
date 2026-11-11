import { QueryClient, dehydrate } from '@tanstack/react-query';
import { FORECAST_MAX_AGE } from '../../features/weather/data/forecastCache';
import { persistOptions, shouldPersistQuery } from './queryPersistence';

const forecastKey = ['forecast', { latitude: 1, longitude: 2 }];

function createClient() {
  // no retry and no gc timer, so the test stays fast and Jest can exit
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

// what would be written to the phone for this client
function savedKeys(client: QueryClient) {
  return dehydrate(client, persistOptions.dehydrateOptions).queries.map(
    query => query.queryKey,
  );
}

describe('what is saved on the phone', () => {
  test('saves a forecast', () => {
    const client = createClient();
    client.setQueryData(forecastKey, 'sunny');

    expect(savedKeys(client)).toEqual([forecastKey]);
  });

  test('does not save anything else, such as a search', () => {
    const client = createClient();
    client.setQueryData(['search', 'jakarta'], ['Jakarta']);

    expect(savedKeys(client)).toEqual([]);
  });

  test('still saves a forecast whose refresh failed, with its last data', async () => {
    const client = createClient();
    client.setQueryData(forecastKey, 'sunny');
    await client
      .fetchQuery({
        queryKey: forecastKey,
        queryFn: () => Promise.reject(new Error('offline')),
        staleTime: 0,
      })
      .catch(() => {});
    // the failed refresh moved the query to the error state
    expect(client.getQueryState(forecastKey)?.status).toBe('error');

    expect(savedKeys(client)).toEqual([forecastKey]);
    expect(client.getQueryData(forecastKey)).toBe('sunny');
  });

  test('does not save a forecast that never had data', async () => {
    const client = createClient();
    client.getQueryCache().build(client, { queryKey: forecastKey });
    const failed = ['forecast', { latitude: 3, longitude: 4 }];
    await client
      .fetchQuery({
        queryKey: failed,
        queryFn: () => Promise.reject(new Error('offline')),
      })
      .catch(() => {});

    expect(savedKeys(client)).toEqual([]);
  });

  test('can be used as a plain predicate', () => {
    const client = createClient();
    client.setQueryData(forecastKey, 'sunny');
    const query = client.getQueryCache().find({ queryKey: forecastKey });

    expect(query && shouldPersistQuery(query)).toBe(true);
  });
});

describe('how long it is kept', () => {
  test('keeps the saved copy as long as a forecast may be shown', () => {
    expect(persistOptions.maxAge).toBe(FORECAST_MAX_AGE);
  });
});
