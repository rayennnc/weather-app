import { formatPercent } from './formatPercent';

describe('formatPercent', () => {
  test('adds the percent sign', () => {
    expect(formatPercent(40)).toBe('40%');
    expect(formatPercent(0)).toBe('0%');
  });

  test('rounds to a whole number', () => {
    expect(formatPercent(39.6)).toBe('40%');
  });
});
