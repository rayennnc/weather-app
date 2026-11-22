import { render, screen } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { t } from '../../../shared/i18n/useT';
import { darkColors, lightColors } from '../../../shared/theme/palettes';
import {
  type LocationsViewModel,
  useLocationsViewModel,
} from '../hooks/useLocationsViewModel';
import { LocationsScreen } from './LocationsScreen';

// the Jest preset replaces useColorScheme with a mock, so a test decides which
// theme the phone is in
const mockColorScheme = jest.mocked(useColorScheme);

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useLocationsViewModel');
const mockViewModel = jest.mocked(useLocationsViewModel);

function viewModel(
  overrides: Partial<LocationsViewModel> = {},
): LocationsViewModel {
  return {
    locations: [
      { id: 1, title: 'Jakarta', subtitle: 'Indonesia', isActive: true },
    ],
    canRemove: true,
    selectLocation: jest.fn(),
    removeLocation: jest.fn(),
    myLocation: { status: 'idle' },
    locateMe: jest.fn().mockResolvedValue(false),
    openSettings: jest.fn(),
    ...overrides,
  };
}

const renderScreen = () =>
  render(
    <LocationsScreen onAddPress={jest.fn()} onLocationSelected={jest.fn()} />,
  );

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
] as const)('in the %s theme', (scheme, palette) => {
  beforeEach(() => {
    mockColorScheme.mockReturnValue(scheme);
  });

  test('"use my location" is the accent button and "add city" a card', async () => {
    mockViewModel.mockReturnValue(viewModel());

    await renderScreen();

    expect(
      screen.getByRole('button', { name: t('locations.useMyLocation') }),
    ).toHaveStyle({ backgroundColor: palette.accent });
    expect(screen.getByText(t('locations.useMyLocation'))).toHaveStyle({
      color: palette.onAccent,
    });
    expect(
      screen.getByRole('button', { name: t('locations.add') }),
    ).toHaveStyle({ backgroundColor: palette.card });
    expect(screen.getByText(t('locations.add'))).toHaveStyle({
      color: palette.accent,
    });
  });

  test('the spinner of "use my location" is drawn on the accent button', async () => {
    mockViewModel.mockReturnValue(
      viewModel({ myLocation: { status: 'locating' } }),
    );

    await renderScreen();
    const button = screen.getByRole('button', {
      name: t('locations.locating'),
    });

    expect(button).toHaveStyle({ backgroundColor: palette.accent });
    // the spinner has to stand out from the button it is on
    expect(button.children[0]).toHaveProp('color', palette.onAccent);
  });

  test('a place is a card with a main title, a quiet subtitle, an accent mark and a remove button in the danger color', async () => {
    mockViewModel.mockReturnValue(viewModel());

    await renderScreen();

    expect(screen.getByText('Jakarta')).toHaveStyle({ color: palette.text });
    expect(screen.getByText('Indonesia')).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText(t('locations.active'))).toHaveStyle({
      color: palette.accent,
    });
    expect(screen.getByText(t('locations.remove'))).toHaveStyle({
      color: palette.danger,
    });
  });

  test('the message about the location is quiet text, with an accent link to the settings', async () => {
    mockViewModel.mockReturnValue(
      viewModel({
        myLocation: { status: 'blocked', message: t('locations.blocked') },
      }),
    );

    await renderScreen();

    expect(screen.getByText(t('locations.blocked'))).toHaveStyle({
      color: palette.textSecondary,
    });
    expect(screen.getByText(t('locations.openSettings'))).toHaveStyle({
      color: palette.accent,
    });
  });
});
