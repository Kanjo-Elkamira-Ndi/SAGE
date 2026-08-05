import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { parseDurationToSeconds } from '../../lib/time';
import type { UserRole } from '../../middleware/auth';

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  departmentName: string | null;
}

interface PublicUserWithActive extends PublicUser {
  isActive: boolean;
}

const PUBLIC_USER_SELECT = `
  SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.is_active,
         d.name AS department_name
  FROM users u
  LEFT JOIN departments d ON d.id = u.department_id
`;

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(user: { id: string; role: UserRole }): string {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString('base64url');
  return { token, hash: hashToken(token) };
}

function toPublicUser(row: {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  department_name: string | null;
}): PublicUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    avatarUrl: row.avatar_url,
    departmentName: row.department_name,
  };
}

function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string })?.code === '23505';
}

export async function getUserById(id: string): Promise<PublicUserWithActive | null> {
  const { rows } = await pool.query(`${PUBLIC_USER_SELECT} WHERE u.id = $1`, [id]);
  if (!rows[0]) return null;
  return { ...toPublicUser(rows[0]), isActive: rows[0].is_active };
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ user: PublicUser; pendingApproval: boolean }> {
  const email = input.email.toLowerCase().trim();
  const passwordHash = await argon2.hash(input.password);
  // Students self-activate. Lecturer/admin signups are created inactive and
  // activated by an administrator (admin console "pending" list).
  const pendingApproval = input.role !== 'student';
  const isActive = !pendingApproval;

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, avatar_url, is_active,
                 NULL AS department_name`,
      [email, passwordHash, input.fullName.trim(), input.role, isActive],
    );
    return { user: toPublicUser(rows[0]), pendingApproval };
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError('EMAIL_TAKEN', 'An account already exists for that email.', 409);
    }
    throw err;
  }
}

export async function authenticate(email: string, password: string): Promise<PublicUser> {
  // password_hash is needed locally for argon2.verify but is never returned to callers.
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.is_active,
            d.name AS department_name,
            u.password_hash
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.email = $1`,
    [email.toLowerCase().trim()],
  );
  const row = rows[0];
  if (!row) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }
  const valid = await argon2.verify(row.password_hash, password);
  if (!valid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password.', 401);
  }
  if (!row.is_active) {
    throw new AppError('USER_DEACTIVATED', 'Account is inactive or pending approval.', 403);
  }
  return toPublicUser(row);
}

export async function issueSession(user: {
  id: string;
  role: UserRole;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken(user);
  const refresh = generateRefreshToken();
  const ttlSeconds = parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN);
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [user.id, refresh.hash, ttlSeconds],
  );
  return { accessToken, refreshToken: refresh.token };
}

export async function rotateRefreshToken(
  presented: string,
): Promise<{ accessToken: string; refreshToken: string; user: PublicUser }> {
  const tokenHash = hashToken(presented);
  const { rows } = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [
    tokenHash,
  ]);
  const row = rows[0];
  if (!row) {
    throw new AppError('AUTH_TOKEN_EXPIRED', 'Refresh token is invalid.', 401);
  }
  if (row.revoked_at) {
    // Reuse of an already-rotated token is a possible theft signal — kill all
    // sessions for this user.
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
      [row.user_id],
    );
    throw new AppError('AUTH_TOKEN_REUSED', 'Refresh token reuse detected — all sessions revoked.', 401);
  }
  if (row.expires_at <= new Date()) {
    throw new AppError('AUTH_TOKEN_EXPIRED', 'Refresh token has expired.', 401);
  }
  const user = await getUserById(row.user_id);
  if (!user) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'User no longer exists.', 401);
  }
  if (!user.isActive) {
    throw new AppError('USER_DEACTIVATED', 'Account is inactive or pending approval.', 403);
  }
  await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [row.id]);
  const { accessToken, refreshToken } = await issueSession(user);
  return { accessToken, refreshToken, user };
}

export async function revokeRefreshToken(presented: string): Promise<void> {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashToken(presented)],
  );
}

export async function touchLastLogin(userId: string): Promise<void> {
  await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
}

export async function createPasswordReset(
  email: string,
): Promise<{ found: boolean; resetToken: string | null }> {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE email = $1 AND is_active = true',
    [email.toLowerCase().trim()],
  );
  if (!rows[0]) return { found: false, resetToken: null };

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + make_interval(secs => $3))`,
    [rows[0].id, tokenHash, 3600],
  );
  return { found: true, resetToken: token };
}

export async function resetPassword(token: string, newPassword: string): Promise<string> {
  const { rows } = await pool.query('SELECT * FROM password_reset_tokens WHERE token_hash = $1', [
    hashToken(token),
  ]);
  const row = rows[0];
  if (!row) {
    throw new AppError('RESET_TOKEN_INVALID', 'This reset link is invalid.', 400);
  }
  if (row.used_at) {
    throw new AppError('RESET_TOKEN_USED', 'This reset link has already been used.', 400);
  }
  if (row.expires_at <= new Date()) {
    throw new AppError('RESET_TOKEN_EXPIRED', 'This reset link has expired.', 400);
  }

  const passwordHash = await argon2.hash(newPassword);
  await pool.query('BEGIN');
  try {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      row.user_id,
    ]);
    await pool.query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [row.id]);
    // Password changed under a possibly-stolen session — revoke all refresh tokens.
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
      [row.user_id],
    );
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
  return row.user_id;
}
