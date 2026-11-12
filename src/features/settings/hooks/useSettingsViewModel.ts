import { useT } from '../../../shared/i18n/useT';
import { useUnitStore } from '../../../shared/stores/unitStore';
import type { TemperatureUnit } from '../../../shared/types/temperatureUnit';
import type { WindSpeedUnit } from '../../../shared/utils/formatWindSpeed';

// one choice of a setting, ready to draw
export type UnitOption<Value extends string> = {
  value: Value;
  label: string;
  isSelected: boolean;
};

export type SettingsViewModel = {
  temperatureOptions: UnitOption<TemperatureUnit>[];
  windSpeedOptions: UnitOption<WindSpeedUnit>[];
  selectTemperature: (unit: TemperatureUnit) => void;
  selectWindSpeed: (unit: WindSpeedUnit) => void;
};

const TEMPERATURE_UNITS: TemperatureUnit[] = ['celsius', 'fahrenheit'];
const WIND_SPEED_UNITS: WindSpeedUnit[] = ['kmh', 'mph'];

export function useSettingsViewModel(): SettingsViewModel {
  const t = useT();
  const temperatureUnit = useUnitStore(state => state.temperatureUnit);
  const windSpeedUnit = useUnitStore(state => state.windSpeedUnit);
  const selectTemperature = useUnitStore(state => state.setTemperatureUnit);
  const selectWindSpeed = useUnitStore(state => state.setWindSpeedUnit);

  return {
    temperatureOptions: TEMPERATURE_UNITS.map(unit => ({
      value: unit,
      label: t(`unit.${unit}`),
      isSelected: unit === temperatureUnit,
    })),
    windSpeedOptions: WIND_SPEED_UNITS.map(unit => ({
      value: unit,
      label: t(`unit.${unit}`),
      isSelected: unit === windSpeedUnit,
    })),
    selectTemperature,
    selectWindSpeed,
  };
}
