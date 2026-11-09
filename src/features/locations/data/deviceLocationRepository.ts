import Geolocation from '@react-native-community/geolocation';
import { Linking, PermissionsAndroid } from 'react-native';
import type { Coordinates } from '../../../shared/types/coordinates';

export type LocationPermission = 'granted' | 'denied' | 'blocked';

// why a position could not be read
export class LocationError extends Error {
  constructor(
    public reason: 'permission' | 'unavailable' | 'timeout',
    message: string,
  ) {
    super(message);
  }
}

// the error codes of the library (the same as the browser geolocation api)
const PERMISSION_DENIED = 1;
const TIMEOUT = 3;

// fresh and approximate: the user pressed the button to see where they are now,
// and the weather does not need more than the city
const POSITION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 0,
};

export async function requestLocationPermission(): Promise<LocationPermission> {
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  );
  if (result === PermissionsAndroid.RESULTS.GRANTED) {
    return 'granted';
  }
  // "never ask again": only the settings screen can turn it on from here
  return result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ? 'blocked'
    : 'denied';
}

export function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    // the library would ask for the permission by itself. we ask before, to tell
    // "no" apart from "never ask again"
    Geolocation.setRNConfiguration({
      skipPermissionRequests: true,
      locationProvider: 'auto',
    });
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      error => {
        const reason =
          error.code === PERMISSION_DENIED
            ? 'permission'
            : error.code === TIMEOUT
            ? 'timeout'
            : 'unavailable';
        reject(new LocationError(reason, error.message));
      },
      POSITION_OPTIONS,
    );
  });
}

export function openAppSettings(): Promise<void> {
  return Linking.openSettings();
}
