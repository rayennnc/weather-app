import { formatHour } from './formatHour';

describe('formatHour', () => {
  test('keeps the hour and minutes of the location time', () => {
    expect(formatHour('2026-10-28T14:00')).toBe('14:00');
    expect(formatHour('2026-10-28T07:15')).toBe('07:15');
  });

  test('keeps midnight as 00:00', () => {
    expect(formatHour('2026-10-28T00:00')).toBe('00:00');
  });
});
