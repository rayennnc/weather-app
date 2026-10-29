import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import {
  useWeatherViewModel,
  type WeatherScreenState,
} from '../hooks/useWeatherViewModel';
import { WeatherIcon } from './WeatherIcon';

export function WeatherScreen() {
  const state = useWeatherViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <WeatherContent state={state} />
    </SafeAreaView>
  );
}

function WeatherContent({ state }: { state: WeatherScreenState }) {
  const t = useT();

  switch (state.status) {
    case 'loading':
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.secondary}>{t('weather.loading')}</Text>
        </View>
      );
    case 'error':
      return (
        <View style={styles.center}>
          <Text style={styles.message}>{state.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={state.retry}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{t('weather.retry')}</Text>
          </Pressable>
        </View>
      );
    case 'success':
      return (
        <View style={styles.center}>
          <Text style={styles.location}>{state.location}</Text>
          <WeatherIcon
            condition={state.current.condition}
            isDay={state.current.isDay}
            size={96}
          />
          <Text style={styles.temperature}>{state.current.temperature}</Text>
          <Text style={styles.condition}>{state.current.conditionText}</Text>
          <Text style={styles.secondary}>{state.current.feelsLike}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3F8',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  location: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
  },
  temperature: {
    fontSize: 72,
    fontWeight: '300',
    color: '#111827',
  },
  condition: {
    fontSize: 22,
    color: '#111827',
  },
  secondary: {
    fontSize: 16,
    color: '#4B5563',
  },
  message: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
