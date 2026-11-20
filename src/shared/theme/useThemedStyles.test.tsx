import { renderHook } from '@testing-library/react-native';
import { StyleSheet, useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from './palettes';
import { useThemedStyles } from './useThemedStyles';

// the Jest preset replaces useColorScheme with a mock, so a test decides what
// the phone answers
const mockColorScheme = jest.mocked(useColorScheme);

// declared once, like a screen does, so its identity never changes
const createStyles = jest.fn((colors: Colors) =>
  StyleSheet.create({ box: { backgroundColor: colors.card } }),
);

beforeEach(() => {
  createStyles.mockClear();
});

test('builds the styles with the colors of the light theme', async () => {
  mockColorScheme.mockReturnValue('light');

  const { result } = await renderHook(() => useThemedStyles(createStyles));

  expect(result.current.box).toEqual({ backgroundColor: lightColors.card });
});

test('builds the styles with the colors of the dark theme', async () => {
  mockColorScheme.mockReturnValue('dark');

  const { result } = await renderHook(() => useThemedStyles(createStyles));

  expect(result.current.box).toEqual({ backgroundColor: darkColors.card });
});

test('does not build them again while the theme stays the same', async () => {
  mockColorScheme.mockReturnValue('dark');
  const { rerender } = await renderHook(() => useThemedStyles(createStyles));

  await rerender(undefined);
  await rerender(undefined);

  expect(createStyles).toHaveBeenCalledTimes(1);
});

test('builds them again when the phone changes its theme', async () => {
  mockColorScheme.mockReturnValue('light');
  const { result, rerender } = await renderHook(() =>
    useThemedStyles(createStyles),
  );
  expect(result.current.box).toEqual({ backgroundColor: lightColors.card });

  mockColorScheme.mockReturnValue('dark');
  await rerender(undefined);

  expect(result.current.box).toEqual({ backgroundColor: darkColors.card });
  expect(createStyles).toHaveBeenCalledTimes(2);
});
