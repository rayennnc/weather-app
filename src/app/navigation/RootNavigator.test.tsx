import { fireEvent, render, screen } from '@testing-library/react-native';
// the mock has to be imported before the navigation code, which loads safe-area-context
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { NavigationContainer } from '@react-navigation/native';
import {
  type SearchViewModel,
  useSearchViewModel,
} from '../../features/search/hooks/useSearchViewModel';
import { useWeatherViewModel } from '../../features/weather/hooks/useWeatherViewModel';
import { t } from '../../shared/i18n/useT';
import { RootNavigator } from './RootNavigator';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
// the navigator only connects the two screens, so their view models are mocked
jest.mock('../../features/weather/hooks/useWeatherViewModel');
jest.mock('../../features/search/hooks/useSearchViewModel');
const mockWeather = jest.mocked(useWeatherViewModel);
const mockSearch = jest.mocked(useSearchViewModel);

const searchViewModel: SearchViewModel = {
  query: 'Ban',
  setQuery: jest.fn(),
  selectPlace: jest.fn(),
  state: {
    status: 'success',
    results: [{ id: 1, title: 'Bandung', subtitle: 'West Java, Indonesia' }],
  },
};

beforeEach(() => {
  mockWeather.mockReturnValue({
    status: 'error',
    message: 'No internet',
    retry: jest.fn(),
  });
  mockSearch.mockReturnValue(searchViewModel);
});

const renderNavigator = () =>
  render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>,
  );

test('starts on the weather screen, not on the search', async () => {
  await renderNavigator();

  expect(screen.getByText('No internet')).toBeOnTheScreen();
  expect(
    screen.queryByPlaceholderText(t('search.placeholder')),
  ).not.toBeOnTheScreen();
});

test('the search button opens the search screen', async () => {
  await renderNavigator();

  await fireEvent.press(screen.getByText(t('weather.search')));

  expect(
    screen.getByPlaceholderText(t('search.placeholder')),
  ).toBeOnTheScreen();
});

test('choosing a place selects it and closes the search screen', async () => {
  const selectPlace = jest.fn();
  mockSearch.mockReturnValue({ ...searchViewModel, selectPlace });
  await renderNavigator();
  await fireEvent.press(screen.getByText(t('weather.search')));

  await fireEvent.press(screen.getByText('West Java, Indonesia'));

  expect(selectPlace).toHaveBeenCalledWith(1);
  expect(
    screen.queryByPlaceholderText(t('search.placeholder')),
  ).not.toBeOnTheScreen();
  expect(screen.getByText('No internet')).toBeOnTheScreen();
});
