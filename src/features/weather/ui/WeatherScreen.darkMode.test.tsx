import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { t } from '../../../shared/i18n/useT';
import { darkColors, lightColors } from '../../../shared/theme/palettes';
import {
  useWeatherViewModel,
  type WeatherScreenState,
} from '../hooks/useWeatherViewModel';
import { WeatherScreen } from './WeatherScreen';

// the Jest preset replaces useColorScheme with a mock, so a test decides which
// theme the phone is in
const mockColorScheme = jest.mocked(useColorScheme);

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useWeatherViewModel');
const mockViewModel = jest.mocked(useWeatherViewModel);

const success: WeatherScreenState = {
  status: 'success',
  location: 'Jakarta',
  isRefreshing: false,
  refresh: jest.fn(),
  attribution: 'Weather data by Open-Meteo.com',
  openAttribution: jest.fn(),
  current: {
    condition: 'partlyCloudy',
    isDay: true,
    temperature: '31°',
    conditionText: 'Partly cloudy',
    feelsLike: 'Feels like 34°',
  },
  updated: 'Updated 11:51',
  hourly: [],
  daily: [],
  details: [],
};

const renderScreen = () =>
  render(
    <WeatherScreen
      onLocationsPress={jest.fn()}
      onSearchPress={jest.fn()}
      onSettingsPress={jest.fn()}
    />,
  );

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('in the %s theme', (scheme, palette) => {
  beforeEach(() => {
    mockColorScheme.mockReturnValue(scheme);
  });

  test('the top buttons are cards with accent text', async () => {
    mockViewModel.mockReturnValue(success);

    await renderScreen();

    for (const name of ['locations', 'search', 'settings'] as const) {
      const label = t(`weather.${name}`);
      expect(screen.getByRole('button', { name: label })).toHaveStyle({
        backgroundColor: palette.card,
      });
      expect(screen.getByText(label)).toHaveStyle({ color: palette.accent });
    }
  });

  test('the error message is main text and its button is an accent button', async () => {
    mockViewModel.mockReturnValue({
      status: 'error',
      message: 'No internet',
      retry: jest.fn(),
    });

    await renderScreen();

    expect(screen.getByText('No internet')).toHaveStyle({
      color: palette.text,
    });
    expect(
      screen.getByRole('button', { name: t('weather.retry') }),
    ).toHaveStyle({ backgroundColor: palette.accent });
    expect(screen.getByText(t('weather.retry'))).toHaveStyle({
      color: palette.onAccent,
    });
  });

  test('the credit under the forecast is a quiet link', async () => {
    mockViewModel.mockReturnValue(success);

    await renderScreen();

    expect(screen.getByText('Weather data by Open-Meteo.com')).toHaveStyle({
      color: palette.textSecondary,
    });
  });
});
