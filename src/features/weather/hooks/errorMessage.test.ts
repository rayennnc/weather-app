import {
  HttpError,
  InvalidResponseError,
  NetworkError,
} from '../../../shared/lib/errors';
import { getErrorMessageKey } from './errorMessage';

test.each([
  [
    'a timeout',
    new NetworkError('timeout', { timedOut: true }),
    'error.timeout',
  ],
  ['no connection', new NetworkError('offline'), 'error.network'],
  ['a server error', new HttpError(500, 'boom'), 'error.server'],
  [
    'a body we cannot read',
    new InvalidResponseError('bad'),
    'error.invalidData',
  ],
  ['any other error', new Error('boom'), 'error.unknown'],
  ['something that is not an error', 'boom', 'error.unknown'],
])('maps %s to its message', (_name, error, expectedKey) => {
  expect(getErrorMessageKey(error)).toBe(expectedKey);
});
