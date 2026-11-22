import { render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import type { HourView } from '../hooks/forecastView';
import { CARD_PADDING } from './ForecastCard';
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

test('shows no card when every hour is over', async () => {
  await render(<HourlyForecast hours={[]} />);

  expect(screen.queryByText(t('weather.hourlyTitle'))).not.toBeOnTheScreen();
});

test('each hour is one item for a screen reader, with its condition, temperature and rain chance', async () => {
  await render(<HourlyForecast hours={hours} />);

  expect(
    screen.getByLabelText('Now, Clear, 31°, 10% chance of rain'),
  ).toHaveProp('accessible', true);
  // an hour without a rain chance does not say one
  expect(screen.getByLabelText('15:00, Rain, 29°')).toHaveProp(
    'accessible',
    true,
  );
});

test('the list reaches the edges of the card, and keeps the hours off them while at rest', async () => {
  await render(<HourlyForecast hours={hours} />);

  const list = screen.getByTestId('hourly-list');
  expect(list).toHaveStyle({ marginHorizontal: -CARD_PADDING });
  expect(list).toHaveProp('contentContainerStyle', {
    paddingHorizontal: CARD_PADDING,
  });
});
