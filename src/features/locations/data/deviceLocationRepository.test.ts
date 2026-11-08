import Geolocation from '@react-native-community/geolocation';
import { Linking, PermissionsAndroid } from 'react-native';
import {
  getCurrentCoordinates,
  LocationError,
  openAppSettings,
  requestLocationPermission,
} from './deviceLocationRepository';

const mockRequest = jest.spyOn(PermissionsAndroid, 'request');
const mockOpenSettings = jest.spyOn(Linking, 'openSettings');
const mockConfigure = jest.mocked(Geolocation.setRNConfiguration);
const mockGetCurrentPosition = jest.mocked(Geolocation.getCurrentPosition);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requestLocationPermission', () => {
  it('asks for the approximate location only', async () => {
    mockRequest.mockResolvedValue('granted');

    await requestLocationPermission();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(
      'android.permission.ACCESS_COARSE_LOCATION',
    );
  });

  it.each([
    ['granted', 'granted'],
    ['denied', 'denied'],
    ['never_ask_again', 'blocked'],
  ] as const)('turns %s into %s', async (answer, expected) => {
    mockRequest.mockResolvedValue(answer);

    await expect(requestLocationPermission()).resolves.toBe(expected);
  });
});

describe('getCurrentCoordinates', () => {
  it('resolves with the latitude and longitude of the position', async () => {
    mockGetCurrentPosition.mockImplementation(success =>
      success({
        coords: {
          latitude: 10,
          longitude: 20,
          altitude: null,
          accuracy: 500,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 0,
      }),
    );

    await expect(getCurrentCoordinates()).resolves.toEqual({
      latitude: 10,
      longitude: 20,
    });
  });

  it('keeps the library from asking for the permission by itself', async () => {
    mockGetCurrentPosition.mockImplementation(success =>
      success({
        coords: {
          latitude: 1,
          longitude: 2,
          altitude: null,
          accuracy: 500,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 0,
      }),
    );

    await getCurrentCoordinates();

    expect(mockConfigure).toHaveBeenCalledWith({
      skipPermissionRequests: true,
      locationProvider: 'auto',
    });
  });

  it('asks for a fresh, approximate position with a time limit', async () => {
    mockGetCurrentPosition.mockImplementation((_success, error) =>
      error?.({ code: 2, message: 'x' } as never),
    );

    await getCurrentCoordinates().catch(() => {});

    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
    );
  });

  it.each([
    [1, 'permission'],
    [2, 'unavailable'],
    [3, 'timeout'],
    [99, 'unavailable'],
  ] as const)(
    'rejects with a LocationError: library code %s is "%s"',
    async (code, reason) => {
      mockGetCurrentPosition.mockImplementation((_success, error) =>
        error?.({ code, message: 'from the library' } as never),
      );

      const result = getCurrentCoordinates();

      await expect(result).rejects.toBeInstanceOf(LocationError);
      await expect(result).rejects.toMatchObject({
        reason,
        message: 'from the library',
      });
    },
  );
});

describe('openAppSettings', () => {
  it('opens the settings of this app', async () => {
    mockOpenSettings.mockResolvedValue();

    await openAppSettings();

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
  });
});
