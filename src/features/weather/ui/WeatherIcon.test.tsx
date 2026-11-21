import { render, screen } from '@testing-library/react-native';
import { WEATHER_ICONS, WeatherIcon } from './WeatherIcon';

// in Jest every icon is a plain element that keeps the props it was given
// (see __mocks__/@react-native-vector-icons/common.js), so a test reads the name from it
const getIcon = () => screen.getByTestId('weather-icon');

test('shows the day icon during the day', async () => {
  await render(<WeatherIcon condition="clear" isDay />);

  expect(getIcon()).toHaveProp('name', WEATHER_ICONS.clear.day);
});

test('shows the night icon at night', async () => {
  await render(<WeatherIcon condition="clear" isDay={false} />);

  expect(getIcon()).toHaveProp('name', WEATHER_ICONS.clear.night);
});

test('is 24 big unless told otherwise', async () => {
  await render(<WeatherIcon condition="rain" isDay />);

  expect(getIcon()).toHaveProp('size', 24);
});

test('is as big as it is asked to be', async () => {
  await render(<WeatherIcon condition="rain" isDay size={96} />);

  expect(getIcon()).toHaveProp('size', 96);
});

test('is hidden from screen readers', async () => {
  await render(<WeatherIcon condition="rain" isDay />);

  expect(getIcon()).toHaveProp('importantForAccessibility', 'no');
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
