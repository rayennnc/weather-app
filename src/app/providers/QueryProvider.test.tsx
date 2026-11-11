import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react-native';
import { AppState, Text } from 'react-native';
import { FORECAST_MAX_AGE } from '../../features/weather/data/forecastCache';
import {
  CACHE_VERSION,
  QUERY_CACHE_KEY,
  persistOptions,
} from './queryPersistence';
import { QueryProvider, appQueryClient } from './QueryProvider';

const forecastKey = ['forecast', { latitude: 1, longitude: 2 }];

function Probe() {
  const { data } = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'hello',
  });
  return <Text>{data ?? 'loading'}</Text>;
}

function ForecastProbe({ queryFn }: { queryFn: () => Promise<string> }) {
  const { data } = useQuery({ queryKey: forecastKey, queryFn });
  return <Text>{data ?? 'loading'}</Text>;
}

// a storage of its own for each test, so nothing that a test (or a timer of
// the persister) saves can reach another test
function setup() {
  const data = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => data.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: async (key: string) => {
      data.delete(key);
    },
  };
  const options = {
    ...persistOptions,
    persister: createAsyncStoragePersister({
      storage,
      key: QUERY_CACHE_KEY,
      throttleTime: 0,
    }),
  };
  // no retry and no gc timer, so the test stays fast and Jest can exit
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return { data, options, client };
}

// writes a forecast to the storage the way the app saves it
function saveForecast(
  data: Map<string, string>,
  value: string,
  { age = 0, buster = CACHE_VERSION } = {},
) {
  const source = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  source.setQueryData(forecastKey, value);
  data.set(
    QUERY_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now() - age,
      buster,
      clientState: dehydrate(source, persistOptions.dehydrateOptions),
    }),
  );
}

beforeEach(() => {
  jest.mocked(AppState.addEventListener).mockClear();
});

test('children inside the provider can use useQuery', async () => {
  const { client, options } = setup();

  await render(
    <QueryProvider client={client} persistOptions={options}>
      <Probe />
    </QueryProvider>,
  );

  expect(await screen.findByText('hello')).toBeOnTheScreen();
});

describe('the saved copy on the phone', () => {
  // the network never answers, so what is on screen can only come from the phone
  const neverAnswers = () => jest.fn(() => new Promise<string>(() => {}));

  test('shows a forecast that was saved on the phone', async () => {
    const { data, client, options } = setup();
    saveForecast(data, 'saved weather');

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={neverAnswers()} />
      </QueryProvider>,
    );

    expect(await screen.findByText('saved weather')).toBeOnTheScreen();
  });

  test('still shows a copy that is almost 7 days old', async () => {
    const { data, client, options } = setup();
    saveForecast(data, 'saved weather', { age: FORECAST_MAX_AGE - 1000 });

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={neverAnswers()} />
      </QueryProvider>,
    );

    expect(await screen.findByText('saved weather')).toBeOnTheScreen();
  });

  test('throws away a copy that is older than 7 days', async () => {
    const { data, client, options } = setup();
    saveForecast(data, 'saved weather', { age: FORECAST_MAX_AGE + 1000 });
    const queryFn = neverAnswers();

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={queryFn} />
      </QueryProvider>,
    );

    // the query only starts after the saved copy was read (or thrown away)
    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    expect(client.getQueryData(forecastKey)).toBeUndefined();
    expect(screen.getByText('loading')).toBeOnTheScreen();
  });

  test('throws away a copy saved by another version of the app', async () => {
    const { data, client, options } = setup();
    saveForecast(data, 'saved weather', { buster: 'old-shape' });
    const queryFn = neverAnswers();

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={queryFn} />
      </QueryProvider>,
    );

    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));
    expect(client.getQueryData(forecastKey)).toBeUndefined();
  });

  test('starts normally when the saved copy cannot be read', async () => {
    // the library reports the broken copy on the console. keep the output clean
    const spies = [
      jest.spyOn(console, 'error').mockImplementation(() => {}),
      jest.spyOn(console, 'warn').mockImplementation(() => {}),
    ];
    try {
      const { data, client, options } = setup();
      data.set(QUERY_CACHE_KEY, '{ this is not json');

      await render(
        <QueryProvider client={client} persistOptions={options}>
          <ForecastProbe queryFn={async () => 'fresh weather'} />
        </QueryProvider>,
      );

      expect(await screen.findByText('fresh weather')).toBeOnTheScreen();
    } finally {
      spies.forEach(spy => spy.mockRestore());
    }
  });

  test('keeps the saved forecast when the refresh fails, like it does offline', async () => {
    const { data, client, options } = setup();
    saveForecast(data, 'saved weather', { age: 24 * 60 * 60 * 1000 });
    const queryFn = jest.fn(() => Promise.reject(new Error('offline')));

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={queryFn} />
      </QueryProvider>,
    );

    expect(await screen.findByText('saved weather')).toBeOnTheScreen();
    // the failed refresh moves the query to the error state. the cache is saved
    // again after that (the copy gets a new time), and it must still hold the forecast
    await waitFor(() => {
      const saved = JSON.parse(data.get(QUERY_CACHE_KEY) ?? '{}');
      expect(saved.timestamp).toBeGreaterThan(Date.now() - 60 * 60 * 1000);
    });
    expect(client.getQueryState(forecastKey)?.status).toBe('error');
    expect(data.get(QUERY_CACHE_KEY)).toContain('saved weather');
  });

  test('saves a forecast on the phone once it is fetched', async () => {
    const { data, client, options } = setup();

    await render(
      <QueryProvider client={client} persistOptions={options}>
        <ForecastProbe queryFn={async () => 'fresh weather'} />
      </QueryProvider>,
    );

    expect(await screen.findByText('fresh weather')).toBeOnTheScreen();
    await waitFor(() =>
      expect(data.get(QUERY_CACHE_KEY)).toContain('fresh weather'),
    );
  });
});

test('keeps unused queries as long as a saved forecast may be shown', () => {
  // with the default of 5 minutes, a place you looked at earlier would drop out
  // of memory, and then out of the saved copy too
  expect(appQueryClient.getDefaultOptions().queries?.gcTime).toBe(
    FORECAST_MAX_AGE,
  );
});

test('listens to the app state while it is mounted', async () => {
  const { client, options } = setup();

  await render(
    <QueryProvider client={client} persistOptions={options}>
      <Probe />
    </QueryProvider>,
  );
  // wait until the probe is done, or its last update lands after the test
  await screen.findByText('hello');

  expect(AppState.addEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function),
  );
});
