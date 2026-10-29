import { t, useT } from './useT';

describe('t', () => {
  test('returns the english text for a key', () => {
    expect(t('weather.retry')).toBe('Try again');
  });

  test('fills in {placeholders}', () => {
    expect(t('weather.feelsLike', { temperature: '34°' })).toBe(
      'Feels like 34°',
    );
  });

  test('keeps a placeholder when its param is missing', () => {
    expect(t('weather.feelsLike')).toBe('Feels like {temperature}');
  });

  test('fills in a param that is the number 0', () => {
    expect(t('weather.feelsLike', { temperature: 0 })).toBe('Feels like 0');
  });
});

test('useT returns the t function', () => {
  expect(useT()).toBe(t);
});
