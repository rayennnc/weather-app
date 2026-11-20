import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { Colors } from './palettes';
import { useColors } from './useColors';

type Styles = Record<string, ImageStyle | TextStyle | ViewStyle>;

// Memoize styles by theme; define createStyles outside the component to keep its reference stable.
export function useThemedStyles<T extends Styles>(
  createStyles: (colors: Colors) => T,
): T {
  const colors = useColors();
  return useMemo(() => createStyles(colors), [createStyles, colors]);
}
