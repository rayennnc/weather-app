import type { Translate } from '../i18n/useT';
import type { Place } from '../types/place';

// the place the gps found. it has no name of its own (a name would have to be
// translated), and one fixed id, so asking again moves it instead of adding another
export const MY_LOCATION_ID = -1;

export function getPlaceName(place: Place, t: Translate): string {
  return place.id === MY_LOCATION_ID ? t('locations.myLocation') : place.name;
}
