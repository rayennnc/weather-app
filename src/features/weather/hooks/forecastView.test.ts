import { t } from '../../../shared/i18n/useT';
import type { Forecast } from '../data/forecast';
import { toForecastView } from './forecastView';

const forecast: Forecast = {
  timezone: 'Asia/Jakarta',
  utcOffsetSeconds: 25200,
  current: {
    time: '2026-10-28T14:00',
    temperature: 30.6,
    apparentTemperature: 34.2,
    humidity: 70,
    isDay: true,
    precipitation: 0,
    condition: 'partlyCloudy',
    windSpeed: 9.4,
    windDirection: 180,
  },
  hourly: [
    {
      time: '2026-10-28T14:00',
      temperature: 30.6,
      precipitationProbability: 40,
      condition: 'partlyCloudy',
      isDay: true,
    },
    {
      time: '2026-10-28T15:00',
      temperature: 29.4,
      precipitationProbability: null,
      condition: 'rain',
      isDay: true,
    },
  ],
  daily: [
    {
      date: '2026-10-28',
      condition: 'rain',
      temperatureMax: 32.2,
      temperatureMin: 24.6,
      precipitationProbabilityMax: 80,
      sunrise: '2026-10-28T05:41',
      sunset: '2026-10-28T17:52',
      uvIndexMax: 11,
    },
    {
      date: '2026-10-29',
      condition: 'clear',
      temperatureMax: 33,
      temperatureMin: 25,
      precipitationProbabilityMax: null,
      sunrise: '2026-10-29T05:41',
      sunset: '2026-10-29T17:52',
      uvIndexMax: null,
    },
  ],
};

// 04:51 UTC, which is 11:51 in Jakarta (+7)
const options = {
  updatedAt: Date.UTC(2026, 9, 28, 4, 51),
  windSpeedUnit: 'kmh',
} as const;

describe('toForecastView', () => {
  const view = toForecastView(forecast, t, options);

  test('formats the current weather', () => {
    expect(view.current).toEqual({
      condition: 'partlyCloudy',
      isDay: true,
      temperature: '31°',
      conditionText: 'Partly cloudy',
      feelsLike: 'Feels like 34°',
    });
  });

  test('labels the first hour Now and the others with their time', () => {
    expect(view.hourly.map(hour => hour.label)).toEqual(['Now', '15:00']);
  });

  test('formats temperature and rain chance per hour', () => {
    expect(view.hourly[0]).toMatchObject({
      temperature: '31°',
      precipitationChance: '40%',
    });
    expect(view.hourly[1]).toMatchObject({
      temperature: '29°',
      precipitationChance: null,
    });
  });

  test('labels today and then the weekday', () => {
    // 2026-10-28 is the date of current.time, 2026-10-29 is a Thursday
    expect(view.daily.map(day => day.label)).toEqual(['Today', 'Thu']);
  });

  test('formats min, max and rain chance per day', () => {
    expect(view.daily[0]).toMatchObject({
      temperatureMax: '32°',
      temperatureMin: '25°',
      precipitationChance: '80%',
    });
    expect(view.daily[1].precipitationChance).toBeNull();
  });

  test('shows when the data was last updated, on the location clock', () => {
    expect(view.updated).toBe('Updated 11:51');
  });

  test('builds the details of the current weather and today', () => {
    expect(view.details).toEqual([
      { id: 'humidity', label: 'Humidity', value: '70%' },
      { id: 'wind', label: 'Wind', value: '9 km/h' },
      { id: 'precipitation', label: 'Precipitation', value: '0 mm' },
      { id: 'uv', label: 'UV index', value: '11' },
      { id: 'sunrise', label: 'Sunrise', value: '05:41' },
      { id: 'sunset', label: 'Sunset', value: '17:52' },
    ]);
  });

  test('uses the requested wind speed unit', () => {
    const mph = toForecastView(forecast, t, {
      ...options,
      windSpeedUnit: 'mph',
    });

    expect(mph.details.find(detail => detail.id === 'wind')?.value).toBe(
      '9 mph',
    );
  });

  test('shows a dash when today has no UV index or no daily entry', () => {
    const noUv = toForecastView(
      { ...forecast, daily: [{ ...forecast.daily[0], uvIndexMax: null }] },
      t,
      options,
    );
    const noDay = toForecastView({ ...forecast, daily: [] }, t, options);

    expect(noUv.details.find(detail => detail.id === 'uv')?.value).toBe('–');
    expect(noDay.details.find(detail => detail.id === 'sunrise')?.value).toBe(
      '–',
    );
    expect(noDay.details.find(detail => detail.id === 'uv')?.value).toBe('–');
  });

  test('handles empty lists', () => {
    const empty = toForecastView(
      { ...forecast, hourly: [], daily: [] },
      t,
      options,
    );

    expect(empty.hourly).toEqual([]);
    expect(empty.daily).toEqual([]);
  });
});
