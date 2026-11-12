import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useT } from '../../../shared/i18n/useT';
import { getErrorMessageKey } from '../../../shared/lib/errorMessage';
import { useLocationStore } from '../../../shared/stores/locationStore';
import { useUnitStore } from '../../../shared/stores/unitStore';
import { getPlaceName } from '../../../shared/utils/placeName';
import { FORECAST_MAX_AGE, FORECAST_QUERY_KEY } from '../data/forecastCache';
import { getForecast } from '../data/weatherRepository';
import { type ForecastView, toForecastView } from './forecastView';

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
  const hasLocationHydrated = useLocationStore(state => state.hasHydrated);
  const temperatureUnit = useUnitStore(state => state.temperatureUnit);
  const windSpeedUnit = useUnitStore(state => state.windSpeedUnit);
  const haveUnitsHydrated = useUnitStore(state => state.hasHydrated);
  const params = {
    latitude: activeLocation.latitude,
    longitude: activeLocation.longitude,
    temperatureUnit,
    windSpeedUnit,
  };
  const query = useQuery({
    // everything the request depends on goes in the key, so a new location
    // means a new request
    queryKey: [FORECAST_QUERY_KEY, params],
    queryFn: ({ signal }) => getForecast(params, signal),
    // wait for the saved location and units, or we would fetch Jakarta in
    // metric first and then the real ones
    enabled: hasLocationHydrated && haveUnitsHydrated,
  });

  // pull-to-refresh has its own flag: isFetching would also be true for the
  // refetches that happen quietly in the background
  const [isRefreshing, setIsRefreshing] = useState(false);
  function refresh() {
    setIsRefreshing(true);
    query.refetch().finally(() => setIsRefreshing(false));
  }

  // read on every render: a forecast saved hours ago is drawn against the time
  // it is now ("Now", "Today") and not against the time it was fetched
  const now = Date.now();

  // data wins over error: if a refresh fails we keep the last forecast on screen,
  // until it is too old to be worth showing
  if (query.data && now - query.dataUpdatedAt <= FORECAST_MAX_AGE) {
    return {
      status: 'success',
      location: getPlaceName(activeLocation, t),
      isRefreshing,
      refresh,
      ...toForecastView(query.data, t, {
        now,
        updatedAt: query.dataUpdatedAt,
        windSpeedUnit,
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
