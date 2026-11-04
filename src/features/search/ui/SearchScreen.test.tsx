import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import {
  type SearchState,
  type SearchViewModel,
  useSearchViewModel,
} from '../hooks/useSearchViewModel';
import { SearchScreen } from './SearchScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useSearchViewModel');
const mockViewModel = jest.mocked(useSearchViewModel);

function viewModel(
  state: SearchState,
  overrides: Partial<SearchViewModel> = {},
): SearchViewModel {
  return {
    query: '',
    setQuery: jest.fn(),
    selectPlace: jest.fn(),
    state,
    ...overrides,
  };
}

const results: SearchState = {
  status: 'success',
  results: [
    { id: 1, title: 'Bandung', subtitle: 'West Java, Indonesia' },
    { id: 2, title: 'Bandung', subtitle: '' },
  ],
};

test('shows the hint while there is not enough text', async () => {
  mockViewModel.mockReturnValue(
    viewModel({ status: 'idle', hint: 'Type at least 2 letters to search.' }),
  );

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);

  expect(
    screen.getByText('Type at least 2 letters to search.'),
  ).toBeOnTheScreen();
});

test('shows what was typed and reports every change', async () => {
  const setQuery = jest.fn();
  mockViewModel.mockReturnValue(
    viewModel({ status: 'idle', hint: 'hint' }, { query: 'Ban', setQuery }),
  );

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);
  expect(screen.getByDisplayValue('Ban')).toBeOnTheScreen();
  await fireEvent.changeText(
    screen.getByPlaceholderText(t('search.placeholder')),
    'Band',
  );

  expect(setQuery).toHaveBeenCalledWith('Band');
});

test('shows the spinner while searching', async () => {
  mockViewModel.mockReturnValue(viewModel({ status: 'loading' }));

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);

  expect(screen.getByLabelText(t('search.loading'))).toBeOnTheScreen();
});

test('shows the error message and retries when the button is pressed', async () => {
  const retry = jest.fn();
  mockViewModel.mockReturnValue(
    viewModel({ status: 'error', message: 'No internet', retry }),
  );

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);
  expect(screen.getByText('No internet')).toBeOnTheScreen();
  await fireEvent.press(screen.getByText(t('search.retry')));

  expect(retry).toHaveBeenCalledTimes(1);
});

test('shows the message when nothing matches', async () => {
  mockViewModel.mockReturnValue(
    viewModel({ status: 'empty', message: 'No cities found for “Xyz”.' }),
  );

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);

  expect(screen.getByText('No cities found for “Xyz”.')).toBeOnTheScreen();
});

test('shows the results, with a subtitle only when there is one', async () => {
  mockViewModel.mockReturnValue(viewModel(results));

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);
  const [first, second] = screen.getAllByRole('button');

  expect(within(first).getByText('West Java, Indonesia')).toBeOnTheScreen();
  // only the title: no empty line under it
  expect(within(second).queryAllByText(/.*/)).toHaveLength(1);
});

test('choosing a result selects it and then tells the navigator', async () => {
  const selectPlace = jest.fn();
  const onPlaceSelected = jest.fn();
  mockViewModel.mockReturnValue(viewModel(results, { selectPlace }));

  await render(<SearchScreen onPlaceSelected={onPlaceSelected} />);
  await fireEvent.press(screen.getByText('West Java, Indonesia'));

  expect(selectPlace).toHaveBeenCalledWith(1);
  expect(onPlaceSelected).toHaveBeenCalledTimes(1);
  // the place has to be saved before the screen closes
  expect(selectPlace.mock.invocationCallOrder[0]).toBeLessThan(
    onPlaceSelected.mock.invocationCallOrder[0],
  );
});

test('keeps taps working while the keyboard is open', async () => {
  mockViewModel.mockReturnValue(viewModel(results));

  await render(<SearchScreen onPlaceSelected={jest.fn()} />);
  const list = screen.getByTestId('search-results');

  expect(list.props.keyboardShouldPersistTaps).toBe('handled');
});
