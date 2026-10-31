import { render, screen } from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import type { DetailView } from '../hooks/forecastView';
import { DetailsCard } from './DetailsCard';

const details: DetailView[] = [
  { id: 'humidity', label: 'Humidity', value: '70%' },
  { id: 'sunrise', label: 'Sunrise', value: '05:41' },
];

test('shows the title and every detail with its value', async () => {
  await render(<DetailsCard details={details} />);

  expect(screen.getByText(t('weather.detailsTitle'))).toBeOnTheScreen();
  expect(screen.getByText('Humidity')).toBeOnTheScreen();
  expect(screen.getByText('70%')).toBeOnTheScreen();
  expect(screen.getByText('Sunrise')).toBeOnTheScreen();
  expect(screen.getByText('05:41')).toBeOnTheScreen();
});
