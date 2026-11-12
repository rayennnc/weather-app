import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { TemperatureUnit } from '../types/temperatureUnit';
import type { WindSpeedUnit } from '../utils/formatWindSpeed';

// shown on the first launch, until the user picks other units
export const DEFAULT_UNITS = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
} as const;

type UnitState = {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  // false until the saved units are read from the phone
  hasHydrated: boolean;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
};

export const useUnitStore = create<UnitState>()(
  persist(
    set => ({
      ...DEFAULT_UNITS,
      hasHydrated: false,
      setTemperatureUnit: temperatureUnit => set({ temperatureUnit }),
      setWindSpeedUnit: windSpeedUnit => set({ windSpeedUnit }),
    }),
    {
      name: 'units',
      version: 1,
      storage: createJSONStorage(() => createAsyncStorage('weatherapp')),
      // store the data only, not the flag or the functions
      partialize: state => ({
        temperatureUnit: state.temperatureUnit,
        windSpeedUnit: state.windSpeedUnit,
      }),
      // runs after the read, also when it failed, so the app never waits forever
      onRehydrateStorage: () => () => {
        useUnitStore.setState({ hasHydrated: true });
      },
    },
  ),
);
