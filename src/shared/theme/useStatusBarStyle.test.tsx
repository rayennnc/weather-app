import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { useStatusBarStyle } from './useStatusBarStyle';

// the Jest preset replaces useColorScheme with a mock, so a test decides what
// the phone answers
const mockColorScheme = jest.mocked(useColorScheme);

test('has dark icons on a light screen', async () => {
  mockColorScheme.mockReturnValue('light');

  const { result } = await renderHook(() => useStatusBarStyle());

  expect(result.current).toBe('dark-content');
});

test('has light icons on a dark screen', async () => {
  mockColorScheme.mockReturnValue('dark');

  const { result } = await renderHook(() => useStatusBarStyle());

  expect(result.current).toBe('light-content');
});

test('has dark icons when the phone gives no answer, like the light theme', async () => {
  mockColorScheme.mockReturnValue(null);

  const { result } = await renderHook(() => useStatusBarStyle());

  expect(result.current).toBe('dark-content');
});
