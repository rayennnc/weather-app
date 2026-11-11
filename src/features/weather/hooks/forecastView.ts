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
import { localIsoAtOffset } from '../../../shared/utils/localIsoAtOffset';
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
  now: number; // epoch ms, the moment the screen is drawn
  updatedAt: number; // epoch ms of the last successful fetch
  windSpeedUnit: WindSpeedUnit;
};

function formatChance(value: number | null): string | null {
  return value === null ? null : formatPercent(value);
}

export function toForecastView(
  forecast: Forecast,
  t: Translate,
  { now, updatedAt, windSpeedUnit }: Options,
): ForecastView {
  const { current, utcOffsetSeconds } = forecast;
  // a forecast can be hours or days old (it is saved on the phone), so "now"
  // and "today" come from the clock of the place, not from when the api answered
  const clock = localIsoAtOffset(now, utcOffsetSeconds); // '2026-10-28T14:20'
  const today = clock.slice(0, 10);
  const thisHour = clock.slice(0, 13);
  const todayDaily = forecast.daily.find(day => day.date === today);
  const uvIndex = todayDaily?.uvIndexMax ?? null;
  const updatedClock = localIsoAtOffset(updatedAt, utcOffsetSeconds);
  const updatedDate = updatedClock.slice(0, 10);
  const updatedTime = formatTimeAtOffset(updatedAt, utcOffsetSeconds);

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
    // add the weekday when the data is not from today, or "11:51" alone is a guess
    updated:
      updatedDate === today
        ? t('weather.updated', { time: updatedTime })
        : t('weather.updatedOn', {
            day: t(`weekday.${getWeekday(updatedDate)}`),
            time: updatedTime,
          }),
    // the hours that are over are dropped, so the list starts at the current hour.
    // the strings are fixed width, so comparing them as text compares the times
    hourly: forecast.hourly
      .filter(hour => hour.time >= thisHour)
      .map(hour => ({
        time: hour.time,
        label: hour.time.startsWith(thisHour)
          ? t('weather.now')
          : formatHour(hour.time),
        condition: hour.condition,
        isDay: hour.isDay,
        temperature: formatTemperature(hour.temperature),
        precipitationChance: formatChance(hour.precipitationProbability),
      })),
    daily: forecast.daily
      .filter(day => day.date >= today)
      .map(day => ({
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
