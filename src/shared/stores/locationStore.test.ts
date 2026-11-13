import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import type { Place } from '../types/place';
import { DEFAULT_LOCATION, useLocationStore } from './locationStore';

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
};
const surabaya: Place = {
  id: 1625822,
  name: 'Surabaya',
  region: 'East Java',
  country: 'Indonesia',
  latitude: -7.2492,
  longitude: 112.7508,
};

const storage = createAsyncStorage('weatherapp');
const { selectLocation, removeLocation } = useLocationStore.getState();

// the store writes to storage in the background. wait one tick for it
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

beforeEach(async () => {
  await storage.clear();
  useLocationStore.setState({
    activeLocation: DEFAULT_LOCATION,
    savedLocations: [DEFAULT_LOCATION],
    hasHydrated: true,
  });
});

test('starts with Jakarta as the active and only saved location', () => {
  const { activeLocation, savedLocations } = useLocationStore.getState();

  expect(activeLocation).toEqual(DEFAULT_LOCATION);
  expect(savedLocations).toEqual([DEFAULT_LOCATION]);
});

test('selecting a place makes it active and saves it', () => {
  selectLocation(bandung);

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(bandung);
  expect(savedLocations).toEqual([DEFAULT_LOCATION, bandung]);
});

test('selecting a saved place again does not save it twice', () => {
  selectLocation(bandung);
  selectLocation(DEFAULT_LOCATION);
  selectLocation(bandung);

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(bandung);
  expect(savedLocations).toHaveLength(2);
});

test('removing a place that is not active keeps the active one', () => {
  selectLocation(bandung);
  selectLocation(surabaya);
  removeLocation(bandung.id);

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(surabaya);
  expect(savedLocations).toEqual([DEFAULT_LOCATION, surabaya]);
});

test('removing the active place activates the first saved one', () => {
  selectLocation(bandung);
  removeLocation(bandung.id);

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(DEFAULT_LOCATION);
  expect(savedLocations).toEqual([DEFAULT_LOCATION]);
});

test('removing the last saved place brings Jakarta back', () => {
  selectLocation(bandung);
  removeLocation(DEFAULT_LOCATION.id);
  removeLocation(bandung.id);

  const { activeLocation, savedLocations } = useLocationStore.getState();
  expect(activeLocation).toEqual(DEFAULT_LOCATION);
  expect(savedLocations).toEqual([DEFAULT_LOCATION]);
});

test('writes the data, and only the data, to storage', async () => {
  selectLocation(bandung);
  await flush();

  const stored = JSON.parse((await storage.getItem('locations')) ?? '{}');
  expect(stored.state.activeLocation).toEqual(bandung);
  expect(stored.state.savedLocations).toEqual([DEFAULT_LOCATION, bandung]);
  expect(stored.state).not.toHaveProperty('hasHydrated');
  expect(stored.state).not.toHaveProperty('selectLocation');
});

test('restores the saved data after a restart', async () => {
  // setState also writes to storage, so let that finish before we plant our data
  useLocationStore.setState({ hasHydrated: false });
  await flush();
  await storage.setItem(
    'locations',
    JSON.stringify({
      state: { activeLocation: bandung, savedLocations: [bandung] },
      version: 1,
    }),
  );

  await useLocationStore.persist.rehydrate();

  const { activeLocation, savedLocations, hasHydrated } =
    useLocationStore.getState();
  expect(activeLocation).toEqual(bandung);
  expect(savedLocations).toEqual([bandung]);
  expect(hasHydrated).toBe(true);
});

test('is ready after reading an empty storage (first launch)', async () => {
  useLocationStore.setState({ hasHydrated: false });
  await flush();
  await storage.clear();

  await useLocationStore.persist.rehydrate();

  const { activeLocation, hasHydrated } = useLocationStore.getState();
  expect(activeLocation).toEqual(DEFAULT_LOCATION);
  expect(hasHydrated).toBe(true);
});
