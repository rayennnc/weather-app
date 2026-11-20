import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import {
  type Colors,
  darkColors,
  lightColors,
} from '../../shared/theme/palettes';
import { type ThemeName, useThemeName } from '../../shared/theme/useThemeName';

// the navigator draws the header and the screen background, so it uses the app colors too
function createNavigationTheme(base: Theme, colors: Colors): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.card,
      text: colors.text,
    },
  };
}

export const navigationThemes: Record<ThemeName, Theme> = {
  light: createNavigationTheme(DefaultTheme, lightColors),
  dark: createNavigationTheme(DarkTheme, darkColors),
};

// the navigation theme of the theme the phone is in
export function useNavigationTheme(): Theme {
  return navigationThemes[useThemeName()];
}
