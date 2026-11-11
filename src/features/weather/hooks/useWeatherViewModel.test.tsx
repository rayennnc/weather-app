import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { t } from '../../../shared/i18n/useT';
import { NetworkError } from '../../../shared/lib/errors';
import {
  DEFAULT_LOCATION,
  useLocationStore,
} from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { MY_LOCATION_ID } from '../../../shared/utils/placeName';
import { FORECAST_MAX_AGE } from '../data/forecastCache';
import { getForecast } from '../data/weatherRepository';
import type { Forecast } from '../data/forecast';
import { useWeatherViewModel } from './useWeatherViewModel';

jest.mock('../data/weatherRepository');
const mockGetForecast = jest.mocked(getForecast);

const forecast: Forecast = {
  timezone: 'Asia/Jakarta',
  utcOffsetSeconds: 25200,
  current: {
    time: '2026-10-28T14:00',
    temperature: 30.6,
    apparentTemperature: 34.2,
    humidity: 70,
    isDay: true,
    precipitation: 0,
    condition: 'partlyCloudy',
    windSpeed: 9.4,
    windDirection: 180,
  },
  hourly: [
    {
      time: '2026-10-28T14:00',
      temperature: 30.6,
      precipitationProbability: 40,
      condition: 'partlyCloudy',
      isDay: true,
    },
  ],
  daily: [
    {
      date: '2026-10-28',
      condition: 'rain',
      temperatureMax: 32.2,
      temperatureMin: 24.6,
      precipitationProbabilityMax: 80,
      sunrise: '2026-10-28T05:41',
      sunset: '2026-10-28T17:52',
      uvIndexMax: 11,
    },
  ],
};

// a fresh client per test. no retry, and no gc timer so Jest can exit
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
};

// 07:20 UTC is 14:20 in Jakarta, the hour of the forecast above. the clock is
// fixed, so "Now" and "Today" do not depend on the day the test runs
const NOW = Date.UTC(2026, 9, 28, 7, 20);
const HOUR = 60 * 60 * 1000;
let nowSpy: jest.SpyInstance<number, []>;

beforeEach(() => {
  nowSpy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  mockGetForecast.mockReset();
  // the saved location is already read, unless a test says otherwise
  useLocationStore.setState({
    activeLocation: DEFAULT_LOCATION,
    savedLocations: [DEFAULT_LOCATION],
    hasHydrated: true,
  });
});

afterEach(() => {
  nowSpy.mockRestore();
});

test('starts in the loading state', async () => {
  mockGetForecast.mockReturnValue(new Promise<Forecast>(() => {}));
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  expect(result.current).toEqual({ status: 'loading' });
});

test('turns the forecast into display-ready values', async () => {
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current).toMatchObject({
    status: 'success',
    location: 'Jakarta',
    current: {
      condition: 'partlyCloudy',
      isDay: true,
      temperature: '31°',
      conditionText: 'Partly cloudy',
      feelsLike: 'Feels like 34°',
    },
    updated: expect.stringMatching(/^Updated \d{2}:\d{2}$/),
    hourly: [{ label: 'Now', temperature: '31°' }],
    daily: [{ label: 'Today', temperatureMax: '32°' }],
    details: expect.arrayContaining([
      expect.objectContaining({ id: 'wind', value: '9 km/h' }),
    ]),
  });
});

test('asks for the active location in metric units and passes the abort signal on', async () => {
  useLocationStore.setState({ activeLocation: bandung });
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(mockGetForecast).toHaveBeenCalledTimes(1);
  expect(mockGetForecast).toHaveBeenCalledWith(
    {
      latitude: bandung.latitude,
      longitude: bandung.longitude,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
    },
    expect.any(AbortSignal),
  );
  expect(result.current).toMatchObject({ location: 'Bandung' });
});

test('names the place the gps found "My location"', async () => {
  const fromGps: Place = {
    id: MY_LOCATION_ID,
    name: '',
    region: null,
    country: null,
    latitude: 10,
    longitude: 20,
  };
  useLocationStore.setState({ activeLocation: fromGps });
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current).toMatchObject({ location: t('locations.myLocation') });
  expect(mockGetForecast).toHaveBeenCalledWith(
    expect.objectContaining({ latitude: 10, longitude: 20 }),
    expect.any(AbortSignal),
  );
});

test('waits for the saved location before it fetches', async () => {
  useLocationStore.setState({ hasHydrated: false });
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  expect(result.current).toEqual({ status: 'loading' });
  expect(mockGetForecast).not.toHaveBeenCalled();

  await act(async () => {
    useLocationStore.setState({ hasHydrated: true });
  });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(mockGetForecast).toHaveBeenCalledTimes(1);
});

