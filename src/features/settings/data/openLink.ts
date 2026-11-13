import { Linking } from 'react-native';

export async function openLink(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    // intentionally ignore failures; the source name is already visible to the user
  }
}
