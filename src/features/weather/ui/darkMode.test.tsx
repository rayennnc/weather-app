import { render, screen } from '@testing-library/react-native';
import { Text, useColorScheme } from 'react-native';
import { t } from '../../../shared/i18n/useT';
import { darkColors, lightColors } from '../../../shared/theme/palettes';
import { CurrentWeather } from './CurrentWeather';
import { DailyForecast } from './DailyForecast';
import { DetailsCard } from './DetailsCard';
import { ForecastCard } from './ForecastCard';
import { HourlyForecast } from './HourlyForecast';
import { WeatherIcon } from './WeatherIcon';
import { WeatherSkeleton } from './WeatherSkeleton';

// the Jest preset replaces useColorScheme with a mock, so a test decides which
// theme the phone is in
const mockColorScheme = jest.mocked(useColorScheme);

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('in the %s theme', (scheme, palette) => {
  beforeEach(() => {
    mockColorScheme.mockReturnValue(scheme);
  });

  test('a forecast card is a card with a quiet title', async () => {
    await render(
      <ForecastCard title="Title">
        <Text>Content</Text>
      </ForecastCard>,
    );

    expect(screen.getByText('Title')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText('Title').parent).toHaveStyle({
      backgroundColor: palette.card,
    });
  });

  test('the current weather uses the main text color, and a quiet one for the rest', async () => {
    await render(
      <CurrentWeather
        location="Jakarta"
        updated="Updated 11:51"
        current={{
          condition: 'clear',
          isDay: true,
          temperature: '31°',
          conditionText: 'Clear',
          feelsLike: 'Feels like 34°',
        }}
      />,
    );

    expect(screen.getByText('Jakarta')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('31°')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('Feels like 34°')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText('Updated 11:51')).toHaveStyle({
      color: palette.textSecondary,
    });
  });

  test('the hours use the main, quiet and accent colors', async () => {
    await render(
      <HourlyForecast
        hours={[
          {
            time: '2026-10-28T14:00',
            label: 'Now',
            condition: 'rain',
            isDay: true,
            temperature: '30°',
            precipitationChance: '40%',
          },
        ]}
      />,
    );

    expect(screen.getByText('Now')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText('30°')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('40%')).toHaveStyle({ color: palette.accent });
  });

  test('the days use the main, quiet and accent colors', async () => {
    await render(
      <DailyForecast
        days={[
          {
            date: '2026-10-28',
            label: 'Today',
            condition: 'rain',
            temperatureMax: '32°',
            temperatureMin: '25°',
            precipitationChance: '80%',
          },
        ]}
      />,
    );

    expect(screen.getByText('Today')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('32°')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('25°')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText('80%')).toHaveStyle({ color: palette.accent });
  });

  test('the weather icon has the main text color', async () => {
    await render(<WeatherIcon condition="rain" isDay={false} />);

    expect(screen.getByTestId('weather-icon')).toHaveProp(
      'color',
      palette.text,
    );
  });

  test('the skeleton shapes have the skeleton color of the theme, and no other', async () => {
    await render(<WeatherSkeleton />);

    const drawn = JSON.stringify(screen.toJSON());
    const other = scheme === 'dark' ? lightColors : darkColors;
    expect(drawn).toContain(palette.skeleton);
    expect(drawn).not.toContain(other.skeleton);
  });

  test('the details use a quiet label and a main value', async () => {
    await render(
      <DetailsCard
        details={[{ id: 'humidity', label: 'Humidity', value: '70%' }]}
      />,
    );

    expect(screen.getByText('Humidity')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText('70%')).toHaveStyle({ color: palette.text });
    expect(screen.getByText(t('weather.detailsTitle'))).toBeOnTheScreen();
  });
});
