import { type Translate, t } from '../i18n/useT';
import type { Place } from '../types/place';
import { getPlaceName, MY_LOCATION_ID } from './placeName';

const jakarta: Place = {
  id: 1642911,
  name: 'Jakarta',
  region: 'Jakarta',
  country: 'Indonesia',
  latitude: -6.21462,
  longitude: 106.84513,
};

const fromGps: Place = {
  id: MY_LOCATION_ID,
  name: '',
  region: null,
  country: null,
  latitude: 10,
  longitude: 20,
};

test('a place with a name of its own shows that name', () => {
  expect(getPlaceName(jakarta, t)).toBe('Jakarta');
});

test('the place the gps found shows the label "My location"', () => {
  expect(getPlaceName(fromGps, t)).toBe('My location');
});

test('the label comes from the translate function, so it follows the language', () => {
  const shout: Translate = key => key.toUpperCase();

  expect(getPlaceName(fromGps, shout)).toBe('LOCATIONS.MYLOCATION');
});
