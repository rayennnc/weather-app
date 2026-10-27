import { getWeatherCondition } from '../../../shared/utils/weatherCode';
import { Forecast } from './forecast';
import { ForecastResponse } from './forecastSchema';

export function mapForecast(response: ForecastResponse): Forecast {
  const { current, hourly, daily } = response;

  return {
    timezone: response.timezone,
    utcOffsetSeconds: response.utc_offset_seconds,
    current: {
      time: current.time,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      isDay: current.is_day === 1,
      precipitation: current.precipitation,
      condition: getWeatherCondition(current.weather_code),
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
    },
    // the api sends parallel arrays (one value per hour), zip them into objects
    hourly: hourly.time.map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i],
      precipitationProbability: hourly.precipitation_probability[i],
      condition: getWeatherCondition(hourly.weather_code[i]),
      isDay: hourly.is_day[i] === 1,
    })),
    daily: daily.time.map((date, i) => ({
      date,
      condition: getWeatherCondition(daily.weather_code[i]),
      temperatureMax: daily.temperature_2m_max[i],
      temperatureMin: daily.temperature_2m_min[i],
      precipitationProbabilityMax: daily.precipitation_probability_max[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uvIndexMax: daily.uv_index_max[i],
    })),
  };
}
