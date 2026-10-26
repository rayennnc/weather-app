import { HttpError, InvalidResponseError, NetworkError } from './errors';
import { fetchJson } from './http';

const TEST_URL = 'https://api.example.test/v1/data';

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const abortError = () =>
  Object.assign(new Error('Aborted'), { name: 'AbortError' });

// never settles, only rejects when its signal is aborted
const hangingFetch: typeof fetch = (_input, init) =>
  new Promise((_resolve, reject) => {
    const signal = init?.signal;
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    signal?.addEventListener('abort', () => reject(abortError()));
  });

// returns the rejection reason, fails if the promise resolves
const rejection = (promise: Promise<unknown>) =>
  promise.then(
    () => {
      throw new Error('Expected the promise to reject');
    },
    (error: unknown) => error,
  );

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.useRealTimers();
});

describe('fetchJson', () => {
  it('returns the parsed JSON body on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ hello: 'world' }));

    await expect(fetchJson(TEST_URL)).resolves.toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(TEST_URL);
  });

  it('asks the server for JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await fetchJson(TEST_URL);

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({
      Accept: 'application/json',
    });
  });

  it('throws HttpError carrying the API reason on a 400 response', async () => {
    const reason = 'Latitude must be in range of -90 to 90°. Given: 91.0.';
    fetchMock.mockResolvedValue(jsonResponse({ error: true, reason }, 400));

    const error = await rejection(fetchJson(TEST_URL));

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ name: 'HttpError', status: 400, reason });
    expect((error as HttpError).message).toBe(reason);
  });

  it('throws HttpError without a reason when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>Bad gateway</html>', { status: 502 }),
    );

    const error = await rejection(fetchJson(TEST_URL));

    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(502);
    expect((error as HttpError).reason).toBeUndefined();
    expect((error as HttpError).message).toBe('HTTP 502');
  });

  it('throws InvalidResponseError when a successful response is not JSON', async () => {
    // e.g. captive portal wifi answering 200 with a login page
    fetchMock.mockResolvedValue(
      new Response('<html>Login to the wifi</html>', { status: 200 }),
    );

    const error = await rejection(fetchJson(TEST_URL));

    expect(error).toBeInstanceOf(InvalidResponseError);
    // compare by name, node's fetch throws its SyntaxError from another realm than jest's
    expect((error as InvalidResponseError).cause).toMatchObject({
      name: 'SyntaxError',
    });
  });

  it('throws NetworkError when the request itself fails (offline)', async () => {
    const cause = new TypeError('Network request failed');
    fetchMock.mockRejectedValue(cause);

    const error = await rejection(fetchJson(TEST_URL));

    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toMatchObject({ timedOut: false, cause });
  });

  it('throws NetworkError with timedOut when the request exceeds the timeout', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangingFetch);

    const pending = rejection(fetchJson(TEST_URL, { timeoutMs: 5000 }));
    await jest.advanceTimersByTimeAsync(5000);
    const error = await pending;

    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toMatchObject({ timedOut: true });
  });

  it('clears its timeout timer once the request settles', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'queueMicrotask'] });
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await fetchJson(TEST_URL);

    expect(jest.getTimerCount()).toBe(0);
  });

  it('passes the abort error through unchanged when the caller cancels', async () => {
    fetchMock.mockImplementation(hangingFetch);
    const controller = new AbortController();

    const pending = rejection(
      fetchJson(TEST_URL, { signal: controller.signal }),
    );
    controller.abort();
    const error = await pending;

    expect(error).toMatchObject({ name: 'AbortError' });
    expect(error).not.toBeInstanceOf(NetworkError);
  });

  it('rejects with the abort error when the signal is already aborted', async () => {
    fetchMock.mockImplementation(hangingFetch);
    const controller = new AbortController();
    controller.abort();

    const error = await rejection(
      fetchJson(TEST_URL, { signal: controller.signal }),
    );

    expect(error).toMatchObject({ name: 'AbortError' });
    expect(error).not.toBeInstanceOf(NetworkError);
  });
});
