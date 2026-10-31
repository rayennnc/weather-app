import { formatPrecipitation } from './formatPrecipitation';

describe('formatPrecipitation', () => {
  test('keeps one decimal', () => {
    expect(formatPrecipitation(1.26)).toBe('1.3 mm');
    expect(formatPrecipitation(12.34)).toBe('12.3 mm');
  });

  test('drops a useless decimal', () => {
    expect(formatPrecipitation(2)).toBe('2 mm');
    expect(formatPrecipitation(0)).toBe('0 mm');
  });

  test('shows a trace amount as 0', () => {
    expect(formatPrecipitation(0.04)).toBe('0 mm');
  });
});
