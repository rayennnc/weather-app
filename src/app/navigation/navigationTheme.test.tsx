import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../../shared/theme/palettes';
import { navigationThemes, useNavigationTheme } from './navigationTheme';

// the Jest preset replaces useColorScheme with a mock, so a test decides what
// the phone answers
const mockColorScheme = jest.mocked(useColorScheme);

describe('navigationThemes', () => {
  test('the light one is the default theme in the light colors of the app', () => {
    expect(navigationThemes.light).toEqual({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: lightColors.accent,
        background: lightColors.background,
        card: lightColors.card,
        text: lightColors.text,
      },
    });
  });

  test('the dark one is the dark theme in the dark colors of the app', () => {
    expect(navigationThemes.dark).toEqual({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: darkColors.accent,
        background: darkColors.background,
        card: darkColors.card,
        text: darkColors.text,
      },
    });
    expect(navigationThemes.dark.dark).toBe(true);
    expect(navigationThemes.light.dark).toBe(false);
  });
});

describe('useNavigationTheme', () => {
  test('gives the light theme when the phone is light', async () => {
    mockColorScheme.mockReturnValue('light');

    const { result } = await renderHook(() => useNavigationTheme());

    expect(result.current).toBe(navigationThemes.light);
  });

  test('gives the dark theme when the phone is dark', async () => {
    mockColorScheme.mockReturnValue('dark');

    const { result } = await renderHook(() => useNavigationTheme());

    expect(result.current).toBe(navigationThemes.dark);
  });
});
