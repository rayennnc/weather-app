import { render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import { WeatherSkeleton } from './WeatherSkeleton';

test('is announced as loading to screen readers', async () => {
  await render(<WeatherSkeleton />);

  const skeleton = screen.getByLabelText(t('weather.loading'));
  expect(skeleton).toBeOnTheScreen();
  expect(skeleton.props.accessibilityState).toEqual({ busy: true });
});
