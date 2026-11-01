import type { Translate } from '../../../shared/i18n/useT';
import { formatHour } from '../../../shared/utils/formatHour';
import { formatPercent } from '../../../shared/utils/formatPercent';
import { formatPrecipitation } from '../../../shared/utils/formatPrecipitation';
import { formatTemperature } from '../../../shared/utils/formatTemperature';
import { formatTimeAtOffset } from '../../../shared/utils/formatTimeAtOffset';
import {
  formatWindSpeed,
  type WindSpeedUnit,
} from '../../../shared/utils/formatWindSpeed';
import { getWeekday } from '../../../shared/utils/getWeekday';
import type { WeatherCondition } from '../../../shared/utils/weatherCode';
import type { Forecast } from '../data/forecast';

// display-ready forecast: every string is already formatted and translated,
// so the screen only draws it

// shown when the api has no value for a detail
const NO_VALUE = '–';

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

export type DetailView = {
  id: 'humidity' | 'wind' | 'precipitation' | 'uv' | 'sunrise' | 'sunset';
  label: string;
  value: string;
};

export type ForecastView = {
  current: CurrentView;
  updated: string;
  hourly: HourView[];
  daily: DayView[];
  details: DetailView[];
};

type Options = {
  updatedAt: number; // epoch ms of the last successful fetch
  windSpeedUnit: WindSpeedUnit;
};

function formatChance(value: number | null): string | null {
  return value === null ? null : formatPercent(value);
}

export function toForecastView(
  forecast: Forecast,
  t: Translate,
  { updatedAt, windSpeedUnit }: Options,
): ForecastView {
  const { current } = forecast;
  // date part of the location's current time, e.g. '2026-10-28'
  const today = current.time.slice(0, 10);
  const todayDaily = forecast.daily.find(day => day.date === today);
  const uvIndex = todayDaily?.uvIndexMax ?? null;

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
    updated: t('weather.updated', {
      time: formatTimeAtOffset(updatedAt, forecast.utcOffsetSeconds),
    }),
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
    details: [
      {
        id: 'humidity',
        label: t('detail.humidity'),
        value: formatPercent(current.humidity),
      },
      {
        id: 'wind',
        label: t('detail.wind'),
        value: formatWindSpeed(current.windSpeed, windSpeedUnit),
      },
      {
        id: 'precipitation',
        label: t('detail.precipitation'),
        value: formatPrecipitation(current.precipitation),
      },
      {
        id: 'uv',
        label: t('detail.uv'),
        value: uvIndex === null ? NO_VALUE : String(Math.round(uvIndex)),
      },
      {
        id: 'sunrise',
        label: t('detail.sunrise'),
        value: todayDaily ? formatHour(todayDaily.sunrise) : NO_VALUE,
      },
      {
        id: 'sunset',
        label: t('detail.sunset'),
        value: todayDaily ? formatHour(todayDaily.sunset) : NO_VALUE,
      },
    ],
  };
}
