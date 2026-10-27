import { getWeatherCondition, WeatherCondition } from './weatherCode';

// every row of the wmo table in the open-meteo docs
const DOCS_TABLE: [number, WeatherCondition][] = [
  [0, 'clear'],
  [1, 'mainlyClear'],
  [2, 'partlyCloudy'],
  [3, 'overcast'],
  [45, 'fog'],
  [48, 'fog'],
  [51, 'drizzle'],
  [53, 'drizzle'],
  [55, 'drizzle'],
  [56, 'freezingDrizzle'],
  [57, 'freezingDrizzle'],
  [61, 'rain'],
  [63, 'rain'],
  [65, 'rain'],
  [66, 'freezingRain'],
  [67, 'freezingRain'],
  [71, 'snow'],
  [73, 'snow'],
  [75, 'snow'],
  [77, 'snowGrains'],
  [80, 'rainShowers'],
  [81, 'rainShowers'],
  [82, 'rainShowers'],
  [85, 'snowShowers'],
  [86, 'snowShowers'],
  [95, 'thunderstorm'],
  [96, 'thunderstormHail'],
  [97, 'thunderstorm'],
  [99, 'thunderstormHail'],
];

describe('getWeatherCondition', () => {
  it.each(DOCS_TABLE)('maps code %i to %s', (code, condition) => {
    expect(getWeatherCondition(code)).toBe(condition);
  });

  it.each([4, 42, 100, -1, 2.5, NaN])('falls back to unknown for %p', code => {
    expect(getWeatherCondition(code)).toBe('unknown');
  });
});
