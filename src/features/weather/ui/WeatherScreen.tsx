import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons/static';
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
import type { Colors } from '../../../shared/theme/palettes';
import { useColors } from '../../../shared/theme/useColors';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
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
  const styles = useThemedStyles(createStyles);
  const state = useWeatherViewModel();

  return (
    <SafeAreaView style={styles.container}>
      {/* outside WeatherContent, so a failed forecast still lets the user pick another city */}
      <View style={styles.topBar}>
        <TopButton
          icon="map-marker-outline"
          label={t('weather.locations')}
          onPress={onLocationsPress}
        />
        <View style={styles.topButtons}>
          <TopButton
            icon="magnify"
            label={t('weather.search')}
            onPress={onSearchPress}
          />
          <TopButton
            icon="cog-outline"
            label={t('weather.settings')}
            onPress={onSettingsPress}
          />
        </View>
      </View>
      <WeatherContent state={state} />
    </SafeAreaView>
  );
}

type TopButtonProps = {
  icon: MaterialDesignIconsIconName;
  label: string;
  onPress: () => void;
};

// shows only an icon, so the label is what a screen reader says
function TopButton({ icon, label, onPress }: TopButtonProps) {
  const styles = useThemedStyles(createStyles);
  const { accent } = useColors();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.topButton}
    >
      <MaterialDesignIcons
        name={icon}
        size={24}
        color={accent}
        testID="top-button-icon"
      />
    </Pressable>
  );
}

function WeatherContent({ state }: { state: WeatherScreenState }) {
  const t = useT();
  const styles = useThemedStyles(createStyles);

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
          <Pressable
            accessibilityRole="link"
            onPress={state.openAttribution}
            style={styles.attribution}
          >
            <Text style={styles.attributionText}>{state.attribution}</Text>
          </Pressable>
        </ScrollView>
      );
  }
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    topButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    topButton: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
      backgroundColor: colors.card,
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
    attribution: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attributionText: {
      fontSize: 14,
      color: colors.textSecondary,
      textDecorationLine: 'underline',
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
}
