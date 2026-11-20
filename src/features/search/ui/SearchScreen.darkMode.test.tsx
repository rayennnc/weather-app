import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { t } from '../../../shared/i18n/useT';
import { darkColors, lightColors } from '../../../shared/theme/palettes';
import {
  type SearchState,
  type SearchViewModel,
  useSearchViewModel,
} from '../hooks/useSearchViewModel';
import { SearchScreen } from './SearchScreen';

// the Jest preset replaces useColorScheme with a mock, so a test decides which
// theme the phone is in
const mockColorScheme = jest.mocked(useColorScheme);

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useSearchViewModel');
const mockViewModel = jest.mocked(useSearchViewModel);

function showing(state: SearchState): SearchViewModel {
  return { query: 'Ban', setQuery: jest.fn(), selectPlace: jest.fn(), state };
}

const renderScreen = () => render(<SearchScreen onPlaceSelected={jest.fn()} />);

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('in the %s theme', (scheme, palette) => {
  beforeEach(() => {
    mockColorScheme.mockReturnValue(scheme);
  });

  test('the input is a card with main text and a quiet placeholder', async () => {
    mockViewModel.mockReturnValue(showing({ status: 'idle', hint: 'Type' }));

    await renderScreen();
    const input = screen.getByPlaceholderText(t('search.placeholder'));

    expect(input).toHaveStyle({
      backgroundColor: palette.card,
      color: palette.text,
    });
    expect(input).toHaveProp('placeholderTextColor', palette.textSecondary);
  });

  test('the hint is quiet text', async () => {
    mockViewModel.mockReturnValue(showing({ status: 'idle', hint: 'Type' }));

    await renderScreen();

    expect(screen.getByText('Type')).toHaveStyle({
      color: palette.textSecondary,
    });
  });

  test('the spinner has the accent color', async () => {
    mockViewModel.mockReturnValue(showing({ status: 'loading' }));

    await renderScreen();

    expect(screen.getByLabelText(t('search.loading'))).toHaveProp(
      'color',
      palette.accent,
    );
  });

  test('a result is a card with a main title and a quiet subtitle', async () => {
    mockViewModel.mockReturnValue(
      showing({
        status: 'success',
        results: [{ id: 1, title: 'Bandung', subtitle: 'West Java' }],
      }),
    );

    await renderScreen();

    expect(screen.getByRole('button', { name: /Bandung/ })).toHaveStyle({
      backgroundColor: palette.card,
    });
    expect(screen.getByText('Bandung')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('West Java')).toHaveStyle({
      color: palette.textSecondary,
    });
  });

  test('the retry button is an accent button', async () => {
    mockViewModel.mockReturnValue(
      showing({ status: 'error', message: 'No internet', retry: jest.fn() }),
    );

    await renderScreen();

    expect(screen.getByRole('button', { name: t('search.retry') })).toHaveStyle(
      { backgroundColor: palette.accent },
    );
    expect(screen.getByText(t('search.retry'))).toHaveStyle({
      color: palette.onAccent,
    });
  });
});
