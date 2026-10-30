import { useQuery } from '@tanstack/react-query';
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
  | ({ status: 'success'; location: string } & ForecastView);

export function useWeatherViewModel(): WeatherScreenState {
  const t = useT();
  const query = useQuery({
    // everything the request depends on goes in the key
    queryKey: ['forecast', PARAMS],
    queryFn: ({ signal }) => getForecast(PARAMS, signal),
  });

  // data wins over error: if a refresh fails we keep the last forecast on screen
  if (query.data) {
    return {
      status: 'success',
      location: LOCATION_NAME,
      ...toForecastView(query.data, t),
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
