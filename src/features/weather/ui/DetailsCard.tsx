import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../shared/i18n/useT';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';
import type { DetailView } from '../hooks/forecastView';
import { ForecastCard } from './ForecastCard';

type Props = {
  details: DetailView[];
};

export function DetailsCard({ details }: Props) {
  const t = useT();
  const styles = useThemedStyles(createStyles);

  return (
    <ForecastCard title={t('weather.detailsTitle')}>
      <View style={styles.grid}>
        {details.map(detail => (
          <View
            key={detail.id}
            accessible
            accessibilityLabel={`${detail.label}, ${detail.value}`}
            style={styles.tile}
          >
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        ))}
      </View>
    </ForecastCard>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tile: {
      width: '50%',
      paddingVertical: 8,
      gap: 2,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    value: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
