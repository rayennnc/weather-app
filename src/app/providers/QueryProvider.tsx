import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// One client for the whole app. A forecast barely changes within a few
// minutes, so data newer than staleTime is not refetched on every mount.
export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

type Props = {
  children: ReactNode;
  client?: QueryClient; // tests pass their own client
};

export function QueryProvider({ children, client = appQueryClient }: Props) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
