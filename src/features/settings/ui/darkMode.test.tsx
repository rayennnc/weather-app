import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { t } from '../../../shared/i18n/useT';
import { darkColors, lightColors } from '../../../shared/theme/palettes';
import {
  type AboutViewModel,
  useAboutViewModel,
} from '../hooks/useAboutViewModel';
import {
  type SettingsViewModel,
  useSettingsViewModel,
} from '../hooks/useSettingsViewModel';
import { AboutScreen } from './AboutScreen';
import { SettingsScreen } from './SettingsScreen';

// the Jest preset replaces useColorScheme with a mock, so a test decides which
// theme the phone is in
const mockColorScheme = jest.mocked(useColorScheme);

// the screens only draw what the view models give them, so these are mocked
jest.mock('../hooks/useSettingsViewModel');
jest.mock('../hooks/useAboutViewModel');
const mockSettings = jest.mocked(useSettingsViewModel);
const mockAbout = jest.mocked(useAboutViewModel);

const settingsViewModel: SettingsViewModel = {
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
};

const aboutViewModel: AboutViewModel = {
  sources: [
    {
      id: 'weather',
      title: 'Weather data',
      credit: 'Weather data by Open-Meteo.com',
      creditUrl: 'https://open-meteo.com/',
      license: 'Licensed under CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      note: 'Values are rounded and formatted for display.',
    },
  ],
  openLink: jest.fn(),
};

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('in the %s theme', (scheme, palette) => {
  beforeEach(() => {
    mockColorScheme.mockReturnValue(scheme);
    mockSettings.mockReturnValue(settingsViewModel);
    mockAbout.mockReturnValue(aboutViewModel);
  });

  test('the settings have main headings and a card for the choices', async () => {
    await render(<SettingsScreen onAboutPress={jest.fn()} />);

    expect(screen.getByText(t('settings.temperature'))).toHaveStyle({
      color: palette.text,
    });
    expect(screen.getByLabelText(t('settings.temperature'))).toHaveStyle({
      backgroundColor: palette.card,
    });
  });

  test('the selected choice is accent colored and the others are plain', async () => {
    await render(<SettingsScreen onAboutPress={jest.fn()} />);

    expect(screen.getByRole('radio', { name: '°C' })).toHaveStyle({
      backgroundColor: palette.accent,
    });
    expect(screen.getByText('°C')).toHaveStyle({ color: palette.onAccent });
    expect(screen.getByText('°F')).toHaveStyle({ color: palette.text });
  });

  test('the about row is a card', async () => {
    await render(<SettingsScreen onAboutPress={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: t('settings.about') }),
    ).toHaveStyle({ backgroundColor: palette.card });
    expect(screen.getByText(t('settings.about'))).toHaveStyle({
      color: palette.text,
    });
    expect(screen.getByText('›')).toHaveStyle({
      color: palette.textSecondary,
    });
  });

  test('the about screen has cards, accent links and a quiet note', async () => {
    await render(<AboutScreen />);

    expect(screen.getByText('Weather data').parent).toHaveStyle({
      backgroundColor: palette.card,
    });
    expect(screen.getByText('Weather data')).toHaveStyle({
      color: palette.text,
    });
    expect(screen.getByText('Weather data by Open-Meteo.com')).toHaveStyle({
      color: palette.accent,
    });
    expect(
      screen.getByText('Values are rounded and formatted for display.'),
    ).toHaveStyle({ color: palette.textSecondary });
  });
});
