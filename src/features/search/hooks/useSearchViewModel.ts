import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useT } from '../../../shared/i18n/useT';
import { getErrorMessageKey } from '../../../shared/lib/errorMessage';
import { useLocationStore } from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { type PlaceView, toPlaceView } from '../../../shared/utils/placeView';
import { MIN_QUERY_LENGTH, searchPlaces } from '../data/geocodingRepository';
import { useDebouncedValue } from './useDebouncedValue';

// how long the user has to stop typing before we ask the api
const DEBOUNCE_MS = 400;

// what the results area can be in. the screen never sees the raw places
export type SearchState =
  | { status: 'idle'; hint: string }
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'empty'; message: string }
  | { status: 'success'; results: PlaceView[] };

export type SearchViewModel = {
  query: string;
  setQuery: (query: string) => void;
  state: SearchState;
  selectPlace: (id: Place['id']) => void;
};

export function useSearchViewModel(): SearchViewModel {
  const t = useT();
  const selectLocation = useLocationStore(state => state.selectLocation);
  const [query, setQuery] = useState('');
  // the api only hears about the text after the user paused typing
  const name = useDebouncedValue(query, DEBOUNCE_MS).trim();

  const result = useQuery({
    queryKey: ['places', name],
    queryFn: ({ signal }) => searchPlaces(name, signal),
    enabled: name.length >= MIN_QUERY_LENGTH,
  });

  function selectPlace(id: Place['id']) {
    const place = result.data?.find(item => item.id === id);
    if (place) {
      selectLocation(place);
    }
  }

  let state: SearchState;
  if (query.trim().length < MIN_QUERY_LENGTH) {
    // checked on the live text, so old results disappear as soon as it is cleared
    state = {
      status: 'idle',
      hint: t('search.hint', { count: String(MIN_QUERY_LENGTH) }),
    };
  } else if (result.data) {
    // data wins over error: if a refresh fails we keep the results we have
    state =
      result.data.length === 0
        ? { status: 'empty', message: t('search.empty', { query: name }) }
        : { status: 'success', results: result.data.map(toPlaceView) };
  } else if (result.isError) {
    state = {
      status: 'error',
      message: t(getErrorMessageKey(result.error)),
      retry: () => {
        result.refetch();
      },
    };
  } else {
    // no answer yet: still waiting for the pause in typing, or for the api
    state = { status: 'loading' };
  }

  return { query, setQuery, state, selectPlace };
}
