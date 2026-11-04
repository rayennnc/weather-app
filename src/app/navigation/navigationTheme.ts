import { DefaultTheme, type Theme } from '@react-navigation/native';
import { colors } from '../../shared/theme/colors';

// the navigator draws the header and the screen background, so it uses the app colors too
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.card,
    text: colors.text,
  },
};
