import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Place } from '../types/place';

// shown on the first launch, until the user picks another place
export const DEFAULT_LOCATION: Place = {
  id: 1642911,
  name: 'Jakarta',
  region: 'Jakarta',
  country: 'Indonesia',
  latitude: -6.21462,
  longitude: 106.84513,
};

type LocationState = {
  activeLocation: Place;
  savedLocations: Place[];
  // false until the saved data is read from the phone
  hasHydrated: boolean;
  // makes the place active and saves it (once)
  selectLocation: (place: Place) => void;
  removeLocation: (id: Place['id']) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    set => ({
      activeLocation: DEFAULT_LOCATION,
      savedLocations: [DEFAULT_LOCATION],
      hasHydrated: false,

      selectLocation: place =>
        set(state => ({
          activeLocation: place,
          savedLocations: state.savedLocations.some(
            saved => saved.id === place.id,
          )
            ? state.savedLocations
            : [...state.savedLocations, place],
        })),

      removeLocation: id =>
        set(state => {
          const savedLocations = state.savedLocations.filter(
            saved => saved.id !== id,
          );
          // never leave the app without a location
          if (savedLocations.length === 0) {
            return {
              activeLocation: DEFAULT_LOCATION,
              savedLocations: [DEFAULT_LOCATION],
            };
          }
          return {
            savedLocations,
            activeLocation:
              state.activeLocation.id === id
                ? savedLocations[0]
                : state.activeLocation,
          };
        }),
    }),
    {
      name: 'locations',
      version: 1,
      storage: createJSONStorage(() => createAsyncStorage('weatherapp')),
      // store the data only, not the flag or the functions
      partialize: state => ({
        activeLocation: state.activeLocation,
        savedLocations: state.savedLocations,
      }),
      // runs after the read, also when it failed, so the app never waits forever
      onRehydrateStorage: () => () => {
        useLocationStore.setState({ hasHydrated: true });
      },
    },
  ),
);
