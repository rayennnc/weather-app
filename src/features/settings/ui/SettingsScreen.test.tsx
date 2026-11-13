import { fireEvent, render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import {
  type SettingsViewModel,
  useSettingsViewModel,
} from '../hooks/useSettingsViewModel';
import { SettingsScreen } from './SettingsScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useSettingsViewModel');
const mockViewModel = jest.mocked(useSettingsViewModel);

function viewModel(
  overrides: Partial<SettingsViewModel> = {},
): SettingsViewModel {
  return {
    temperatureOptions: [
      { value: 'celsius', label: '°C', isSelected: true },
      { value: 'fahrenheit', label: '°F', isSelected: false },
    ],
    windSpeedOptions: [
      { value: 'kmh', label: 'km/h', isSelected: true },
      { value: 'mph', label: 'mph', isSelected: false },
    ],
    selectTemperature: jest.fn(),
    selectWindSpeed: jest.fn(),
    ...overrides,
  };
}

const renderScreen = (onAboutPress = jest.fn()) =>
  render(<SettingsScreen onAboutPress={onAboutPress} />);

test('shows a heading and the choices of each setting', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen();

  expect(screen.getByText(t('settings.temperature'))).toBeOnTheScreen();
  expect(screen.getByText(t('settings.windSpeed'))).toBeOnTheScreen();
  expect(screen.getAllByRole('radio')).toHaveLength(4);
  expect(screen.getByText('°C')).toBeOnTheScreen();
  expect(screen.getByText('°F')).toBeOnTheScreen();
  expect(screen.getByText('km/h')).toBeOnTheScreen();
  expect(screen.getByText('mph')).toBeOnTheScreen();
});

test('groups the choices of a setting under its name', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen();

  // the group is not an accessibility element itself, or a screen reader would
  // swallow the choices inside it. so it is found by its label, not by its role
  expect(screen.getByLabelText(t('settings.temperature'))).toHaveProp(
    'accessibilityRole',
    'radiogroup',
  );
  expect(screen.getByLabelText(t('settings.windSpeed'))).toHaveProp(
    'accessibilityRole',
    'radiogroup',
  );
});

test('marks only the selected choice of each setting', async () => {
  mockViewModel.mockReturnValue(
    viewModel({
      temperatureOptions: [
        { value: 'celsius', label: '°C', isSelected: false },
        { value: 'fahrenheit', label: '°F', isSelected: true },
      ],
    }),
  );

  await renderScreen();

  expect(
    screen.getByRole('radio', { name: '°F', checked: true }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole('radio', { name: '°C', checked: false }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole('radio', { name: 'km/h', checked: true }),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole('radio', { name: 'mph', checked: false }),
  ).toBeOnTheScreen();
});

test('choosing a temperature unit reports it', async () => {
  const selectTemperature = jest.fn();
  const selectWindSpeed = jest.fn();
  mockViewModel.mockReturnValue(
    viewModel({ selectTemperature, selectWindSpeed }),
  );

  await renderScreen();
  await fireEvent.press(screen.getByText('°F'));

  expect(selectTemperature).toHaveBeenCalledWith('fahrenheit');
  expect(selectWindSpeed).not.toHaveBeenCalled();
});

test('choosing a wind speed unit reports it', async () => {
  const selectTemperature = jest.fn();
  const selectWindSpeed = jest.fn();
  mockViewModel.mockReturnValue(
    viewModel({ selectTemperature, selectWindSpeed }),
  );

  await renderScreen();
  await fireEvent.press(screen.getByText('mph'));

  expect(selectWindSpeed).toHaveBeenCalledWith('mph');
  expect(selectTemperature).not.toHaveBeenCalled();
});

test('the about row reports a press', async () => {
  const onAboutPress = jest.fn();
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen(onAboutPress);
  await fireEvent.press(
    screen.getByRole('button', { name: t('settings.about') }),
  );

  expect(onAboutPress).toHaveBeenCalledTimes(1);
});
