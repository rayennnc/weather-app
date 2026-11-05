import { fireEvent, render, screen } from '@testing-library/react-native';
// the mock has to be imported before the navigation code, which loads safe-area-context
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { NavigationContainer } from '@react-navigation/native';
import {
  type LocationsViewModel,
  useLocationsViewModel,
} from '../../features/locations/hooks/useLocationsViewModel';
import {
  type SearchViewModel,
  useSearchViewModel,
} from '../../features/search/hooks/useSearchViewModel';
import { useWeatherViewModel } from '../../features/weather/hooks/useWeatherViewModel';
import { t } from '../../shared/i18n/useT';
import { RootNavigator } from './RootNavigator';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
// the navigator only connects the screens, so their view models are mocked
jest.mock('../../features/weather/hooks/useWeatherViewModel');
jest.mock('../../features/search/hooks/useSearchViewModel');
jest.mock('../../features/locations/hooks/useLocationsViewModel');
const mockWeather = jest.mocked(useWeatherViewModel);
const mockSearch = jest.mocked(useSearchViewModel);
const mockLocations = jest.mocked(useLocationsViewModel);

const searchViewModel: SearchViewModel = {
  query: 'Ban',
  setQuery: jest.fn(),
  selectPlace: jest.fn(),
  state: {
    status: 'success',
    results: [{ id: 1, title: 'Bandung', subtitle: 'West Java, Indonesia' }],
  },
};

const locationsViewModel: LocationsViewModel = {
  locations: [
    {
      id: 2,
      title: 'Surabaya',
      subtitle: 'East Java, Indonesia',
      isActive: false,
    },
  ],
  canRemove: false,
  selectLocation: jest.fn(),
  removeLocation: jest.fn(),
};

beforeEach(() => {
  mockWeather.mockReturnValue({
    status: 'error',
    message: 'No internet',
    retry: jest.fn(),
  });
  mockSearch.mockReturnValue(searchViewModel);
  mockLocations.mockReturnValue(locationsViewModel);
});

const renderNavigator = () =>
  render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>,
  );

const searchInput = () =>
  screen.queryByPlaceholderText(t('search.placeholder'));
const addButton = () => screen.queryByText(t('locations.add'));

test('starts on the weather screen, not on the others', async () => {
  await renderNavigator();

  expect(screen.getByText('No internet')).toBeOnTheScreen();
  expect(searchInput()).not.toBeOnTheScreen();
  expect(addButton()).not.toBeOnTheScreen();
});

test('the search button opens the search screen', async () => {
  await renderNavigator();

  await fireEvent.press(screen.getByText(t('weather.search')));

  expect(searchInput()).toBeOnTheScreen();
});

test('choosing a place in the search selects it and goes back to the weather', async () => {
  const selectPlace = jest.fn();
  mockSearch.mockReturnValue({ ...searchViewModel, selectPlace });
  await renderNavigator();
  await fireEvent.press(screen.getByText(t('weather.search')));

  await fireEvent.press(screen.getByText('West Java, Indonesia'));

  expect(selectPlace).toHaveBeenCalledWith(1);
  expect(searchInput()).not.toBeOnTheScreen();
  expect(screen.getByText('No internet')).toBeOnTheScreen();
});

test('the locations button opens the locations screen', async () => {
  await renderNavigator();

  await fireEvent.press(screen.getByText(t('weather.locations')));

  expect(addButton()).toBeOnTheScreen();
  expect(screen.getByText('Surabaya')).toBeOnTheScreen();
});

test('choosing a saved place selects it and goes back to the weather', async () => {
  const selectLocation = jest.fn();
  mockLocations.mockReturnValue({ ...locationsViewModel, selectLocation });
  await renderNavigator();
  await fireEvent.press(screen.getByText(t('weather.locations')));

  await fireEvent.press(screen.getByText('Surabaya'));

  expect(selectLocation).toHaveBeenCalledWith(2);
  expect(addButton()).not.toBeOnTheScreen();
  expect(screen.getByText('No internet')).toBeOnTheScreen();
});

test('adding a city from the locations goes to the search and then straight back to the weather', async () => {
  await renderNavigator();
  await fireEvent.press(screen.getByText(t('weather.locations')));
  await fireEvent.press(screen.getByText(t('locations.add')));
  expect(searchInput()).toBeOnTheScreen();

  await fireEvent.press(screen.getByText('West Java, Indonesia'));

  // neither the search nor the locations are left on the stack
  expect(searchInput()).not.toBeOnTheScreen();
  expect(addButton()).not.toBeOnTheScreen();
  expect(screen.getByText('No internet')).toBeOnTheScreen();
});
