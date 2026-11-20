import { useColorScheme } from 'react-native';

export type ThemeName = 'light' | 'dark';

export function useThemeName(): ThemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
