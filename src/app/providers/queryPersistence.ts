import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import {
  FORECAST_MAX_AGE,
  FORECAST_QUERY_KEY,
} from '../../features/weather/data/forecastCache';

// change this when the saved forecast shape changes, old cache will be discarded
export const CACHE_VERSION = '1';

export const QUERY_CACHE_KEY = 'queryCache';

// persist only forecasts, since search results are quick to fetch again
// keep forecast data after refresh errors so it remains available offline
export function shouldPersistQuery(query: Query): boolean {
  return (
    query.queryKey[0] === FORECAST_QUERY_KEY && query.state.data !== undefined
  );
}

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] =
  {
    persister: createAsyncStoragePersister({
      storage: createAsyncStorage('weatherapp'),
      key: QUERY_CACHE_KEY,
    }),
    // maxAge starts at the last cache save, the weather screen also checks forecast age
    maxAge: FORECAST_MAX_AGE,
    buster: CACHE_VERSION,
    dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
  };
