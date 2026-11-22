import { render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import type { DayView } from '../hooks/forecastView';
import { DailyForecast } from './DailyForecast';

const days: DayView[] = [
  {
    date: '2026-10-28',
    label: 'Today',
    condition: 'rain',
    temperatureMax: '32°',
    temperatureMin: '25°',
    precipitationChance: '80%',
  },
  {
    date: '2026-10-29',
    label: 'Thu',
    condition: 'clear',
    temperatureMax: '33°',
    temperatureMin: '25°',
    precipitationChance: null,
  },
];

test('shows the title and a row per day', async () => {
  await render(<DailyForecast days={days} />);

  expect(screen.getByText(t('weather.dailyTitle'))).toBeOnTheScreen();
  expect(screen.getByText('Today')).toBeOnTheScreen();
  expect(screen.getByText('Thu')).toBeOnTheScreen();
  expect(screen.getByText('32°')).toBeOnTheScreen();
  expect(screen.getByText('33°')).toBeOnTheScreen();
});

test('shows the rain chance of a day', async () => {
  await render(<DailyForecast days={days} />);

  expect(screen.getByText('80%')).toBeOnTheScreen();
});

test('each day is one item for a screen reader, with its condition, temperatures and rain chance', async () => {
  await render(<DailyForecast days={days} />);

  const rainy = screen.getByLabelText(
    'Today, Rain, High 32°, low 25°, 80% chance of rain',
  );
  expect(rainy).toHaveProp('accessible', true);
  // a day without a rain chance does not say one
  expect(screen.getByLabelText('Thu, Clear, High 33°, low 25°')).toHaveProp(
    'accessible',
    true,
  );
});

test('shows the lowest temperature of every day', async () => {
  await render(<DailyForecast days={days} />);

  expect(screen.getAllByText('25°')).toHaveLength(2);
});
