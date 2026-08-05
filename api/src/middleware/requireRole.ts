import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from './auth';
import { AppError } from '../lib/errors';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError('AUTH_TOKEN_MISSING', 'Not authenticated', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('FORBIDDEN_ROLE', 'Insufficient role for this action', 403));
      return;
    }
    next();
  };
}
