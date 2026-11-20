import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../shared/i18n/useT';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import type { DayView } from '../hooks/forecastView';
import { ForecastCard } from './ForecastCard';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  days: DayView[];
};

export function DailyForecast({ days }: Props) {
  const t = useT();
  const styles = useThemedStyles(createStyles);

  return (
    <ForecastCard title={t('weather.dailyTitle')}>
      {days.map(day => (
        <View key={day.date} style={styles.row}>
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
