import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useT } from '../../../shared/i18n/useT';
import { getForecast } from '../data/weatherRepository';
import { getErrorMessageKey } from './errorMessage';
import { type ForecastView, toForecastView } from './forecastView';

// fixed location for now. M4 replaces this with the active saved location
const LOCATION_NAME = 'Jakarta';
const PARAMS = {
  latitude: -6.2146,
  longitude: 106.8451,
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
} as const;

// what the screen can be in. the screen never sees the raw forecast
export type WeatherScreenState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | ({
      status: 'success';
      location: string;
      isRefreshing: boolean;
      refresh: () => void;
    } & ForecastView);

export function useWeatherViewModel(): WeatherScreenState {
  const t = useT();
  const query = useQuery({
    // everything the request depends on goes in the key
    queryKey: ['forecast', PARAMS],
    queryFn: ({ signal }) => getForecast(PARAMS, signal),
  });

  // pull-to-refresh has its own flag: isFetching would also be true for the
  // refetches that happen quietly in the background
  const [isRefreshing, setIsRefreshing] = useState(false);
  function refresh() {
    setIsRefreshing(true);
    query.refetch().finally(() => setIsRefreshing(false));
  }

  // data wins over error: if a refresh fails we keep the last forecast on screen
  if (query.data) {
    return {
      status: 'success',
      location: LOCATION_NAME,
      isRefreshing,
      refresh,
      ...toForecastView(query.data, t, {
        updatedAt: query.dataUpdatedAt,
        windSpeedUnit: PARAMS.windSpeedUnit,
      }),
    };
  }

  if (query.isError) {
    return {
      status: 'error',
      message: t(getErrorMessageKey(query.error)),
      retry: () => {
        query.refetch();
      },
    };
  }

  return { status: 'loading' };
}
