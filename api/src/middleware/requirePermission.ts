import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from './auth';
import { AppError } from '../lib/errors';

/**
 * Coarse permission model. Permissions map to roles; richer per-entity
 * ownership checks stay in the domain services.
 */
export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  'users:manage': ['admin'],
  'announcements:manage': ['admin', 'lecturer'],
  'courses:manage': ['admin', 'lecturer'],
  'materials:manage': ['admin', 'lecturer'],
  'grades:manage': ['admin', 'lecturer'],
  'activity:view': ['admin'],
  'reports:view': ['admin'],
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS;

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError('AUTH_TOKEN_MISSING', 'Not authenticated', 401));
      return;
    }
    const allowed = ROLE_PERMISSIONS[permission];
    if (!allowed || !allowed.includes(req.user.role)) {
      next(new AppError('FORBIDDEN_ROLE', 'Insufficient permission for this action', 403));
      return;
    }
    next();
  };
}
