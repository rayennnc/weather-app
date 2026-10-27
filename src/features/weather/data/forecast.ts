import { WeatherCondition } from '../../../shared/utils/weatherCode';

// all times are local to the forecast's location, written like the api does
// ('2026-10-26T07:15'). the device timezone is never involved

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  condition: WeatherCondition;
  windSpeed: number;
  windDirection: number;
};

export type HourlyForecast = {
  time: string;
  temperature: number;
  precipitationProbability: number | null;
  condition: WeatherCondition;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  condition: WeatherCondition;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbabilityMax: number | null;
  sunrise: string;
  sunset: string;
  uvIndexMax: number | null;
};

export type Forecast = {
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
};
