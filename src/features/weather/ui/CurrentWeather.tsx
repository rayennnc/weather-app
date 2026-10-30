import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/colors';
import type { CurrentView } from '../hooks/forecastView';
import { WeatherIcon } from './WeatherIcon';

type Props = {
  location: string;
  current: CurrentView;
};

export function CurrentWeather({ location, current }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.location}>{location}</Text>
      <WeatherIcon
        condition={current.condition}
        isDay={current.isDay}
        size={96}
      />
      <Text style={styles.temperature}>{current.temperature}</Text>
      <Text style={styles.condition}>{current.conditionText}</Text>
      <Text style={styles.secondary}>{current.feelsLike}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
