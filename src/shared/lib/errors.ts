// server replied with a non-2xx status
export class HttpError extends Error {
  readonly status: number;
  readonly reason: string | undefined;

  constructor(status: number, reason?: string) {
    super(reason ?? `HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.reason = reason;
  }
}

// no response at all: offline, dns, timeout
export class NetworkError extends Error {
  readonly timedOut: boolean;

  constructor(
    message: string,
    options: { cause?: unknown; timedOut?: boolean } = {},
  ) {
    super(message);
    this.name = 'NetworkError';
    this.cause = options.cause;
    this.timedOut = options.timedOut ?? false;
  }
}

// got a 2xx but the body isn't json (or isn't the shape we expect)
export class InvalidResponseError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'InvalidResponseError';
    this.cause = cause;
  }
}
