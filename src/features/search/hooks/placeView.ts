import type { Place } from '../../../shared/types/place';

// one row of the results list, ready to draw
export type PlaceView = {
  id: Place['id'];
  title: string;
  subtitle: string;
};

export function toPlaceView(place: Place): PlaceView {
  // the region is often the same as the name ("Jakarta, Jakarta"), so skip it then
  const region = place.region === place.name ? null : place.region;
  const subtitle = [region, place.country]
    .filter((part): part is string => Boolean(part))
    .join(', ');

  return { id: place.id, title: place.name, subtitle };
}
