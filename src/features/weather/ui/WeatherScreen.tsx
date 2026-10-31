import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import {
  useWeatherViewModel,
  type WeatherScreenState,
} from '../hooks/useWeatherViewModel';
import { CurrentWeather } from './CurrentWeather';
import { DailyForecast } from './DailyForecast';
import { DetailsCard } from './DetailsCard';
import { HourlyForecast } from './HourlyForecast';
import { WeatherSkeleton } from './WeatherSkeleton';

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
      return <WeatherSkeleton />;
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
        <ScrollView
          testID="weather-scroll"
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={state.refresh}
            />
          }
        >
          <CurrentWeather
            location={state.location}
            current={state.current}
            updated={state.updated}
          />
          <HourlyForecast hours={state.hourly} />
          <DailyForecast days={state.daily} />
          <DetailsCard details={state.details} />
        </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '600',
  },
});
