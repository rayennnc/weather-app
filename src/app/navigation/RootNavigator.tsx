import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SearchScreen } from '../../features/search/ui/SearchScreen';
import { WeatherScreen } from '../../features/weather/ui/WeatherScreen';
import { useT } from '../../shared/i18n/useT';

export type RootStackParamList = {
  Weather: undefined;
  Search: undefined;
};

type RouteProps<Name extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Name
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// the screens know nothing about navigation. these two connect their callbacks to it,
// which is also how one feature opens another without importing it
function WeatherRoute({ navigation }: RouteProps<'Weather'>) {
  return <WeatherScreen onSearchPress={() => navigation.navigate('Search')} />;
}

function SearchRoute({ navigation }: RouteProps<'Search'>) {
  return <SearchScreen onPlaceSelected={() => navigation.goBack()} />;
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
        name="Search"
        component={SearchRoute}
        options={{ title: t('search.title') }}
      />
    </Stack.Navigator>
  );
}
