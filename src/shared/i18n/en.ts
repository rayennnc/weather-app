// all ui text lives here. keys are typed, so a typo in t('...') fails typecheck.
// {name} placeholders are filled in by t()
export const en = {
  'weather.loading': 'Loading weather…',
  'weather.retry': 'Try again',
  'weather.feelsLike': 'Feels like {temperature}',
  'weather.now': 'Now',
  'weather.today': 'Today',
  'weather.hourlyTitle': 'Next 48 hours',
  'weather.dailyTitle': '7-day forecast',
  'weather.detailsTitle': 'Details',
  'weather.updated': 'Updated {time}',
  'weather.updatedOn': 'Updated {day} {time}',
  'weather.search': 'Search',
  'weather.locations': 'Locations',
  'weather.settings': 'Settings',

  'search.title': 'Search city',
  'search.placeholder': 'Search for a city',
  'search.hint': 'Type at least {count} letters to search.',
  'search.loading': 'Searching…',
  'search.empty': 'No cities found for “{query}”.',
  'search.retry': 'Try again',

  'locations.title': 'Locations',
  'locations.add': 'Add city',
  'locations.active': 'Active',
  'locations.remove': 'Remove',
  'locations.removeLabel': 'Remove {name}',
  'locations.useMyLocation': 'Use my location',
  'locations.locating': 'Finding your location…',
  'locations.myLocation': 'My location',
  'locations.denied':
    'Location permission was denied. Allow it when asked, or add a city instead.',
  'locations.blocked':
    'Location is turned off for this app. Turn it on in Settings, or add a city instead.',
  'locations.failed':
    'We could not find your location. Check that location is turned on and try again, or add a city instead.',
  'locations.openSettings': 'Open settings',

  'settings.title': 'Settings',
  'settings.temperature': 'Temperature',
  'settings.windSpeed': 'Wind speed',
  'settings.about': 'About',

  'about.title': 'About',
  'about.weatherTitle': 'Weather data',
  'about.weatherCredit': 'Weather data by Open-Meteo.com',
  'about.weatherNote': 'Values are rounded and formatted for display.',
  'about.placesTitle': 'Place names',
  'about.placesCredit': 'Place names from GeoNames',
  'about.license': 'Licensed under CC BY 4.0',

  'unit.celsius': '°C',
  'unit.fahrenheit': '°F',
  'unit.kmh': 'km/h',
  'unit.mph': 'mph',

  'detail.humidity': 'Humidity',
  'detail.wind': 'Wind',
  'detail.precipitation': 'Precipitation',
  'detail.uv': 'UV index',
  'detail.sunrise': 'Sunrise',
  'detail.sunset': 'Sunset',

  'weekday.sun': 'Sun',
  'weekday.mon': 'Mon',
  'weekday.tue': 'Tue',
  'weekday.wed': 'Wed',
  'weekday.thu': 'Thu',
  'weekday.fri': 'Fri',
  'weekday.sat': 'Sat',

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
