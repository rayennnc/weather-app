import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import { useSettingsViewModel } from '../hooks/useSettingsViewModel';
import { SegmentedControl } from './SegmentedControl';

export function SettingsScreen() {
  const t = useT();
  const {
    temperatureOptions,
    windSpeedOptions,
    selectTemperature,
    selectWindSpeed,
  } = useSettingsViewModel();

  return (
    // the navigator draws the header, so only the bottom needs a safe area
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.setting}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('settings.temperature')}
        </Text>
        <SegmentedControl
          label={t('settings.temperature')}
          options={temperatureOptions}
          onSelect={selectTemperature}
        />
      </View>
      <View style={styles.setting}>
        <Text accessibilityRole="header" style={styles.title}>
          {t('settings.windSpeed')}
        </Text>
        <SegmentedControl
          label={t('settings.windSpeed')}
          options={windSpeedOptions}
          onSelect={selectWindSpeed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 24,
  },
  setting: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
