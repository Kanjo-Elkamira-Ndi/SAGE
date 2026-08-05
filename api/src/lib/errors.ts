export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Robust AppError detection: falls back to a structural check because tsx/HMR
 * and bundlers can produce multiple copies of this module, which breaks
 * `instanceof` across those copies.
 */
export const isAppError = (err: unknown): err is AppError =>
  err instanceof AppError ||
  (isRecord(err) &&
    err.name === 'AppError' &&
    typeof err.status === 'number' &&
    typeof err.code === 'string' &&
    typeof err.message === 'string');
