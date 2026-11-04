import type { Place } from '../../../shared/types/place';
import { toPlaceView } from './placeView';

const bandung: Place = {
  id: 1650357,
  name: 'Bandung',
  region: 'West Java',
  country: 'Indonesia',
  latitude: -6.9175,
  longitude: 107.6191,
};

test('uses the name as the title and the region and country as the subtitle', () => {
  expect(toPlaceView(bandung)).toEqual({
    id: 1650357,
    title: 'Bandung',
    subtitle: 'West Java, Indonesia',
  });
});

test('skips the region when it is the same as the name', () => {
  const jakarta = { ...bandung, name: 'Jakarta', region: 'Jakarta' };

  expect(toPlaceView(jakarta).subtitle).toBe('Indonesia');
});

test('leaves out a region or a country that is missing', () => {
  expect(toPlaceView({ ...bandung, region: null }).subtitle).toBe('Indonesia');
  expect(toPlaceView({ ...bandung, country: null }).subtitle).toBe('West Java');
  expect(
    toPlaceView({ ...bandung, region: null, country: null }).subtitle,
  ).toBe('');
});
