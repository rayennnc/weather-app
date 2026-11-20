import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from './palettes';
import { useColors } from './useColors';

// the Jest preset replaces useColorScheme with a mock, so a test decides what
// the phone answers
const mockColorScheme = jest.mocked(useColorScheme);

test('gives the light colors when the phone is light', async () => {
  mockColorScheme.mockReturnValue('light');

  const { result } = await renderHook(() => useColors());

  expect(result.current).toBe(lightColors);
});

test('gives the dark colors when the phone is dark', async () => {
  mockColorScheme.mockReturnValue('dark');

  const { result } = await renderHook(() => useColors());

  expect(result.current).toBe(darkColors);
});
