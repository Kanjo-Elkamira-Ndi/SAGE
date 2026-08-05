import jwt from 'jsonwebtoken';
import { afterAll, describe, expect, it } from 'vitest';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { hashToken, signAccessToken } from './auth.service';

afterAll(async () => {
  await pool.end().catch(() => undefined);
});

describe('hashToken', () => {
  it('produces a 64-char sha256 hex digest', () => {
    const hash = hashToken('abc');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic', () => {
    expect(hashToken('same-token')).toBe(hashToken('same-token'));
  });

  it('differs for different tokens', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'));
  });
});

describe('signAccessToken', () => {
  it('issues a token that verifies with sub + role', () => {
    const token = signAccessToken({ id: 'user-1', role: 'student' });
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: string };
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('student');
  });

  it('fails verification under a different secret', () => {
    const token = signAccessToken({ id: 'user-1', role: 'admin' });
    expect(() => jwt.verify(token, 'a-completely-different-secret-012345')).toThrow();
  });
});
