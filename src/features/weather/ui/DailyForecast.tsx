import { StyleSheet, Text, View } from 'react-native';
import { useT, type Translate } from '../../../shared/i18n/useT';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import type { DayView } from '../hooks/forecastView';
import { ForecastCard } from './ForecastCard';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  days: DayView[];
};

// what a screen reader says for a day, in one go
function describeDay(day: DayView, t: Translate) {
  return [
    day.label,
    t(`condition.${day.condition}`),
    t('weather.dayTemperatures', {
      max: day.temperatureMax,
      min: day.temperatureMin,
    }),
    day.precipitationChance === null
      ? null
      : t('weather.rainChance', { chance: day.precipitationChance }),
  ]
    .filter(Boolean)
    .join(', ');
}

export function DailyForecast({ days }: Props) {
  const t = useT();
  const styles = useThemedStyles(createStyles);

  return (
    <ForecastCard title={t('weather.dailyTitle')}>
      {days.map(day => (
        <View
          key={day.date}
          accessible
          accessibilityLabel={describeDay(day, t)}
          style={styles.row}
        >
          <Text style={styles.day}>{day.label}</Text>
          <WeatherIcon condition={day.condition} isDay size={28} />
          <Text style={styles.chance}>{day.precipitationChance ?? ''}</Text>
          <Text style={styles.max}>{day.temperatureMax}</Text>
          <Text style={styles.min}>{day.temperatureMin}</Text>
        </View>
      ))}
    </ForecastCard>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    day: {
      width: 56,
      fontSize: 16,
      color: colors.text,
    },
    chance: {
      flex: 1,
      fontSize: 12,
      color: colors.accent,
    },
    max: {
      width: 40,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'right',
      color: colors.text,
    },
    min: {
      width: 40,
      fontSize: 16,
      textAlign: 'right',
      color: colors.textSecondary,
    },
  });
}
