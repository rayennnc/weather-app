// all ui text lives here. keys are typed, so a typo in t('...') fails typecheck.
// {name} placeholders are filled in by t()
export const en = {
  'weather.loading': 'Loading weather…',
  'weather.retry': 'Try again',
  'weather.feelsLike': 'Feels like {temperature}',

  'error.network': 'No internet connection. Check it and try again.',
  'error.timeout':
    'The request took too long. Check your connection and try again.',
  'error.server': 'The weather service is having problems. Try again later.',
  'error.invalidData':
    'The weather service sent data we could not read. Try again later.',
  'error.unknown': 'Something went wrong. Please try again.',

  'condition.clear': 'Clear',
  'condition.mainlyClear': 'Mainly clear',
  'condition.partlyCloudy': 'Partly cloudy',
  'condition.overcast': 'Overcast',
  'condition.fog': 'Fog',
  'condition.drizzle': 'Drizzle',
  'condition.freezingDrizzle': 'Freezing drizzle',
  'condition.rain': 'Rain',
  'condition.freezingRain': 'Freezing rain',
  'condition.snow': 'Snow',
  'condition.snowGrains': 'Snow grains',
  'condition.rainShowers': 'Rain showers',
  'condition.snowShowers': 'Snow showers',
  'condition.thunderstorm': 'Thunderstorm',
  'condition.thunderstormHail': 'Thunderstorm with hail',
  'condition.unknown': 'Unknown',
} as const;

export type MessageKey = keyof typeof en;
