import { InvalidResponseError } from '../../../shared/lib/errors';
import { fetchJson } from '../../../shared/lib/http';
import { Forecast } from './forecast';
import { mapForecast } from './forecastMapper';
import { forecastResponseSchema } from './forecastSchema';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'is_day',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
];
const HOURLY = [
  'temperature_2m',
  'precipitation_probability',
  'weather_code',
  'is_day',
];
const DAILY = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
  'uv_index_max',
];

export type ForecastParams = {
  latitude: number;
  longitude: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
};

function buildForecastUrl(params: ForecastParams): string {
  const query = [
    `latitude=${params.latitude}`,
    `longitude=${params.longitude}`,
    `current=${CURRENT.join(',')}`,
    `hourly=${HOURLY.join(',')}`,
    `daily=${DAILY.join(',')}`,
    'timezone=auto',
    'forecast_hours=48',
    `temperature_unit=${params.temperatureUnit}`,
    `wind_speed_unit=${params.windSpeedUnit}`,
  ];
  return `${FORECAST_URL}?${query.join('&')}`;
}

export async function getForecast(
  params: ForecastParams,
  signal?: AbortSignal,
): Promise<Forecast> {
  const json = await fetchJson(buildForecastUrl(params), { signal });

  const parsed = forecastResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new InvalidResponseError(
      'Unexpected forecast response',
      parsed.error,
    );
  }
  return mapForecast(parsed.data);
}
