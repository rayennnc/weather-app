import { act, renderHook } from '@testing-library/react-native';
import { useDebouncedValue } from './useDebouncedValue';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const wait = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

test('starts with the value it is given', async () => {
  const { result } = await renderHook(() => useDebouncedValue('a', 400));

  expect(result.current).toBe('a');
});

test('follows a new value only after the delay', async () => {
  const { result, rerender } = await renderHook(
    ({ value }: { value: string }) => useDebouncedValue(value, 400),
    { initialProps: { value: 'a' } },
  );

  await rerender({ value: 'ab' });
  await wait(399);
  expect(result.current).toBe('a');

  await wait(1);
  expect(result.current).toBe('ab');
});

test('starts counting again when the value changes before the delay is over', async () => {
  const { result, rerender } = await renderHook(
    ({ value }: { value: string }) => useDebouncedValue(value, 400),
    { initialProps: { value: 'a' } },
  );

  await rerender({ value: 'ab' });
  await wait(300);
  await rerender({ value: 'abc' });
  await wait(300);
  // 600 ms since 'ab', but only 300 ms since 'abc'
  expect(result.current).toBe('a');

  await wait(100);
  expect(result.current).toBe('abc');
});
