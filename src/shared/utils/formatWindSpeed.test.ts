import { formatWindSpeed } from './formatWindspeed';

describe('formatWindSpeed', () => {
  test('rounds and adds km/h', () => {
    expect(formatWindSpeed(9.4, 'kmh')).toBe('9 km/h');
    expect(formatWindSpeed(9.5, 'kmh')).toBe('10 km/h');
    expect(formatWindSpeed(9.6, 'kmh')).toBe('10 km/h');
  });

  test('rounds and adds mph', () => {
    expect(formatWindSpeed(4.6, 'mph')).toBe('5 mph');
  });

  test('shows calm air as 0', () => {
    expect(formatWindSpeed(0, 'kmh')).toBe('0 km/h');
  });
});
