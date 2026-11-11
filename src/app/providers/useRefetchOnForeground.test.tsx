import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useRefetchOnForeground } from './useRefetchOnForeground';

// the Jest preset replaces AppState with a mock, so the test can read the
// listener the hook registered and call it like the phone would
const mockAddEventListener = jest.mocked(AppState.addEventListener);

function changeAppState(status: AppStateStatus) {
  const [, listener] = mockAddEventListener.mock.calls[0];
  listener(status);
}

// every fetch answers with a new text, so a test can wait for the end of a fetch
async function setup(staleTime: number) {
  let calls = 0;
  const queryFn = jest.fn(async () => `weather ${++calls}`);
  // no retry and no gc timer, so the test stays fast and Jest can exit
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const hook = await renderHook(
    () => {
      useRefetchOnForeground();
      return useQuery({ queryKey: ['probe'], queryFn });
    },
    { wrapper },
  );
  await waitFor(() => expect(hook.result.current.data).toBe('weather 1'));
  return { queryFn, ...hook };
}

// tanstack tells react about changes from a 0ms timer, so a test waits for the
// end of what it started, or the update would land after the test
async function changeAppStateAndWait(...statuses: AppStateStatus[]) {
  await act(async () => {
    statuses.forEach(changeAppState);
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  mockAddEventListener.mockClear();
});

test('refetches a stale query when the app comes back to the foreground', async () => {
  const { queryFn, result } = await setup(0);

  await changeAppStateAndWait('background', 'active');

  await waitFor(() => expect(result.current.data).toBe('weather 2'));
  expect(queryFn).toHaveBeenCalledTimes(2);
});

test('leaves a fresh query alone', async () => {
  const { queryFn, result } = await setup(Infinity);

  await changeAppStateAndWait('background', 'active');

  expect(queryFn).toHaveBeenCalledTimes(1);
  expect(result.current.data).toBe('weather 1');
});

test('does not refetch while the app goes to the background', async () => {
  const { queryFn } = await setup(0);

  await changeAppStateAndWait('background');
  expect(queryFn).toHaveBeenCalledTimes(1);

  // put the focus back for the tests that follow
  await changeAppStateAndWait('active');
});

test('stops listening when the component goes away', async () => {
  const { unmount } = await setup(0);
  const subscription = mockAddEventListener.mock.results[0].value;

  await unmount();

  expect(subscription.remove).toHaveBeenCalledTimes(1);
});
