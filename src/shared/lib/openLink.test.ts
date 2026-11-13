import { Linking } from 'react-native';
import { openLink } from './openLink';

// the Jest preset replaces Linking with a mock, which keeps its calls between
// tests unless they are cleared
const mockOpenURL = jest.mocked(Linking.openURL);

beforeEach(() => {
  mockOpenURL.mockReset();
});

test('opens the address', async () => {
  mockOpenURL.mockResolvedValue(undefined);

  await openLink('https://open-meteo.com/');

  expect(mockOpenURL).toHaveBeenCalledTimes(1);
  expect(mockOpenURL).toHaveBeenCalledWith('https://open-meteo.com/');
});

test('does not fail when the phone cannot open it', async () => {
  mockOpenURL.mockRejectedValue(new Error('no browser'));

  await expect(openLink('https://open-meteo.com/')).resolves.toBeUndefined();
});