test('fetches the new location when the active location changes', async () => {
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  await waitFor(() =>
    expect(result.current).toMatchObject({ location: 'Jakarta' }),
  );

  await act(async () => {
    useLocationStore.getState().selectLocation(bandung);
  });

  await waitFor(() =>
    expect(result.current).toMatchObject({ location: 'Bandung' }),
  );
  expect(mockGetForecast).toHaveBeenCalledTimes(2);
  expect(mockGetForecast).toHaveBeenLastCalledWith(
    expect.objectContaining({ latitude: bandung.latitude }),
    expect.any(AbortSignal),
  );
});

test('shows the mapped message when the request fails', async () => {
  mockGetForecast.mockRejectedValue(
    new NetworkError('timeout', { timedOut: true }),
  );
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current).toMatchObject({ message: t('error.timeout') });
});

test('retry loads again and ends in success', async () => {
  mockGetForecast
    .mockRejectedValueOnce(new NetworkError('offline'))
    .mockResolvedValueOnce(forecast);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('error'));

  if (result.current.status !== 'error') {
    throw new Error('expected the error state');
  }
  const { retry } = result.current;
  await act(async () => {
    retry();
  });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(mockGetForecast).toHaveBeenCalledTimes(2);
});

test('keeps showing the last forecast when a refresh fails', async () => {
  mockGetForecast
    .mockResolvedValueOnce(forecast)
    .mockRejectedValueOnce(new NetworkError('offline'));
  const { client, wrapper } = setup();
  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('success'));

  await act(async () => {
    await client.refetchQueries();
    // tanstack tells react about changes from a 0ms timer. wait one tick inside act
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  expect(mockGetForecast).toHaveBeenCalledTimes(2);
  expect(result.current.status).toBe('success');
});

test('refresh turns isRefreshing on until the new forecast is in', async () => {
  let finish: (value: Forecast) => void = () => {};
  mockGetForecast.mockResolvedValueOnce(forecast).mockReturnValueOnce(
    new Promise<Forecast>(resolve => {
      finish = resolve;
    }),
  );
  const { wrapper } = setup();
  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current).toMatchObject({ isRefreshing: false });

  if (result.current.status !== 'success') {
    throw new Error('expected the success state');
  }
  const { refresh } = result.current;
  await act(async () => {
    refresh();
  });
  expect(result.current).toMatchObject({ isRefreshing: true });

  await act(async () => {
    finish(forecast);
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
  await waitFor(() =>
    expect(result.current).toMatchObject({ isRefreshing: false }),
  );
  expect(mockGetForecast).toHaveBeenCalledTimes(2);
});

test('draws a forecast that is hours old against the clock of now', async () => {
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();
  const { result, rerender } = await renderHook(() => useWeatherViewModel(), {
    wrapper,
  });
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current).toMatchObject({ hourly: [{ label: 'Now' }] });

  // it is 17:20 in Jakarta now, so the only hour of the forecast is over
  nowSpy.mockReturnValue(NOW + 3 * HOUR);
  await rerender(undefined);

  expect(result.current).toMatchObject({
    status: 'success',
    updated: 'Updated 14:20',
    hourly: [],
  });
});

test('says on which day an older forecast is from', async () => {
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();
  const { result, rerender } = await renderHook(() => useWeatherViewModel(), {
    wrapper,
  });
  await waitFor(() => expect(result.current.status).toBe('success'));

  nowSpy.mockReturnValue(NOW + 24 * HOUR);
  await rerender(undefined);

  // the only day of the forecast is yesterday now, so it is dropped
  expect(result.current).toMatchObject({
    updated: 'Updated Wed 14:20',
    daily: [],
  });
});

test('shows a forecast up to 7 days old and not older', async () => {
  mockGetForecast
    .mockResolvedValueOnce(forecast)
    .mockReturnValue(new Promise<Forecast>(() => {}));
  const { wrapper } = setup();
  const { result, rerender } = await renderHook(() => useWeatherViewModel(), {
    wrapper,
  });
  await waitFor(() => expect(result.current.status).toBe('success'));

  nowSpy.mockReturnValue(NOW + FORECAST_MAX_AGE);
  await rerender(undefined);
  expect(result.current.status).toBe('success');

  nowSpy.mockReturnValue(NOW + FORECAST_MAX_AGE + 1);
  await rerender(undefined);
  expect(result.current).toEqual({ status: 'loading' });
});

test('shows the error when the refresh fails and the forecast is too old', async () => {
  mockGetForecast
    .mockResolvedValueOnce(forecast)
    .mockRejectedValueOnce(new NetworkError('offline'));
  const { client, wrapper } = setup();
  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });
  await waitFor(() => expect(result.current.status).toBe('success'));

  nowSpy.mockReturnValue(NOW + FORECAST_MAX_AGE + 1);
  await act(async () => {
    await client.refetchQueries();
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  expect(result.current).toMatchObject({
    status: 'error',
    message: t('error.network'),
  });
});
