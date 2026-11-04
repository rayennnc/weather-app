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

type Props = {
  onSearchPress: () => void;
};

export function WeatherScreen({ onSearchPress }: Props) {
  const t = useT();
  const state = useWeatherViewModel();

  return (
    <SafeAreaView style={styles.container}>
      {/* outside weather content, so a failed forecast still let user search for another city */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={onSearchPress}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>{t('weather.search')}</Text>
        </Pressable>
      </View>
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
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
  },
  searchButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
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
