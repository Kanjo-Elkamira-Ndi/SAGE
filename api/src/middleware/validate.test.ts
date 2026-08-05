import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from '../lib/errors';
import { parseBody } from './validate';

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

describe('parseBody', () => {
  it('returns parsed data for a valid body', () => {
    const out = parseBody(schema, { email: 'a@b.com', age: 22 });
    expect(out).toEqual({ email: 'a@b.com', age: 22 });
  });

  it('throws AppError with VALIDATION_ERROR code for an invalid body', () => {
    try {
      parseBody(schema, { email: 'not-an-email', age: -1 });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe('VALIDATION_ERROR');
      expect((err as AppError).status).toBe(400);
      expect((err as AppError).details).toBeDefined();
    }
  });

  it('coerces strict defaults defined by the schema', () => {
    const withDefault = z.object({ name: z.string().default('anon') });
    expect(parseBody(withDefault, {})).toEqual({ name: 'anon' });
  });
});
