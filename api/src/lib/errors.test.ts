import { describe, expect, it } from 'vitest';
import { AppError, isAppError } from './errors';

describe('AppError', () => {
  it('carries code, message, status and details', () => {
    const err = new AppError('VALIDATION_ERROR', 'Invalid request body', 400, { issues: [] });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AppError');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid request body');
    expect(err.status).toBe(400);
    expect(err.details).toEqual({ issues: [] });
  });

  it('defaults to status 400', () => {
    const err = new AppError('NOT_FOUND', 'nope');
    expect(err.status).toBe(400);
  });

  it('is detected by isAppError', () => {
    expect(isAppError(new AppError('X', 'y'))).toBe(true);
    expect(isAppError(new Error('plain'))).toBe(false);
    expect(isAppError('string')).toBe(false);
  });
});
