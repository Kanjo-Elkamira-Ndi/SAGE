import { AppError } from './errors';

/**
 * Express 5 types route params as `string | string[]`; every `req.params` read
 * goes through here so controllers stay string-typed.
 */
export function paramString(value: string | string[] | undefined, name = 'id'): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AppError('VALIDATION_ERROR', `Missing route parameter: ${name}`, 400);
  }
  return value;
}
