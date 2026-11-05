import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { t } from '../../../shared/i18n/useT';
import {
  type LocationsViewModel,
  useLocationsViewModel,
} from '../hooks/useLocationsViewModel';
import { LocationsScreen } from './LocationsScreen';

// the screen only draws what the view model gives it, so the view model is mocked
jest.mock('../hooks/useLocationsViewModel');
const mockViewModel = jest.mocked(useLocationsViewModel);

function viewModel(
  overrides: Partial<LocationsViewModel> = {},
): LocationsViewModel {
  return {
    locations: [
      { id: 1, title: 'Jakarta', subtitle: 'Indonesia', isActive: true },
      {
        id: 2,
        title: 'Bandung',
        subtitle: 'West Java, Indonesia',
        isActive: false,
      },
    ],
    canRemove: true,
    selectLocation: jest.fn(),
    removeLocation: jest.fn(),
    ...overrides,
  };
}

const renderScreen = (props = {}) =>
  render(
    <LocationsScreen
      onAddPress={jest.fn()}
      onLocationSelected={jest.fn()}
      {...props}
    />,
  );

test('lists the saved places and marks only the active one', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen();

  expect(screen.getByText('Jakarta')).toBeOnTheScreen();
  expect(screen.getByText('West Java, Indonesia')).toBeOnTheScreen();
  expect(screen.getAllByText(t('locations.active'))).toHaveLength(1);
  const selected = screen.getByRole('button', { selected: true });
  expect(within(selected).getByText('Jakarta')).toBeOnTheScreen();
});

test('the add button reports a press', async () => {
  const onAddPress = jest.fn();
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen({ onAddPress });
  await fireEvent.press(screen.getByText(t('locations.add')));

  expect(onAddPress).toHaveBeenCalledTimes(1);
});

test('choosing a place selects it and then tells the navigator', async () => {
  const selectLocation = jest.fn();
  const onLocationSelected = jest.fn();
  mockViewModel.mockReturnValue(viewModel({ selectLocation }));

  await renderScreen({ onLocationSelected });
  await fireEvent.press(screen.getByText('West Java, Indonesia'));

  expect(selectLocation).toHaveBeenCalledWith(2);
  expect(onLocationSelected).toHaveBeenCalledTimes(1);
  // the place has to be active before the screen closes
  expect(selectLocation.mock.invocationCallOrder[0]).toBeLessThan(
    onLocationSelected.mock.invocationCallOrder[0],
  );
});

test('removing a place does not select it or close the screen', async () => {
  const removeLocation = jest.fn();
  const selectLocation = jest.fn();
  const onLocationSelected = jest.fn();
  mockViewModel.mockReturnValue(viewModel({ removeLocation, selectLocation }));

  await renderScreen({ onLocationSelected });
  await fireEvent.press(
    screen.getByLabelText(t('locations.removeLabel', { name: 'Bandung' })),
  );

  expect(removeLocation).toHaveBeenCalledWith(2);
  expect(selectLocation).not.toHaveBeenCalled();
  expect(onLocationSelected).not.toHaveBeenCalled();
});

test('shows a remove button per place, named after it', async () => {
  mockViewModel.mockReturnValue(viewModel());

  await renderScreen();

  const rows = screen.getAllByRole('button', { name: /^Remove / });
  expect(rows).toHaveLength(2);
  expect(
    within(screen.getByTestId('locations-list')).getAllByText(
      t('locations.remove'),
    ),
  ).toHaveLength(2);
});

test('has no remove buttons when only one place is left', async () => {
  mockViewModel.mockReturnValue(
    viewModel({
      locations: [
        { id: 1, title: 'Jakarta', subtitle: 'Indonesia', isActive: true },
      ],
      canRemove: false,
    }),
  );

  await renderScreen();

  expect(screen.queryByText(t('locations.remove'))).not.toBeOnTheScreen();
});
