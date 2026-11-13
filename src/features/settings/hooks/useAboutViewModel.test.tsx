import { renderHook } from '@testing-library/react-native';
import { openLink } from '../data/openLink';
import { useAboutViewModel } from './useAboutViewModel';

jest.mock('../data/openLink');
const mockOpenLink = jest.mocked(openLink);

beforeEach(() => {
  mockOpenLink.mockReset();
});

// the addresses are what the licenses ask for, so they are pinned here
test('credits Open-Meteo and GeoNames, each with its address and license', async () => {
  const { result } = await renderHook(() => useAboutViewModel());

  expect(result.current.sources).toEqual([
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
  ]);
});

test('opening a link goes to the address it is given', async () => {
  const { result } = await renderHook(() => useAboutViewModel());

  result.current.openLink('https://open-meteo.com/');

  expect(mockOpenLink).toHaveBeenCalledTimes(1);
  expect(mockOpenLink).toHaveBeenCalledWith('https://open-meteo.com/');
});
