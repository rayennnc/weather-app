import { useEffect, useRef, useState } from 'react';
import { useT } from '../../../shared/i18n/useT';
import { useLocationStore } from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { getPlaceName } from '../../../shared/utils/placeName';
import { type PlaceView, toPlaceView } from '../../../shared/utils/placeView';
import {
  getCurrentCoordinates,
  LocationError,
  openAppSettings,
  requestLocationPermission,
} from '../data/deviceLocationRepository';

// one saved place, ready to draw
export type LocationView = PlaceView & { isActive: boolean };

// what the "use my location" button is doing, and what to tell the user about it
export type MyLocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'denied'; message: string }
  | { status: 'blocked'; message: string }
  | { status: 'failed'; message: string };

export type LocationsViewModel = {
  // in the order they were saved
  locations: LocationView[];
  // the last place stays: the app always needs one to show
  canRemove: boolean;
  selectLocation: (id: Place['id']) => void;
  removeLocation: (id: Place['id']) => void;
  myLocation: MyLocationState;
  // asks for the permission, reads the position and makes it the active place.
  // true when that worked, so the screen can close
  locateMe: () => Promise<boolean>;
  openSettings: () => void;
};

export function useLocationsViewModel(): LocationsViewModel {
  const t = useT();
  const activeLocation = useLocationStore(state => state.activeLocation);
  const savedLocations = useLocationStore(state => state.savedLocations);
  const selectPlace = useLocationStore(state => state.selectLocation);
  const removeLocation = useLocationStore(state => state.removeLocation);
  const saveMyLocation = useLocationStore(state => state.saveMyLocation);
  const [myLocation, setMyLocation] = useState<MyLocationState>({
    status: 'idle',
  });

  // a second press while we wait is ignored. a ref, because two quick presses
  // can come before React has drawn the "locating" state
  const isLocating = useRef(false);
  // the user can leave the screen while we wait. then nothing should change
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  function selectLocation(id: Place['id']) {
    const place = savedLocations.find(saved => saved.id === id);
    if (place) {
      selectPlace(place);
    }
  }

  async function locateMe(): Promise<boolean> {
    if (isLocating.current) {
      return false;
    }
    isLocating.current = true;
    setMyLocation({ status: 'locating' });

    try {
      const permission = await requestLocationPermission();
      if (!isMounted.current) {
        return false;
      }
      if (permission !== 'granted') {
        setMyLocation(
          permission === 'blocked'
            ? { status: 'blocked', message: t('locations.blocked') }
            : { status: 'denied', message: t('locations.denied') },
        );
        return false;
      }

      const coordinates = await getCurrentCoordinates();
      if (!isMounted.current) {
        return false;
      }
      saveMyLocation(coordinates);
      setMyLocation({ status: 'idle' });
      return true;
    } catch (error) {
      if (isMounted.current) {
        // the permission can be taken away between the question and the answer
        const isDenied =
          error instanceof LocationError && error.reason === 'permission';
        setMyLocation(
          isDenied
            ? { status: 'denied', message: t('locations.denied') }
            : { status: 'failed', message: t('locations.failed') },
        );
      }
      return false;
    } finally {
      isLocating.current = false;
    }
  }

  function openSettings() {
    openAppSettings();
  }

  return {
    locations: savedLocations.map(place => ({
      ...toPlaceView(place),
      // the place the gps found has no name of its own
      title: getPlaceName(place, t),
      isActive: place.id === activeLocation.id,
    })),
    canRemove: savedLocations.length > 1,
    selectLocation,
    removeLocation,
    myLocation,
    locateMe,
    openSettings,
  };
}
