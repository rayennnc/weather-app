import fixture from './__fixtures__/forecast-jakarta.json';
import { mapForecast } from './forecastMapper';
import { forecastResponseSchema } from './forecastSchema';

// parse returns a fresh copy every time, so a test can change it safely
const parsedFixture = () => forecastResponseSchema.parse(fixture);

describe('mapForecast', () => {
  it('keeps the timezone of the location', () => {
    const forecast = mapForecast(parsedFixture());

    expect(forecast.timezone).toBe('Asia/Jakarta');
    expect(forecast.utcOffsetSeconds).toBe(25200);
  });

  it('maps the current weather', () => {
    const { current } = mapForecast(parsedFixture());

    expect(current).toEqual({
      time: '2026-10-26T07:15',
      temperature: 27.8,
      apparentTemperature: 32.1,
      humidity: 71,
      isDay: true,
      precipitation: 0,
      condition: 'overcast',
      windSpeed: 3.5,
      windDirection: 231,
    });
  });

  it('turns the parallel hourly arrays into one object per hour', () => {
    const { hourly } = mapForecast(parsedFixture());

    expect(hourly).toHaveLength(48);
    expect(hourly[0]).toEqual({
      time: '2026-10-26T07:00',
      temperature: 27.4,
      precipitationProbability: 10,
      condition: 'overcast',
      isDay: true,
    });
    expect(hourly[6]).toMatchObject({
      time: '2026-10-26T13:00',
      temperature: 32.3,
      precipitationProbability: 49,
      condition: 'drizzle',
    });
    expect(hourly[47]).toEqual({
      time: '2026-10-28T06:00',
      temperature: 24.7,
      precipitationProbability: 65,
      condition: 'overcast',
      isDay: true,
    });
  });

  it('marks the hours after sunset as night', () => {
    const { hourly } = mapForecast(parsedFixture());

    // sunset is 17:45, so 17:00 is still day and 18:00 is night
    expect(hourly[10]).toMatchObject({ time: '2026-10-26T17:00', isDay: true });
    expect(hourly[11]).toMatchObject({
      time: '2026-10-26T18:00',
      isDay: false,
    });
  });

  it('turns the daily arrays into one object per day', () => {
    const { daily } = mapForecast(parsedFixture());

    expect(daily).toHaveLength(7);
    expect(daily[0]).toEqual({
      date: '2026-10-26',
      condition: 'drizzle',
      temperatureMax: 33.4,
      temperatureMin: 25.8,
      precipitationProbabilityMax: 99,
      sunrise: '2026-10-26T05:27',
      sunset: '2026-10-26T17:45',
      uvIndexMax: 8.85,
    });
    expect(daily[2].condition).toBe('rainShowers');
    expect(daily[6]).toMatchObject({
      date: '2026-11-01',
      temperatureMax: 32.1,
      uvIndexMax: 7.4,
    });
  });

  it('keeps null for values the api did not provide', () => {
    const response = parsedFixture();
    response.hourly.precipitation_probability[0] = null;
    response.daily.uv_index_max[0] = null;

    const forecast = mapForecast(response);

    expect(forecast.hourly[0].precipitationProbability).toBeNull();
    expect(forecast.daily[0].uvIndexMax).toBeNull();
  });

  it('uses unknown for a weather code it does not know', () => {
    const response = parsedFixture();
    response.current.weather_code = 999;

    expect(mapForecast(response).current.condition).toBe('unknown');
  });

  it('knows every weather code in the real response', () => {
    const forecast = mapForecast(parsedFixture());
    const conditions = [
      forecast.current.condition,
      ...forecast.hourly.map(hour => hour.condition),
      ...forecast.daily.map(day => day.condition),
    ];

    expect(conditions).not.toContain('unknown');
  });
});
