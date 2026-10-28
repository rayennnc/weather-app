import { QueryClient, useQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QueryProvider } from './QueryProvider';

function Probe() {
  const { data } = useQuery({
    queryKey: ['probe'],
    queryFn: async () => 'hello',
  });
  return <Text>{data ?? 'loading'}</Text>;
}

test('children inside the provider can use useQuery', async () => {
  // no retry and no gc timer, so the test stays fast and Jest can exit
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  await render(
    <QueryProvider client={client}>
      <Probe />
    </QueryProvider>,
  );

  expect(await screen.findByText('hello')).toBeOnTheScreen();
});
