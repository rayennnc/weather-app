import { useLocationStore } from '../../../shared/stores/locationStore';
import type { Place } from '../../../shared/types/place';
import { type PlaceView, toPlaceView } from '../../../shared/utils/placeView';

// one saved place, ready to draw
export type LocationView = PlaceView & { isActive: boolean };

export type LocationsViewModel = {
  // in the order they were saved
  locations: LocationView[];
  // the last place stays: the app always needs one to show
  canRemove: boolean;
  selectLocation: (id: Place['id']) => void;
  removeLocation: (id: Place['id']) => void;
};

export function useLocationsViewModel(): LocationsViewModel {
  const activeLocation = useLocationStore(state => state.activeLocation);
  const savedLocations = useLocationStore(state => state.savedLocations);
  const selectPlace = useLocationStore(state => state.selectLocation);
  const removeLocation = useLocationStore(state => state.removeLocation);

  function selectLocation(id: Place['id']) {
    const place = savedLocations.find(saved => saved.id === id);
    if (place) {
      selectPlace(place);
    }
  }

  return {
    locations: savedLocations.map(place => ({
      ...toPlaceView(place),
      isActive: place.id === activeLocation.id,
    })),
    canRemove: savedLocations.length > 1,
    selectLocation,
    removeLocation,
  };
}
