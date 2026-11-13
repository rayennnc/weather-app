import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  type AboutViewModel,
  useAboutViewModel,
} from '../hooks/useAboutViewModel';
import { AboutScreen } from './AboutScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useAboutViewModel');
const mockViewModel = jest.mocked(useAboutViewModel);

function viewModel(overrides: Partial<AboutViewModel> = {}): AboutViewModel {
  return {
    sources: [
      {
        id: 'weather',
        title: 'Weather data',
        credit: 'Weather data by Open-Meteo.com',
        creditUrl: 'https://open-meteo.com/',
        license: 'Licensed under CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        note: 'Values are rounded and formatted for display.',
      },
      {
        id: 'places',
        title: 'Place names',
        credit: 'Place names from GeoNames',
        creditUrl: 'https://www.geonames.org/',
        license: 'Licensed under CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        note: null,
      },
    ],
    openLink: jest.fn(),
    ...overrides,
  };
}

test('shows each source with its credit and license', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await render(<AboutScreen />);

  expect(screen.getByText('Weather data')).toBeOnTheScreen();
  expect(screen.getByText('Weather data by Open-Meteo.com')).toBeOnTheScreen();
  expect(screen.getByText('Place names')).toBeOnTheScreen();
  expect(screen.getByText('Place names from GeoNames')).toBeOnTheScreen();
  expect(screen.getAllByText('Licensed under CC BY 4.0')).toHaveLength(2);
});

test('shows the note of a source only when it has one', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await render(<AboutScreen />);

  expect(
    screen.getAllByText('Values are rounded and formatted for display.'),
  ).toHaveLength(1);
});

test('the credits and licenses are links', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await render(<AboutScreen />);

  expect(screen.getAllByRole('link')).toHaveLength(4);
});

test('pressing a credit opens the site of its source', async () => {
  const openLink = jest.fn();
  mockViewModel.mockReturnValue(viewModel({ openLink }));

  await render(<AboutScreen />);
  await fireEvent.press(screen.getByText('Weather data by Open-Meteo.com'));
  await fireEvent.press(screen.getByText('Place names from GeoNames'));

  expect(openLink).toHaveBeenNthCalledWith(1, 'https://open-meteo.com/');
  expect(openLink).toHaveBeenNthCalledWith(2, 'https://www.geonames.org/');
});

test('pressing a license opens the license', async () => {
  const openLink = jest.fn();
  mockViewModel.mockReturnValue(viewModel({ openLink }));

  await render(<AboutScreen />);
  const [weatherLicense, placesLicense] = screen.getAllByText(
    'Licensed under CC BY 4.0',
  );
  await fireEvent.press(weatherLicense);
  await fireEvent.press(placesLicense);

  expect(openLink).toHaveBeenCalledTimes(2);
  expect(openLink).toHaveBeenCalledWith(
    'https://creativecommons.org/licenses/by/4.0/',
  );
});
