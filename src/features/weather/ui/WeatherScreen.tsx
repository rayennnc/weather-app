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
  onLocationsPress: () => void;
  onSearchPress: () => void;
  onSettingsPress: () => void;
};

export function WeatherScreen({
  onLocationsPress,
  onSearchPress,
  onSettingsPress,
}: Props) {
  const t = useT();
  const state = useWeatherViewModel();

  return (
    <SafeAreaView style={styles.container}>
      {/* outside WeatherContent, so a failed forecast still lets the user pick another city */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={onLocationsPress}
          style={styles.topButton}
        >
          <Text style={styles.topButtonText}>{t('weather.locations')}</Text>
        </Pressable>
        <View style={styles.topButtons}>
          <Pressable
            accessibilityRole="button"
            onPress={onSearchPress}
            style={styles.topButton}
          >
            <Text style={styles.topButtonText}>{t('weather.search')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onSettingsPress}
            style={styles.topButton}
          >
            <Text style={styles.topButtonText}>{t('weather.settings')}</Text>
          </Pressable>
        </View>
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
    flexDirection: 'row',
    // a large font can make the buttons too wide for one row
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
  },
  topButtonText: {
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
