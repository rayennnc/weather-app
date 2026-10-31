import { StyleSheet, Text, View } from 'react-native';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';
import type { DetailView } from '../hooks/forecastView';
import { ForecastCard } from './ForecastCard';

type Props = {
  details: DetailView[];
};

export function DetailsCard({ details }: Props) {
  const t = useT();

  return (
    <ForecastCard title={t('weather.detailsTitle')}>
      <View style={styles.grid}>
        {details.map(detail => (
          <View key={detail.id} style={styles.tile}>
            <Text style={styles.label}>{detail.label}</Text>
            <Text style={styles.value}>{detail.value}</Text>
          </View>
        ))}
      </View>
    </ForecastCard>
  );
}

const styles = StyleSheet.create({
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
