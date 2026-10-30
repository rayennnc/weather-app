import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { t } from '../../../shared/i18n/useT';
import { NetworkError } from '../../../shared/lib/errors';
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

beforeEach(() => {
  mockGetForecast.mockReset();
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
    hourly: [{ label: 'Now', temperature: '31°' }],
    daily: [{ label: 'Today', temperatureMax: '32°' }],
  });
});

test('asks for Jakarta in metric units and passes the abort signal on', async () => {
  mockGetForecast.mockResolvedValue(forecast);
  const { wrapper } = setup();

  const { result } = await renderHook(() => useWeatherViewModel(), { wrapper });

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(mockGetForecast).toHaveBeenCalledTimes(1);
  expect(mockGetForecast).toHaveBeenCalledWith(
    {
      latitude: -6.2146,
      longitude: 106.8451,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
    },
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
