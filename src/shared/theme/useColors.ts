import { darkColors, lightColors, type Colors } from './palettes';
import { type ThemeName, useThemeName } from './useThemeName';

const PALETTES: Record<ThemeName, Colors> = {
  light: lightColors,
  dark: darkColors,
};

export function useColors(): Colors {
  return PALETTES[useThemeName()];
}
