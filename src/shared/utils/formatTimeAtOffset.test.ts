import { formatTimeAtOffset } from './formatTimeAtOffset';

const utc = (hour: number, minute: number) =>
  Date.UTC(2026, 9, 28, hour, minute);

describe('formatTimeAtOffset', () => {
  test('moves the clock forward for places east of UTC', () => {
    expect(formatTimeAtOffset(utc(4, 51), 7 * 3600)).toBe('11:51');
  });

  test('moves the clock back for places west of UTC', () => {
    expect(formatTimeAtOffset(utc(4, 51), -8 * 3600)).toBe('20:51');
  });

  test('wraps past midnight', () => {
    expect(formatTimeAtOffset(utc(20, 30), 7 * 3600)).toBe('03:30');
  });

  test('handles half hour offsets', () => {
    expect(formatTimeAtOffset(utc(4, 51), 19800)).toBe('10:21');
  });

  test('pads single digits', () => {
    expect(formatTimeAtOffset(utc(4, 5), 0)).toBe('04:05');
  });
});
