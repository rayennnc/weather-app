import type { StatusBarStyle } from 'react-native';
import { useThemeName } from './useThemeName';

export function useStatusBarStyle(): StatusBarStyle {
  return useThemeName() === 'dark' ? 'light-content' : 'dark-content';
}
