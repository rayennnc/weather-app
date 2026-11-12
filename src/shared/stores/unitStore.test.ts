import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { DEFAULT_UNITS, useUnitStore } from './unitStore';

const storage = createAsyncStorage('weatherapp');
const { setTemperatureUnit, setWindSpeedUnit } = useUnitStore.getState();

// the store writes to storage in the background. wait one tick for it
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

beforeEach(async () => {
  await storage.clear();
  useUnitStore.setState({ ...DEFAULT_UNITS, hasHydrated: true });
});

test('starts with Celsius and km/h', () => {
  const { temperatureUnit, windSpeedUnit } = useUnitStore.getState();

  expect(temperatureUnit).toBe('celsius');
  expect(windSpeedUnit).toBe('kmh');
});

test('changes the temperature unit and leaves the wind speed unit alone', () => {
  setTemperatureUnit('fahrenheit');

  const { temperatureUnit, windSpeedUnit } = useUnitStore.getState();
  expect(temperatureUnit).toBe('fahrenheit');
  expect(windSpeedUnit).toBe('kmh');
});

test('changes the wind speed unit and leaves the temperature unit alone', () => {
  setWindSpeedUnit('mph');

  const { temperatureUnit, windSpeedUnit } = useUnitStore.getState();
  expect(temperatureUnit).toBe('celsius');
  expect(windSpeedUnit).toBe('mph');
});

test('writes the units, and only the units, to storage', async () => {
  setTemperatureUnit('fahrenheit');
  setWindSpeedUnit('mph');
  await flush();

  const stored = JSON.parse((await storage.getItem('units')) ?? '{}');
  expect(stored.state).toEqual({
    temperatureUnit: 'fahrenheit',
    windSpeedUnit: 'mph',
  });
});

test('restores the saved units after a restart', async () => {
  // setState also writes to storage, so let that finish before we plant our data
  useUnitStore.setState({ hasHydrated: false });
  await flush();
  await storage.setItem(
    'units',
    JSON.stringify({
      state: { temperatureUnit: 'fahrenheit', windSpeedUnit: 'mph' },
      version: 1,
    }),
  );

  await useUnitStore.persist.rehydrate();

  const { temperatureUnit, windSpeedUnit, hasHydrated } =
    useUnitStore.getState();
  expect(temperatureUnit).toBe('fahrenheit');
  expect(windSpeedUnit).toBe('mph');
  expect(hasHydrated).toBe(true);
});

test('is ready after reading an empty storage (first launch)', async () => {
  useUnitStore.setState({ hasHydrated: false });
  await flush();
  await storage.clear();

  await useUnitStore.persist.rehydrate();

  const { temperatureUnit, windSpeedUnit, hasHydrated } =
    useUnitStore.getState();
  expect(temperatureUnit).toBe('celsius');
  expect(windSpeedUnit).toBe('kmh');
  expect(hasHydrated).toBe(true);
});
