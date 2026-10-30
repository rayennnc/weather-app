import { render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import type { HourView } from '../hooks/forecastView';
import { HourlyForecast } from './HourlyForecast';

const hours: HourView[] = [
  {
    time: '2026-10-28T14:00',
    label: 'Now',
    condition: 'clear',
    isDay: true,
    temperature: '31°',
    precipitationChance: '10%',
  },
  {
    time: '2026-10-28T15:00',
    label: '15:00',
    condition: 'rain',
    isDay: true,
    temperature: '29°',
    precipitationChance: null,
  },
];

test('shows the title and every hour', async () => {
  await render(<HourlyForecast hours={hours} />);

  expect(screen.getByText(t('weather.hourlyTitle'))).toBeOnTheScreen();
  expect(screen.getByText('Now')).toBeOnTheScreen();
  expect(screen.getByText('31°')).toBeOnTheScreen();
  expect(screen.getByText('15:00')).toBeOnTheScreen();
  expect(screen.getByText('29°')).toBeOnTheScreen();
});

test('shows the rain chance of an hour', async () => {
  await render(<HourlyForecast hours={hours} />);

  expect(screen.getByText('10%')).toBeOnTheScreen();
});
