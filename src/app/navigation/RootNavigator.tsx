import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { LocationsScreen } from '../../features/locations/ui/LocationsScreen';
import { SearchScreen } from '../../features/search/ui/SearchScreen';
import { AboutScreen } from '../../features/settings/ui/AboutScreen';
import { SettingsScreen } from '../../features/settings/ui/SettingsScreen';
import { WeatherScreen } from '../../features/weather/ui/WeatherScreen';
import { useT } from '../../shared/i18n/useT';

export type RootStackParamList = {
  Weather: undefined;
  Locations: undefined;
  Search: undefined;
  Settings: undefined;
  About: undefined;
};

type RouteProps<Name extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Name
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// the screens know nothing about navigation. the routes below connect their callbacks to it,
// which is also how one feature opens another without importing it
function WeatherRoute({ navigation }: RouteProps<'Weather'>) {
  return (
    <WeatherScreen
      onLocationsPress={() => navigation.navigate('Locations')}
      onSearchPress={() => navigation.navigate('Search')}
      onSettingsPress={() => navigation.navigate('Settings')}
    />
  );
}

function LocationsRoute({ navigation }: RouteProps<'Locations'>) {
  return (
    <LocationsScreen
      onAddPress={() => navigation.navigate('Search')}
      onLocationSelected={() => navigation.popToTop()}
    />
  );
}

// opened from the weather or from the locations, but the new place is always
// shown on the weather screen, so go all the way back to it
function SearchRoute({ navigation }: RouteProps<'Search'>) {
  return <SearchScreen onPlaceSelected={() => navigation.popToTop()} />;
}

function SettingsRoute({ navigation }: RouteProps<'Settings'>) {
  return <SettingsScreen onAboutPress={() => navigation.navigate('About')} />;
}

export function RootNavigator() {
  const t = useT();

  return (
    <Stack.Navigator initialRouteName="Weather">
      <Stack.Screen
        name="Weather"
        component={WeatherRoute}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Locations"
        component={LocationsRoute}
        options={{ title: t('locations.title') }}
      />
      <Stack.Screen
        name="Search"
        component={SearchRoute}
        options={{ title: t('search.title') }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsRoute}
        options={{ title: t('settings.title') }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: t('about.title') }}
      />
    </Stack.Navigator>
  );
}
