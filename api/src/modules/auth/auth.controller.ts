import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { logActivity } from '../../lib/activity';
import { AppError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { sendPasswordResetEmail } from '../../lib/mailer';
import { parseDurationToMs } from '../../lib/time';
import * as authService from './auth.service';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.schema';

const REFRESH_COOKIE = 'refresh_token';
const RESET_TOKEN_TTL_HOURS = 1;

function refreshTokenFromRequest(req: Request): string | null {
  const fromCookie = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
  const fromBody = (req.body as { refreshToken?: string } | undefined)?.refreshToken;
  const header = req.headers.authorization;
  const fromHeader = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  return fromCookie ?? fromBody ?? fromHeader ?? null;
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/v1/auth',
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/v1/auth' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as RegisterInput;
  const { user, pendingApproval } = await authService.registerUser(body);
  await logActivity({
    userId: user.id,
    action: 'auth.register',
    entityType: 'user',
    entityId: user.id,
    ip: req.ip,
  });
  res.status(201).json({
    success: true,
    data: {
      user,
      pendingApproval,
      message: pendingApproval
        ? 'Account created. It will be activated once an administrator approves it.'
        : 'Account created. You can now log in.',
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;
  try {
    const user = await authService.authenticate(email, password);
    const { accessToken, refreshToken } = await authService.issueSession(user);
    await authService.touchLastLogin(user.id);
    setRefreshCookie(res, refreshToken);
    await logActivity({ userId: user.id, action: 'auth.login', entityId: user.id, ip: req.ip });
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    if (err instanceof AppError && err.code === 'AUTH_INVALID_CREDENTIALS') {
      await logActivity({
        userId: null,
        action: 'auth.login_failed',
        metadata: { email },
        ip: req.ip,
      });
    }
    throw err;
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const presented = refreshTokenFromRequest(req);
  if (!presented) {
    throw new AppError('AUTH_TOKEN_MISSING', 'Missing refresh token.', 401);
  }
  const result = await authService.rotateRefreshToken(presented);
  setRefreshCookie(res, result.refreshToken);
  await logActivity({ userId: result.user.id, action: 'auth.refresh', ip: req.ip });
  res.json({ success: true, data: { accessToken: result.accessToken, user: result.user } });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const presented = refreshTokenFromRequest(req);
  if (presented) {
    await authService.revokeRefreshToken(presented);
  }
  await logActivity({ userId: req.user?.id ?? null, action: 'auth.logout', ip: req.ip });
  clearRefreshCookie(res);
  res.json({ success: true, data: { loggedOut: true } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getUserById(req.user!.id);
  if (!user) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'User no longer exists.', 401);
  }
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        departmentName: user.departmentName,
      },
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as ForgotPasswordInput;
  const { found, resetToken } = await authService.createPasswordReset(email);

  if (found && resetToken) {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);
    await logActivity({
      userId: null,
      action: 'auth.password_reset_request',
      metadata: { email },
      ip: req.ip,
    });
  }

  const data: { message: string; resetToken?: string; resetLink?: string; expiresInHours?: number } = {
    message: 'If an account exists for that email, a reset link has been sent.',
  };
  // Dev/test convenience: expose the link so the flow can be completed without
  // an SMTP server. Never include it in production.
  if (env.NODE_ENV !== 'production' && found && resetToken) {
    data.resetToken = resetToken;
    data.resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    data.expiresInHours = RESET_TOKEN_TTL_HOURS;
  }

  res.json({ success: true, data });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body as ResetPasswordInput;
  const userId = await authService.resetPassword(token, newPassword);
  await logActivity({
    userId,
    action: 'auth.password_reset',
    entityType: 'user',
    entityId: userId,
    ip: req.ip,
  });
  logger.info(`Password reset completed for user ${userId}`);
  res.json({ success: true, data: { message: 'Password updated. You can now log in.' } });
}
