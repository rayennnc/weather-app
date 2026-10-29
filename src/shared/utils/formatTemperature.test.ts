import { formatTemperature } from './formatTemperature';

describe('formatTemperature', () => {
  test('rounds to a whole degree', () => {
    expect(formatTemperature(30.4)).toBe('30°');
    expect(formatTemperature(30.6)).toBe('31°');
  });

  test('never shows negative zero', () => {
    expect(formatTemperature(-0.4)).toBe('0°');
  });

  test('keeps the minus sign for real negatives', () => {
    expect(formatTemperature(-3.2)).toBe('-3°');
  });
});
