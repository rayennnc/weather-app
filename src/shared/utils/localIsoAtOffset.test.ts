import { localIsoAtOffset } from './localIsoAtOffset';

const utc = (hour: number, minute: number) =>
  Date.UTC(2026, 9, 28, hour, minute);

describe('localIsoAtOffset', () => {
  test('gives the clock of a place east of UTC', () => {
    expect(localIsoAtOffset(utc(4, 51), 7 * 3600)).toBe('2026-10-28T11:51');
  });

  test('gives the clock of a place west of UTC, on the day before', () => {
    expect(localIsoAtOffset(utc(4, 51), -8 * 3600)).toBe('2026-10-27T20:51');
  });

  test('moves to the next day when the offset passes midnight', () => {
    expect(localIsoAtOffset(utc(20, 30), 7 * 3600)).toBe('2026-10-29T03:30');
  });

  test('handles half hour offsets', () => {
    expect(localIsoAtOffset(utc(4, 51), 19800)).toBe('2026-10-28T10:21');
  });

  test('pads single digits', () => {
    expect(localIsoAtOffset(Date.UTC(2026, 0, 5, 4, 5), 0)).toBe(
      '2026-01-05T04:05',
    );
  });
});
