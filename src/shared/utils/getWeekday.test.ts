import { getWeekday } from './getWeekday';

describe('getWeekday', () => {
  test('finds the weekday of a date', () => {
    expect(getWeekday('2026-10-28')).toBe('wed');
    expect(getWeekday('2026-10-25')).toBe('sun');
    expect(getWeekday('2026-10-31')).toBe('sat');
  });

  test('works across a month and a year boundary', () => {
    expect(getWeekday('2026-11-01')).toBe('sun');
    expect(getWeekday('2026-12-31')).toBe('thu');
    expect(getWeekday('2027-01-01')).toBe('fri');
  });
});
