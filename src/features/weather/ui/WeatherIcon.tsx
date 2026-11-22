import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';
import { useColors } from '../../../shared/theme/useColors';
import type { WeatherCondition } from '../../../shared/utils/weatherCode';

type ConditionIcon = {
  day: MaterialDesignIconsIconName;
  night: MaterialDesignIconsIconName;
};

// one icon per condition, for day and night. the names come from the material
// design icons set and the type checks them. change any of them you like:
// nothing else cares how the icon is drawn
export const WEATHER_ICONS: Record<WeatherCondition, ConditionIcon> = {
  clear: { day: 'weather-sunny', night: 'weather-night' },
  mainlyClear: { day: 'weather-sunny', night: 'weather-night' },
  partlyCloudy: {
    day: 'weather-partly-cloudy',
    night: 'weather-night-partly-cloudy',
  },
  overcast: { day: 'weather-cloudy', night: 'weather-cloudy' },
  fog: { day: 'weather-fog', night: 'weather-fog' },
  drizzle: { day: 'weather-partly-rainy', night: 'weather-rainy' },
  freezingDrizzle: { day: 'weather-snowy-rainy', night: 'weather-snowy-rainy' },
  rain: { day: 'weather-rainy', night: 'weather-rainy' },
  freezingRain: { day: 'weather-snowy-rainy', night: 'weather-snowy-rainy' },
  snow: { day: 'weather-snowy', night: 'weather-snowy' },
  snowGrains: { day: 'weather-snowy', night: 'weather-snowy' },
  rainShowers: { day: 'weather-partly-rainy', night: 'weather-rainy' },
  snowShowers: { day: 'weather-snowy-heavy', night: 'weather-snowy-heavy' },
  thunderstorm: {
    day: 'weather-lightning-rainy',
    night: 'weather-lightning-rainy',
  },
  thunderstormHail: {
    day: 'weather-lightning-rainy',
    night: 'weather-lightning-rainy',
  },
  unknown: { day: 'help-circle-outline', night: 'help-circle-outline' },
};

type Props = {
  condition: WeatherCondition;
  isDay: boolean;
  size?: number;
};

export function WeatherIcon({ condition, isDay, size = 24 }: Props) {
  const { text } = useColors();
  const icon = WEATHER_ICONS[condition];
  // the row around the icon already says the condition, so screen readers skip it
  return (
    <MaterialDesignIcons
      name={isDay ? icon.day : icon.night}
      size={size}
      color={text}
      importantForAccessibility="no"
      testID="weather-icon"
    />
  );
}
