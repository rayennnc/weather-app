import { render, screen } from '@testing-library/react-native';
import { CurrentWeather } from './CurrentWeather';

const current = {
  condition: 'partlyCloudy',
  isDay: true,
  temperature: '31°',
  conditionText: 'Partly cloudy',
  feelsLike: 'Feels like 34°',
} as const;

test('shows the place, the temperature, the condition and when it was updated', async () => {
  await render(
    <CurrentWeather
      location="Jakarta"
      current={current}
      updated="Updated 11:51"
    />,
  );

  expect(screen.getByText('Jakarta')).toBeOnTheScreen();
  expect(screen.getByText('31°')).toBeOnTheScreen();
  expect(screen.getByText('Partly cloudy')).toBeOnTheScreen();
  expect(screen.getByText('Feels like 34°')).toBeOnTheScreen();
  expect(screen.getByText('Updated 11:51')).toBeOnTheScreen();
});

test('is one item for a screen reader, which says everything it shows', async () => {
  await render(
    <CurrentWeather
      location="Jakarta"
      current={current}
      updated="Updated 11:51"
    />,
  );

  const summary = screen.getByLabelText(
    'Jakarta, 31°, Partly cloudy, Feels like 34°, Updated 11:51',
  );
  expect(summary).toHaveProp('accessible', true);
});
