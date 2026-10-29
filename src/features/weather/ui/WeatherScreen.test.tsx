import { fireEvent, render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import { useWeatherViewModel } from '../hooks/useWeatherViewModel';
import { WeatherScreen } from './WeatherScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useWeatherViewModel');
const mockViewModel = jest.mocked(useWeatherViewModel);

test('shows a loading message', async () => {
  mockViewModel.mockReturnValue({ status: 'loading' });

  await render(<WeatherScreen />);

  expect(screen.getByText(t('weather.loading'))).toBeOnTheScreen();
});

test('shows the error message and retries when the button is pressed', async () => {
  const retry = jest.fn();
  mockViewModel.mockReturnValue({
    status: 'error',
    message: 'No internet',
    retry,
  });

  await render(<WeatherScreen />);
  expect(screen.getByText('No internet')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText(t('weather.retry')));

  expect(retry).toHaveBeenCalledTimes(1);
});

test('shows the current weather', async () => {
  mockViewModel.mockReturnValue({
    status: 'success',
    location: 'Jakarta',
    current: {
      condition: 'partlyCloudy',
      isDay: true,
      temperature: '31°',
      conditionText: 'Partly cloudy',
      feelsLike: 'Feels like 34°',
    },
  });

  await render(<WeatherScreen />);

  expect(screen.getByText('Jakarta')).toBeOnTheScreen();
  expect(screen.getByText('31°')).toBeOnTheScreen();
  expect(screen.getByText('Partly cloudy')).toBeOnTheScreen();
  expect(screen.getByText('Feels like 34°')).toBeOnTheScreen();
});
