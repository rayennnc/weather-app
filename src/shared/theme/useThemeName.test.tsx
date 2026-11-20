import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { useThemeName } from './useThemeName';

// the Jest preset replaces useColorScheme with a mock, so a test decides what
// the phone answers
const mockColorScheme = jest.mocked(useColorScheme);

beforeEach(() => {
  mockColorScheme.mockReturnValue('light');
});

test('is light when the phone is light', async () => {
  const { result } = await renderHook(() => useThemeName());

  expect(result.current).toBe('light');
});

test('is dark when the phone is dark', async () => {
  mockColorScheme.mockReturnValue('dark');

  const { result } = await renderHook(() => useThemeName());

  expect(result.current).toBe('dark');
});

test('is light when the phone gives no answer', async () => {
  mockColorScheme.mockReturnValue(null);

  const { result } = await renderHook(() => useThemeName());

  expect(result.current).toBe('light');
});

test('follows the phone when it switches theme while the app is open', async () => {
  const { result, rerender } = await renderHook(() => useThemeName());
  expect(result.current).toBe('light');

  mockColorScheme.mockReturnValue('dark');
  await rerender(undefined);

  expect(result.current).toBe('dark');
});
