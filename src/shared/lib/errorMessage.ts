import type { MessageKey } from '../i18n/en';
import { HttpError, InvalidResponseError, NetworkError } from './errors';

export function getErrorMessageKey(error: unknown): MessageKey {
  if (error instanceof NetworkError) {
    return error.timedOut ? 'error.timeout' : 'error.network';
  }
  if (error instanceof HttpError) {
    return 'error.server';
  }
  if (error instanceof InvalidResponseError) {
    return 'error.invalidData';
  }
  return 'error.unknown';
}
