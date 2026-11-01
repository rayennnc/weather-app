import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';
import { useT } from '../../../shared/i18n/useT';
import { colors } from '../../../shared/theme/colors';

// one value drives the whole skeleton: it fades between half and full opacity
function usePulse() {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
}

type BoxProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
};

function Box({ width, height, radius = 8 }: BoxProps) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: colors.skeleton,
      }}
    />
  );
}

// gray shapes where the weather will appear, same layout as the real screen
export function WeatherSkeleton() {
  const t = useT();
  const opacity = usePulse();

  return (
    <Animated.View
      accessible
      accessibilityLabel={t('weather.loading')}
      accessibilityState={{ busy: true }}
      style={[styles.container, { opacity }]}
    >
      <View style={styles.current}>
        <Box width={140} height={32} />
        <Box width={96} height={96} radius={48} />
        <Box width={120} height={72} />
        <Box width={100} height={22} />
      </View>
      <Box width="100%" height={150} radius={16} />
      <Box width="100%" height={260} radius={16} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  current: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
});
