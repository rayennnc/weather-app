import { act, renderHook } from '@testing-library/react-native';
import {
  DEFAULT_LOCATION,
  useLocationStore,
} from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { useLocationsViewModel } from './useLocationsViewModel';

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
};

beforeEach(() => {
  useLocationStore.setState({
    activeLocation: DEFAULT_LOCATION,
    savedLocations: [DEFAULT_LOCATION],
    hasHydrated: true,
  });
});

test('lists the saved places, ready to draw, with the active one marked', async () => {
  useLocationStore.setState({
    activeLocation: bandung,
    savedLocations: [DEFAULT_LOCATION, bandung],
  });

  const { result } = await renderHook(() => useLocationsViewModel());

  expect(result.current.locations).toEqual([
    { id: 1642911, title: 'Jakarta', subtitle: 'Indonesia', isActive: false },
    {
      id: 1650357,
      title: 'Bandung',
      subtitle: 'West Java, Indonesia',
      isActive: true,
    },
  ]);
});

test('the last saved place cannot be removed', async () => {
  const { result } = await renderHook(() => useLocationsViewModel());
  expect(result.current.canRemove).toBe(false);

  await act(async () => {
    useLocationStore.setState({ savedLocations: [DEFAULT_LOCATION, bandung] });
  });

  expect(result.current.canRemove).toBe(true);
});

test('follows the store when a place is saved somewhere else', async () => {
  const { result } = await renderHook(() => useLocationsViewModel());

  await act(async () => {
    useLocationStore.getState().selectLocation(bandung);
  });

  expect(result.current.locations.map(location => location.title)).toEqual([
    'Jakarta',
    'Bandung',
  ]);
  expect(result.current.locations[1].isActive).toBe(true);
});

test('choosing a saved place makes it active without saving it twice', async () => {
  useLocationStore.setState({ savedLocations: [DEFAULT_LOCATION, bandung] });
  const { result } = await renderHook(() => useLocationsViewModel());

  await act(async () => {
    result.current.selectLocation(bandung.id);
  });

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(bandung);
  expect(savedLocations).toEqual([DEFAULT_LOCATION, bandung]);
});

test('ignores a place that is not saved', async () => {
  const { result } = await renderHook(() => useLocationsViewModel());

  await act(async () => {
    result.current.selectLocation(999);
  });

  expect(useLocationStore.getState().activeLocation).toEqual(DEFAULT_LOCATION);
});

test('removing a place takes it off the list', async () => {
  useLocationStore.setState({ savedLocations: [DEFAULT_LOCATION, bandung] });
  const { result } = await renderHook(() => useLocationsViewModel());

  await act(async () => {
    result.current.removeLocation(bandung.id);
  });

  expect(result.current.locations.map(location => location.id)).toEqual([
    DEFAULT_LOCATION.id,
  ]);
});

test('removing the active place makes the first one left active', async () => {
  useLocationStore.setState({
    activeLocation: bandung,
    savedLocations: [DEFAULT_LOCATION, bandung],
  });
  const { result } = await renderHook(() => useLocationsViewModel());

  await act(async () => {
    result.current.removeLocation(bandung.id);
  });

  expect(result.current.locations).toEqual([
    expect.objectContaining({ title: 'Jakarta', isActive: true }),
  ]);
});
