import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../config/db';
import { AppError } from '../lib/errors';

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError('AUTH_TOKEN_MISSING', 'Missing access token', 401));
    return;
  }

  const token = header.slice('Bearer '.length);
  let payload: { sub: string };
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
  } catch {
    next(new AppError('AUTH_TOKEN_EXPIRED', 'Access token expired or invalid', 401));
    return;
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, department_id, is_active, activated_at FROM users WHERE id = $1',
      [payload.sub],
    );
    const row = rows[0];
    if (!row) {
      next(new AppError('AUTH_INVALID_CREDENTIALS', 'User no longer exists', 401));
      return;
    }
    if (!row.is_active) {
      const pending = row.activated_at == null;
      next(
        pending
          ? new AppError('USER_PENDING_APPROVAL', 'Account is awaiting admin approval', 403)
          : new AppError('USER_DEACTIVATED', 'Account has been deactivated', 403),
      );
      return;
    }

    req.user = {
      id: row.id,
      email: row.email,
      role: row.role,
      departmentId: row.department_id,
    };
    next();
  } catch (err) {
    next(err);
  }
}
