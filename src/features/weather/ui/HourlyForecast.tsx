import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useT, type Translate } from '../../../shared/i18n/useT';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import type { HourView } from '../hooks/forecastView';
import { CARD_PADDING, ForecastCard } from './ForecastCard';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  hours: HourView[];
};

export function HourlyForecast({ hours }: Props) {
  const t = useT();

  // when every hour is over there is nothing to show, and an empty card says nothing
  if (hours.length === 0) {
    return null;
  }

  return (
    <ForecastCard title={t('weather.hourlyTitle')}>
      <FlatList
        horizontal
        testID="hourly-list"
        // the hours slide out at the edge of the card, not at its padding
        style={listStyles.list}
        contentContainerStyle={listStyles.content}
        data={hours}
        keyExtractor={hour => hour.time}
        renderItem={({ item }) => <HourItem hour={item} />}
        showsHorizontalScrollIndicator={false}
      />
    </ForecastCard>
  );
}

// what a screen reader says for an hour, in one go
function describeHour(hour: HourView, t: Translate) {
  return [
    hour.label,
    t(`condition.${hour.condition}`),
    hour.temperature,
    hour.precipitationChance === null
      ? null
      : t('weather.rainChance', { chance: hour.precipitationChance }),
  ]
    .filter(Boolean)
    .join(', ');
}

function HourItem({ hour }: { hour: HourView }) {
  const t = useT();
  const styles = useThemedStyles(createStyles);
  return (
    <View
      accessible
      accessibilityLabel={describeHour(hour, t)}
      style={styles.hour}
    >
      <Text style={styles.time}>{hour.label}</Text>
      <WeatherIcon condition={hour.condition} isDay={hour.isDay} size={28} />
      <Text style={styles.temperature}>{hour.temperature}</Text>
      {hour.precipitationChance !== null && (
        <Text style={styles.chance}>{hour.precipitationChance}</Text>
      )}
    </View>
  );
}

const listStyles = StyleSheet.create({
  list: {
    marginHorizontal: -CARD_PADDING,
  },
  content: {
    paddingHorizontal: CARD_PADDING,
  },
});

function createStyles(colors: Colors) {
  return StyleSheet.create({
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
}
