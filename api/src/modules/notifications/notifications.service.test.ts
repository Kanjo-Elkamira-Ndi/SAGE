import { describe, expect, it } from 'vitest';
import { uuidFromString } from './notifications.service';

describe('uuidFromString', () => {
  it('produces a valid v5-shaped uuid', () => {
    const id = uuidFromString('student-1:2026-08-06');
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('is deterministic for the same input', () => {
    expect(uuidFromString('a:b:c')).toBe(uuidFromString('a:b:c'));
  });

  it('differs for different inputs', () => {
    expect(uuidFromString('a:b:c')).not.toBe(uuidFromString('a:b:d'));
  });
});
