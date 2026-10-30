import type { Translate } from '../../../shared/i18n/useT';
import { formatHour } from '../../../shared/utils/formatHour';
import { formatPercent } from '../../../shared/utils/formatPercent';
import { formatTemperature } from '../../../shared/utils/formatTemperature';
import { getWeekday } from '../../../shared/utils/getWeekday';
import type { WeatherCondition } from '../../../shared/utils/weatherCode';
import type { Forecast } from '../data/forecast';

// display-ready forecast: every string is already formatted and translated,
// so the screen only draws it

export type CurrentView = {
  condition: WeatherCondition;
  isDay: boolean;
  temperature: string;
  conditionText: string;
  feelsLike: string;
};

export type HourView = {
  time: string; // also the list key
  label: string;
  condition: WeatherCondition;
  isDay: boolean;
  temperature: string;
  precipitationChance: string | null;
};

export type DayView = {
  date: string; // also the list key
  label: string;
  condition: WeatherCondition;
  temperatureMax: string;
  temperatureMin: string;
  precipitationChance: string | null;
};

export type ForecastView = {
  current: CurrentView;
  hourly: HourView[];
  daily: DayView[];
};

function formatChance(value: number | null): string | null {
  return value === null ? null : formatPercent(value);
}

export function toForecastView(forecast: Forecast, t: Translate): ForecastView {
  const { current } = forecast;
  // date part of the location's current time, e.g. '2026-10-28'
  const today = current.time.slice(0, 10);

  return {
    current: {
      condition: current.condition,
      isDay: current.isDay,
      temperature: formatTemperature(current.temperature),
      conditionText: t(`condition.${current.condition}`),
      feelsLike: t('weather.feelsLike', {
        temperature: formatTemperature(current.apparentTemperature),
      }),
    },
    // the api starts the hourly list at the current hour
    hourly: forecast.hourly.map((hour, index) => ({
      time: hour.time,
      label: index === 0 ? t('weather.now') : formatHour(hour.time),
      condition: hour.condition,
      isDay: hour.isDay,
      temperature: formatTemperature(hour.temperature),
      precipitationChance: formatChance(hour.precipitationProbability),
    })),
    daily: forecast.daily.map(day => ({
      date: day.date,
      label:
        day.date === today
          ? t('weather.today')
          : t(`weekday.${getWeekday(day.date)}`),
      condition: day.condition,
      temperatureMax: formatTemperature(day.temperatureMax),
      temperatureMin: formatTemperature(day.temperatureMin),
      precipitationChance: formatChance(day.precipitationProbabilityMax),
    })),
  };
}
