// a city from the geocoding api, in the shape the app uses
export type Place = {
  id: number;
  name: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
};
