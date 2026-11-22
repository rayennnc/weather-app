import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Colors } from '../../../shared/theme/palettes';
import { useThemedStyles } from '../../../shared/theme/useThemedStyles';

// the hourly list reaches the edges of the card, so it has to know the padding
export const CARD_PADDING = 16;

type Props = {
  title: string;
  children: ReactNode;
};

export function ForecastCard({ title, children }: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: CARD_PADDING,
      gap: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
}
