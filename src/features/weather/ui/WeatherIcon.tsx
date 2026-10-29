import { Text } from 'react-native';
import type { WeatherCondition } from '../../../shared/utils/weatherCode';

// one emoji per condition, for day and night. change any of them you like,
// or replace this whole file with real icons later: nothing else cares how
// the icon is drawn
export const WEATHER_ICONS: Record<
  WeatherCondition,
  { day: string; night: string }
> = {
  clear: { day: '☀️', night: '🌙' },
  mainlyClear: { day: '🌤️', night: '🌙' },
  partlyCloudy: { day: '⛅', night: '☁️' },
  overcast: { day: '☁️', night: '☁️' },
  fog: { day: '🌫️', night: '🌫️' },
  drizzle: { day: '🌦️', night: '🌧️' },
  freezingDrizzle: { day: '🌧️', night: '🌧️' },
  rain: { day: '🌧️', night: '🌧️' },
  freezingRain: { day: '🌧️', night: '🌧️' },
  snow: { day: '❄️', night: '❄️' },
  snowGrains: { day: '❄️', night: '❄️' },
  rainShowers: { day: '🌦️', night: '🌧️' },
  snowShowers: { day: '🌨️', night: '🌨️' },
  thunderstorm: { day: '⛈️', night: '⛈️' },
  thunderstormHail: { day: '⛈️', night: '⛈️' },
  unknown: { day: '❔', night: '❔' },
};

type Props = {
  condition: WeatherCondition;
  isDay: boolean;
  size?: number;
};

export function WeatherIcon({ condition, isDay, size = 24 }: Props) {
  const icon = WEATHER_ICONS[condition];
  // the condition text is always shown next to the icon, so screen readers skip the emoji
  return (
    <Text
      importantForAccessibility="no"
      style={{ fontSize: size, lineHeight: Math.round(size * 1.2) }}
    >
      {isDay ? icon.day : icon.night}
    </Text>
  );
}
