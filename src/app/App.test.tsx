import { render, screen } from '@testing-library/react-native';
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
});

test('shows the weather screen', async () => {
  jest.mocked(getForecast).mockReturnValue(new Promise<Forecast>(() => {}));

  await render(<App />);

  expect(screen.getByText(t('weather.loading'))).toBeOnTheScreen();
});
