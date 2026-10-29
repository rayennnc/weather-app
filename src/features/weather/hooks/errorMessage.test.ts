import { HttpError, NetworkError, InvalidResponseError } from '../../../shared/lib/errors';
import { getErrorMessageKey } from './errorMessage';

test.each([
    [
        'a timeout',
        new NetworkError('timed out', { timedOut: true }),
        'error.timeout',
    ],
    ['no connection,', new NetworkError('no connection'), 'error.network'],
])
