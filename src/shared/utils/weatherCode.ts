// the app's own weather conditions. the ui turns these into text and icons
export type WeatherCondition =
  | 'clear'
  | 'mainlyClear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'freezingDrizzle'
  | 'rain'
  | 'freezingRain'
  | 'snow'
  | 'snowGrains'
  | 'rainShowers'
  | 'snowShowers'
  | 'thunderstorm'
  | 'thunderstormHail'
  | 'unknown';

// wmo codes from the open-meteo docs. 96 and 99 only come from models with a
// hail forecast, the other models report 95 and 97 for thunderstorms
const CONDITION_BY_CODE: Partial<Record<number, WeatherCondition>> = {
  0: 'clear',
  1: 'mainlyClear',
  2: 'partlyCloudy',
  3: 'overcast',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'freezingDrizzle',
  57: 'freezingDrizzle',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'freezingRain',
  67: 'freezingRain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snowGrains',
  80: 'rainShowers',
  81: 'rainShowers',
  82: 'rainShowers',
  85: 'snowShowers',
  86: 'snowShowers',
  95: 'thunderstorm',
  96: 'thunderstormHail',
  97: 'thunderstorm',
  99: 'thunderstormHail',
};

export function getWeatherCondition(code: number): WeatherCondition {
  return CONDITION_BY_CODE[code] ?? 'unknown';
}
