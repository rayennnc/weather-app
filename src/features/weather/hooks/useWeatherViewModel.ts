import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useT } from '../../../shared/i18n/useT';
import { getErrorMessageKey } from '../../../shared/lib/errorMessage';
import { useLocationStore } from '../../../shared/stores/locationStore';
import { getPlaceName } from '../../../shared/utils/placeName';
import { getForecast } from '../data/weatherRepository';
import { type ForecastView, toForecastView } from './forecastView';

// units are fixed until the settings screen (M5)
const UNITS = { temperatureUnit: 'celsius', windSpeedUnit: 'kmh' } as const;

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
  const activeLocation = useLocationStore(state => state.activeLocation);
  const hasHydrated = useLocationStore(state => state.hasHydrated);
  const params = {
    latitude: activeLocation.latitude,
    longitude: activeLocation.longitude,
    ...UNITS,
  };
  const query = useQuery({
    // everything the request depends on goes in the key, so a new location
    // means a new request
    queryKey: ['forecast', params],
    queryFn: ({ signal }) => getForecast(params, signal),
    // wait for the saved location, or we would fetch Jakarta first and then
    // the real one
    enabled: hasHydrated,
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
      location: getPlaceName(activeLocation, t),
      isRefreshing,
      refresh,
      ...toForecastView(query.data, t, {
        updatedAt: query.dataUpdatedAt,
        windSpeedUnit: UNITS.windSpeedUnit,
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
