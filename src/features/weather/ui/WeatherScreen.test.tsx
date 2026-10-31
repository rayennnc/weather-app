import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import {
  useWeatherViewModel,
  type WeatherScreenState,
} from '../hooks/useWeatherViewModel';
import { WeatherScreen } from './WeatherScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useWeatherViewModel');
const mockViewModel = jest.mocked(useWeatherViewModel);

const success: WeatherScreenState = {
  status: 'success',
  location: 'Jakarta',
  isRefreshing: false,
  refresh: jest.fn(),
  current: {
    condition: 'partlyCloudy',
    isDay: true,
    temperature: '31°',
    conditionText: 'Partly cloudy',
    feelsLike: 'Feels like 34°',
  },
  updated: 'Updated 11:51',
  hourly: [
    {
      time: '2026-10-28T14:00',
      label: 'Now',
      condition: 'partlyCloudy',
      isDay: true,
      temperature: '30°',
      precipitationChance: '40%',
    },
  ],
  daily: [
    {
      date: '2026-10-28',
      label: 'Today',
      condition: 'rain',
      temperatureMax: '32°',
      temperatureMin: '25°',
      precipitationChance: '80%',
    },
  ],
  details: [
    { id: 'humidity', label: 'Humidity', value: '70%' },
    { id: 'wind', label: 'Wind', value: '9 km/h' },
  ],
};

test('shows the loading skeleton', async () => {
  mockViewModel.mockReturnValue({ status: 'loading' });

  await render(<WeatherScreen />);

  expect(screen.getByLabelText(t('weather.loading'))).toBeOnTheScreen();
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

test('shows the current weather, the hours, the days and the details', async () => {
  mockViewModel.mockReturnValue(success);

  await render(<WeatherScreen />);

  expect(screen.getByText('Jakarta')).toBeOnTheScreen();
  expect(screen.getByText('31°')).toBeOnTheScreen();
  expect(screen.getByText('Partly cloudy')).toBeOnTheScreen();
  expect(screen.getByText('Feels like 34°')).toBeOnTheScreen();
  expect(screen.getByText('Updated 11:51')).toBeOnTheScreen();
  expect(screen.getByText('Now')).toBeOnTheScreen();
  expect(screen.getByText('Today')).toBeOnTheScreen();
  expect(screen.getByText('Humidity')).toBeOnTheScreen();
  expect(screen.getByText('9 km/h')).toBeOnTheScreen();
});

test('pulling down calls refresh', async () => {
  const refresh = jest.fn();
  mockViewModel.mockReturnValue({ ...success, refresh });

  await render(<WeatherScreen />);
  const { refreshControl } = screen.getByTestId('weather-scroll').props;
  await act(async () => {
    refreshControl.props.onRefresh();
  });

  expect(refresh).toHaveBeenCalledTimes(1);
});

test('shows the spinner while refreshing', async () => {
  mockViewModel.mockReturnValue({ ...success, isRefreshing: true });

  await render(<WeatherScreen />);
  const { refreshControl } = screen.getByTestId('weather-scroll').props;

  expect(refreshControl.props.refreshing).toBe(true);
});
