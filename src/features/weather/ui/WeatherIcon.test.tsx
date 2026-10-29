import { render, screen } from '@testing-library/react-native';
import { WEATHER_ICONS, WeatherIcon } from './WeatherIcon';

test('shows the day icon during the day', async () => {
  await render(<WeatherIcon condition="clear" isDay />);

  expect(screen.getByText(WEATHER_ICONS.clear.day)).toBeOnTheScreen();
});

test('shows the night icon at night', async () => {
  await render(<WeatherIcon condition="clear" isDay={false} />);

  expect(screen.getByText(WEATHER_ICONS.clear.night)).toBeOnTheScreen();
});

test('a clear sky looks different by day and by night', () => {
  expect(WEATHER_ICONS.clear.day).not.toBe(WEATHER_ICONS.clear.night);
});

test('every condition has an icon for day and night', () => {
  for (const icon of Object.values(WEATHER_ICONS)) {
    expect(icon.day).not.toBe('');
    expect(icon.night).not.toBe('');
  }
});
