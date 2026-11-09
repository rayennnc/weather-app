import { act, renderHook } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import {
  DEFAULT_LOCATION,
  useLocationStore,
} from '../../../shared/stores/locationStore';
import type { Coordinates } from '../../../shared/types/coordinates';
import type { Place } from '../../../shared/types/place';
import { MY_LOCATION_ID } from '../../../shared/utils/placeName';
import {
  getCurrentCoordinates,
  LocationError,
  openAppSettings,
  requestLocationPermission,
  type LocationPermission,
} from '../data/deviceLocationRepository';
import { useLocationsViewModel } from './useLocationsViewModel';

// the device is faked, but LocationError stays the real class
jest.mock('../data/deviceLocationRepository', () => ({
  ...jest.requireActual('../data/deviceLocationRepository'),
  requestLocationPermission: jest.fn(),
  getCurrentCoordinates: jest.fn(),
  openAppSettings: jest.fn(),
}));
const mockPermission = jest.mocked(requestLocationPermission);
const mockCoordinates = jest.mocked(getCurrentCoordinates);
const mockOpenSettings = jest.mocked(openAppSettings);

// a promise that the test finishes by hand, to look at the state while we wait
function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
};

beforeEach(() => {
  jest.resetAllMocks();
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

describe('use my location', () => {
  const found: Coordinates = { latitude: 10, longitude: 20 };

  test('starts idle', async () => {
    const { result } = await renderHook(() => useLocationsViewModel());

    expect(result.current.myLocation).toEqual({ status: 'idle' });
    expect(mockPermission).not.toHaveBeenCalled();
  });

  test('saves the position as "My location" and says it worked', async () => {
    mockPermission.mockResolvedValue('granted');
    mockCoordinates.mockResolvedValue(found);
    const { result } = await renderHook(() => useLocationsViewModel());

    let worked = false;
    await act(async () => {
      worked = await result.current.locateMe();
    });

    expect(worked).toBe(true);
    expect(result.current.myLocation).toEqual({ status: 'idle' });
    expect(useLocationStore.getState().activeLocation).toMatchObject({
      id: MY_LOCATION_ID,
      ...found,
    });
    expect(result.current.locations).toEqual([
      expect.objectContaining({ title: 'Jakarta', isActive: false }),
      {
        id: MY_LOCATION_ID,
        title: 'My location',
        subtitle: '',
        isActive: true,
      },
    ]);
  });

  test('is locating while it waits, and ignores a second press', async () => {
    const permission = deferred<LocationPermission>();
    mockPermission.mockReturnValue(permission.promise);
    mockCoordinates.mockResolvedValue(found);
    const { result } = await renderHook(() => useLocationsViewModel());

    let first: Promise<boolean> = Promise.resolve(false);
    await act(async () => {
      first = result.current.locateMe();
    });
    expect(result.current.myLocation).toEqual({ status: 'locating' });

    let second = true;
    await act(async () => {
      second = await result.current.locateMe();
    });
    expect(second).toBe(false);
    expect(mockPermission).toHaveBeenCalledTimes(1);

    await act(async () => {
      permission.resolve('granted');
      await first;
    });
    expect(result.current.myLocation).toEqual({ status: 'idle' });
  });

  test('a denied permission says so and does not read the position', async () => {
    mockPermission.mockResolvedValue('denied');
    const { result } = await renderHook(() => useLocationsViewModel());

    let worked = true;
    await act(async () => {
      worked = await result.current.locateMe();
    });

    expect(worked).toBe(false);
    expect(result.current.myLocation).toEqual({
      status: 'denied',
      message: t('locations.denied'),
    });
    expect(mockCoordinates).not.toHaveBeenCalled();
    expect(useLocationStore.getState().activeLocation).toEqual(
      DEFAULT_LOCATION,
    );
  });

  test('a blocked permission points to the settings', async () => {
    mockPermission.mockResolvedValue('blocked');
    const { result } = await renderHook(() => useLocationsViewModel());

    await act(async () => {
      await result.current.locateMe();
    });

    expect(result.current.myLocation).toEqual({
      status: 'blocked',
      message: t('locations.blocked'),
    });
    expect(mockCoordinates).not.toHaveBeenCalled();
  });

  test.each(['unavailable', 'timeout'] as const)(
    'a position that fails with "%s" says it could not be found',
    async reason => {
      mockPermission.mockResolvedValue('granted');
      mockCoordinates.mockRejectedValue(new LocationError(reason, 'x'));
      const { result } = await renderHook(() => useLocationsViewModel());

      let worked = true;
      await act(async () => {
        worked = await result.current.locateMe();
      });

      expect(worked).toBe(false);
      expect(result.current.myLocation).toEqual({
        status: 'failed',
        message: t('locations.failed'),
      });
    },
  );

  test('a permission taken away on the way counts as denied', async () => {
    mockPermission.mockResolvedValue('granted');
    mockCoordinates.mockRejectedValue(new LocationError('permission', 'x'));
    const { result } = await renderHook(() => useLocationsViewModel());

    await act(async () => {
      await result.current.locateMe();
    });

    expect(result.current.myLocation).toMatchObject({ status: 'denied' });
  });

  test('an unexpected error counts as a failure, not a crash', async () => {
    mockPermission.mockRejectedValue(new Error('no activity'));
    const { result } = await renderHook(() => useLocationsViewModel());

    await act(async () => {
      await result.current.locateMe();
    });

    expect(result.current.myLocation).toMatchObject({ status: 'failed' });
  });

  test('can be pressed again after a failure', async () => {
    mockPermission.mockResolvedValue('granted');
    mockCoordinates
      .mockRejectedValueOnce(new LocationError('timeout', 'x'))
      .mockResolvedValueOnce(found);
    const { result } = await renderHook(() => useLocationsViewModel());
    await act(async () => {
      await result.current.locateMe();
    });

    let worked = false;
    await act(async () => {
      worked = await result.current.locateMe();
    });

    expect(worked).toBe(true);
    expect(result.current.myLocation).toEqual({ status: 'idle' });
  });

  test('asking again moves the same place instead of adding another', async () => {
    mockPermission.mockResolvedValue('granted');
    mockCoordinates
      .mockResolvedValueOnce(found)
      .mockResolvedValueOnce({ latitude: 11, longitude: 21 });
    const { result } = await renderHook(() => useLocationsViewModel());

    await act(async () => {
      await result.current.locateMe();
    });
    await act(async () => {
      await result.current.locateMe();
    });

    const { savedLocations } = useLocationStore.getState();
    expect(savedLocations).toHaveLength(2);
    expect(savedLocations[1]).toMatchObject({ latitude: 11, longitude: 21 });
  });

  test('changes nothing when the user left the screen while waiting', async () => {
    const position = deferred<Coordinates>();
    mockPermission.mockResolvedValue('granted');
    mockCoordinates.mockReturnValue(position.promise);
    const { result, unmount } = await renderHook(() => useLocationsViewModel());
    let pending: Promise<boolean> = Promise.resolve(true);
    await act(async () => {
      pending = result.current.locateMe();
    });

    await unmount();
    await act(async () => {
      position.resolve(found);
    });

    await expect(pending).resolves.toBe(false);
    expect(useLocationStore.getState().activeLocation).toEqual(
      DEFAULT_LOCATION,
    );
  });

  test('opens the settings of the app', async () => {
    const { result } = await renderHook(() => useLocationsViewModel());

    result.current.openSettings();

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
});
