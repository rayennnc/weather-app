import { act, renderHook } from '@testing-library/react-native';
import { DEFAULT_UNITS, useUnitStore } from '../../../shared/stores/unitStore';
import { useSettingsViewModel } from './useSettingsViewModel';

beforeEach(() => {
  useUnitStore.setState({ ...DEFAULT_UNITS, hasHydrated: true });
});

test('lists the choices of each setting and marks the saved one', async () => {
  const { result } = await renderHook(() => useSettingsViewModel());

  expect(result.current.temperatureOptions).toEqual([
    { value: 'celsius', label: '°C', isSelected: true },
    { value: 'fahrenheit', label: '°F', isSelected: false },
  ]);
  expect(result.current.windSpeedOptions).toEqual([
    { value: 'kmh', label: 'km/h', isSelected: true },
    { value: 'mph', label: 'mph', isSelected: false },
  ]);
});

test('marks the units that were saved earlier', async () => {
  useUnitStore.setState({
    temperatureUnit: 'fahrenheit',
    windSpeedUnit: 'mph',
  });

  const { result } = await renderHook(() => useSettingsViewModel());

  expect(result.current.temperatureOptions.map(o => o.isSelected)).toEqual([
    false,
    true,
  ]);
  expect(result.current.windSpeedOptions.map(o => o.isSelected)).toEqual([
    false,
    true,
  ]);
});

test('choosing a temperature unit saves it and moves the mark', async () => {
  const { result } = await renderHook(() => useSettingsViewModel());

  await act(async () => {
    result.current.selectTemperature('fahrenheit');
  });

  expect(useUnitStore.getState().temperatureUnit).toBe('fahrenheit');
  expect(result.current.temperatureOptions.map(o => o.isSelected)).toEqual([
    false,
    true,
  ]);
  // the other setting is not touched
  expect(useUnitStore.getState().windSpeedUnit).toBe('kmh');
});

test('choosing a wind speed unit saves it and moves the mark', async () => {
  const { result } = await renderHook(() => useSettingsViewModel());

  await act(async () => {
    result.current.selectWindSpeed('mph');
  });

  expect(useUnitStore.getState().windSpeedUnit).toBe('mph');
  expect(result.current.windSpeedOptions.map(o => o.isSelected)).toEqual([
    false,
    true,
  ]);
  expect(useUnitStore.getState().temperatureUnit).toBe('celsius');
});
