import { useQuery } from '@tanstack/react-query';
import { useT } from '../../../shared/i18n/useT';
import { formatTemperature } from '../../../shared/utils/formatTemperature';
import type { WeatherCondition } from '../../../shared/utils/weatherCode';
import { getForecast } from '../data/weatherRepository';
import { getErrorMessageKey } from './errorMessage';

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
  | {
      status: 'success';
      location: string;
      current: {
        condition: WeatherCondition;
        isDay: boolean;
        temperature: string;
        conditionText: string;
        feelsLike: string;
      };
    };

export function useWeatherViewModel(): WeatherScreenState {
  const t = useT();
  const query = useQuery({
    // everything the request depends on goes in the key
    queryKey: ['forecast', PARAMS],
    queryFn: ({ signal }) => getForecast(PARAMS, signal),
  });

  // data wins over error: if a refresh fails we keep the last forecast on screen
  if (query.data) {
    const { current } = query.data;
    return {
      status: 'success',
      location: LOCATION_NAME,
      current: {
        condition: current.condition,
        isDay: current.isDay,
        temperature: formatTemperature(current.temperature),
        conditionText: t(`condition.${current.condition}`),
        feelsLike: t('weather.feelsLike', {
          temperature: formatTemperature(current.apparentTemperature),
        }),
      },
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
