import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { t } from '../../../shared/i18n/useT';
import { NetworkError } from '../../../shared/lib/errors';
import {
  DEFAULT_LOCATION,
  useLocationStore,
} from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { MIN_QUERY_LENGTH, searchPlaces } from '../data/geocodingRepository';
import { useDebouncedValue } from './useDebouncedValue';
import { useSearchViewModel } from './useSearchViewModel';

jest.mock('../data/geocodingRepository');
// the waiting is tested with the hook itself. here a typed text counts at once
jest.mock('./useDebouncedValue');
const mockSearchPlaces = jest.mocked(searchPlaces);
const mockDebounce = jest.mocked(useDebouncedValue);

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
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
  mockSearchPlaces.mockReset();
  mockDebounce.mockReset();
  mockDebounce.mockImplementation(value => value);
  useLocationStore.setState({
    activeLocation: DEFAULT_LOCATION,
    savedLocations: [DEFAULT_LOCATION],
    hasHydrated: true,
  });
});

test('starts idle and says how many letters are needed', async () => {
  const { wrapper } = setup();

  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  expect(result.current.query).toBe('');
  expect(result.current.state).toEqual({
    status: 'idle',
    hint: t('search.hint', { count: String(MIN_QUERY_LENGTH) }),
  });
  expect(mockSearchPlaces).not.toHaveBeenCalled();
});

test('stays idle and does not call the api for a text that is too short', async () => {
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('a'.repeat(MIN_QUERY_LENGTH - 1));
  });

  expect(result.current.state.status).toBe('idle');
  expect(mockSearchPlaces).not.toHaveBeenCalled();
});

test('searches as soon as the text is exactly long enough', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('a'.repeat(MIN_QUERY_LENGTH));
  });

  await waitFor(() => expect(result.current.state.status).toBe('success'));
  expect(mockSearchPlaces).toHaveBeenCalledTimes(1);
});

test('searches with the trimmed text and passes the abort signal on', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('  Bandung ');
  });

  await waitFor(() => expect(result.current.state.status).toBe('success'));
  expect(mockSearchPlaces).toHaveBeenCalledTimes(1);
  expect(mockSearchPlaces).toHaveBeenCalledWith(
    'Bandung',
    expect.any(AbortSignal),
  );
});

test('turns the places into rows that are ready to draw', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('Bandung');
  });

  await waitFor(() => expect(result.current.state.status).toBe('success'));
  expect(result.current.state).toEqual({
    status: 'success',
    results: [
      { id: 1650357, title: 'Bandung', subtitle: 'West Java, Indonesia' },
    ],
  });
});

test('is loading until the api answers', async () => {
  mockSearchPlaces.mockReturnValue(new Promise<Place[]>(() => {}));
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('Bandung');
  });

  expect(result.current.state).toEqual({ status: 'loading' });
});

test('waits for the pause in typing before it asks the api', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  // the user typed, but the pause is not over: the debounced text is still empty
  mockDebounce.mockReturnValue('');
  const { wrapper } = setup();
  const { result, rerender } = await renderHook(() => useSearchViewModel(), {
    wrapper,
  });

  await act(async () => {
    result.current.setQuery('Bandung');
  });
  expect(result.current.state).toEqual({ status: 'loading' });
  expect(mockSearchPlaces).not.toHaveBeenCalled();

  // the pause is over
  mockDebounce.mockImplementation(value => value);
  await rerender({});

  await waitFor(() => expect(result.current.state.status).toBe('success'));
  expect(mockSearchPlaces).toHaveBeenCalledTimes(1);
});

test('says so when nothing matches, with the text that was searched', async () => {
  mockSearchPlaces.mockResolvedValue([]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('  Atlantis ');
  });

  await waitFor(() => expect(result.current.state.status).toBe('empty'));
  expect(result.current.state).toEqual({
    status: 'empty',
    message: t('search.empty', { query: 'Atlantis' }),
  });
});

test('shows the mapped message when the request fails', async () => {
  mockSearchPlaces.mockRejectedValue(new NetworkError('offline'));
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });

  await act(async () => {
    result.current.setQuery('Bandung');
  });

  await waitFor(() => expect(result.current.state.status).toBe('error'));
  expect(result.current.state).toMatchObject({ message: t('error.network') });
});

test('retry shows the spinner again and ends in success', async () => {
  let finish: (places: Place[]) => void = () => {};
  mockSearchPlaces.mockRejectedValueOnce(new NetworkError('offline'));
  mockSearchPlaces.mockReturnValueOnce(
    new Promise<Place[]>(resolve => {
      finish = resolve;
    }),
  );
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });
  await act(async () => {
    result.current.setQuery('Bandung');
  });
  await waitFor(() => expect(result.current.state.status).toBe('error'));

  if (result.current.state.status !== 'error') {
    throw new Error('expected the error state');
  }
  const { retry } = result.current.state;
  await act(async () => {
    retry();
  });
  // tanstack tells react about the new fetch from a 0ms timer, so wait for it
  await waitFor(() =>
    expect(result.current.state).toEqual({ status: 'loading' }),
  );

  await act(async () => {
    finish([bandung]);
  });
  await waitFor(() => expect(result.current.state.status).toBe('success'));
  expect(mockSearchPlaces).toHaveBeenCalledTimes(2);
});

test('keeps showing the results when a refresh fails', async () => {
  mockSearchPlaces
    .mockResolvedValueOnce([bandung])
    .mockRejectedValueOnce(new NetworkError('offline'));
  const { client, wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });
  await act(async () => {
    result.current.setQuery('Bandung');
  });
  await waitFor(() => expect(result.current.state.status).toBe('success'));

  await act(async () => {
    await client.refetchQueries();
    // tanstack tells react about changes from a 0ms timer. wait one tick inside act
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

  expect(mockSearchPlaces).toHaveBeenCalledTimes(2);
  expect(result.current.state.status).toBe('success');
});

test('goes back to idle when the text is cleared, even after a search', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });
  await act(async () => {
    result.current.setQuery('Bandung');
  });
  await waitFor(() => expect(result.current.state.status).toBe('success'));

  await act(async () => {
    result.current.setQuery('');
  });

  expect(result.current.state.status).toBe('idle');
});

test('choosing a result makes it the active location and saves it', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });
  await act(async () => {
    result.current.setQuery('Bandung');
  });
  await waitFor(() => expect(result.current.state.status).toBe('success'));

  await act(async () => {
    result.current.selectPlace(bandung.id);
  });

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(bandung);
  expect(savedLocations).toEqual([DEFAULT_LOCATION, bandung]);
});

test('ignores a place that is not in the results', async () => {
  mockSearchPlaces.mockResolvedValue([bandung]);
  const { wrapper } = setup();
  const { result } = await renderHook(() => useSearchViewModel(), { wrapper });
  await act(async () => {
    result.current.setQuery('Bandung');
  });
  await waitFor(() => expect(result.current.state.status).toBe('success'));

  await act(async () => {
    result.current.selectPlace(999);
  });

  expect(useLocationStore.getState().activeLocation).toEqual(DEFAULT_LOCATION);
  expect(useLocationStore.getState().savedLocations).toEqual([
    DEFAULT_LOCATION,
  ]);
});
