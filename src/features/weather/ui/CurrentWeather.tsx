import { StyleSheet, Text, View } from 'react-native';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import type { CurrentView } from '../hooks/forecastView';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  location: string;
  current: CurrentView;
  updated: string;
};

export function CurrentWeather({ location, current, updated }: Props) {
  const styles = useThemedStyles(createStyles);
  // one stop for a screen reader instead of five
  const summary = [
    location,
    current.temperature,
    current.conditionText,
    current.feelsLike,
    updated,
  ].join(', ');
  return (
    <View accessible accessibilityLabel={summary} style={styles.container}>
      <Text style={styles.location}>{location}</Text>
      <WeatherIcon
        condition={current.condition}
        isDay={current.isDay}
        size={96}
      />
      <Text style={styles.temperature}>{current.temperature}</Text>
      <Text style={styles.condition}>{current.conditionText}</Text>
      <Text style={styles.secondary}>{current.feelsLike}</Text>
      <Text style={styles.updated}>{updated}</Text>
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 12,
      paddingVertical: 24,
    },
    location: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text,
    },
    temperature: {
      fontSize: 72,
      fontWeight: '300',
      color: colors.text,
    },
    condition: {
      fontSize: 22,
      color: colors.text,
    },
    secondary: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    updated: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
}
