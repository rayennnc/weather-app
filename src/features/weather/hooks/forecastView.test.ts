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

describe('toForecastView', () => {
  const view = toForecastView(forecast, t);

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

  test('handles empty lists', () => {
    const empty = toForecastView({ ...forecast, hourly: [], daily: [] }, t);

    expect(empty.hourly).toEqual([]);
    expect(empty.daily).toEqual([]);
  });
});
