import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import type { HourView } from '../hooks/forecastView';
import { ForecastCard } from './ForecastCard';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  hours: HourView[];
};

export function HourlyForecast({ hours }: Props) {
  const t = useT();

  return (
    <ForecastCard title={t('weather.hourlyTitle')}>
      <FlatList
        horizontal
        data={hours}
        keyExtractor={hour => hour.time}
        renderItem={({ item }) => <HourItem hour={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </ForecastCard>
  );
}

function HourItem({ hour }: { hour: HourView }) {
  return (
    <View style={styles.hour}>
      <Text style={styles.time}>{hour.label}</Text>
      <WeatherIcon condition={hour.condition} isDay={hour.isDay} size={28} />
      <Text style={styles.temperature}>{hour.temperature}</Text>
      {hour.precipitationChance !== null && (
        <Text style={styles.chance}>{hour.precipitationChance}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hour: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chance: {
    fontSize: 12,
    color: colors.accent,
  },
});
