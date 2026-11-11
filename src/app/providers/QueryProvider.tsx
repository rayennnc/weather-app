import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  type PersistQueryClientProviderProps,
} from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';
import { FORECAST_MAX_AGE } from '../../features/weather/data/forecastCache';
import { persistOptions as appPersistOptions } from './queryPersistence';
import { useRefetchOnForeground } from './useRefetchOnForeground';

// One client for the whole app. A forecast barely changes within a few
// minutes, so data newer than staleTime is not refetched on every mount.
export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      // a query nobody uses is dropped from memory after gcTime, and then from
      // the saved copy too. keep it as long as a saved forecast may be shown
      gcTime: FORECAST_MAX_AGE,
    },
  },
});

type Props = {
  children: ReactNode;
  client?: QueryClient; // tests pass their own client
  // and their own storage, so a test never touches what another test saved
  persistOptions?: PersistQueryClientProviderProps['persistOptions'];
};

export function QueryProvider({
  children,
  client = appQueryClient,
  persistOptions = appPersistOptions,
}: Props) {
  useRefetchOnForeground();

  return (
    <PersistQueryClientProvider client={client} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  );
}
