import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { getForecast } from '../features/weather/data/weatherRepository';
import type { Forecast } from '../features/weather/data/forecast';
import { t } from '../shared/i18n/useT';
import App from './App';
import { appQueryClient } from './providers/QueryProvider';

jest.mock('../features/weather/data/weatherRepository');
// without the mock, SafeAreaProvider renders nothing until the native side reports insets
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

afterEach(() => {
  // the app client keeps a 5 minute gc timer per query. clear it so Jest can exit
  appQueryClient.clear();
  // the Jest preset replaces useColorScheme with a mock that answers "light"
  jest.mocked(useColorScheme).mockReturnValue('light');
});

test('shows the weather screen', async () => {
  jest.mocked(getForecast).mockReturnValue(new Promise<Forecast>(() => {}));

  await render(<App />);

  expect(screen.getByLabelText(t('weather.loading'))).toBeOnTheScreen();
});

test('shows the weather screen when the phone is in the dark theme', async () => {
  jest.mocked(useColorScheme).mockReturnValue('dark');
  jest.mocked(getForecast).mockReturnValue(new Promise<Forecast>(() => {}));

  await render(<App />);

  expect(screen.getByLabelText(t('weather.loading'))).toBeOnTheScreen();
});
