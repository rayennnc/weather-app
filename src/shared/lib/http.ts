import { HttpError, InvalidResponseError, NetworkError } from './errors';

// RN doesn't set a fetch timeout, so a stuck request would keep the loading state forever
const DEFAULT_TIMEOUT_MS = 10000;

export type FetchJsonOptions = {
  signal?: AbortSignal; // lets TanStack Query cancel the request
  timeoutMs?: number;
};

// returns the raw json, the repository validates it with zod
export async function fetchJson(
  url: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: FetchJsonOptions = {},
): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abortFromCaller = () => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', abortFromCaller);
  }

  const toRequestError = (error: unknown): Error => {
    if (signal?.aborted) {
      // cancelled by the caller, don't wrap it
      return error instanceof Error ? error : new Error('Request aborted');
    }
    if (timedOut) {
      return new NetworkError('Request timed out', { cause: error, timedOut });
    }
    return new NetworkError('Network request failed', { cause: error });
  };

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch (error) {
      throw toRequestError(error);
    }

    if (!response.ok) {
      throw new HttpError(response.status, await readReason(response));
    }

    try {
      return await response.json();
    } catch (error) {
      if (controller.signal.aborted) {
        throw toRequestError(error);
      }
      throw new InvalidResponseError('Response body is not valid JSON', error);
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

async function readReason(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'reason' in body &&
      typeof body.reason === 'string'
    ) {
      return body.reason;
    }
  } catch {
    // empty or non-json body (proxy html page etc), the status is enough
  }
  return undefined;
}
