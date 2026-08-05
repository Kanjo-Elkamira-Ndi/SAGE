import { env } from '../config/env';
import { logger } from './logger';

/**
 * Email delivery. SMTP transport is not wired yet (deferred to the
 * notifications phase) — until then the reset link is logged so the flow can
 * be exercised in development.
 */
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    logger.info(`[dev mailer] Password reset for ${to}: ${resetLink}`);
    return;
  }
  logger.warn(`[mailer] SMTP not configured — reset link for ${to} was not emailed`);
}
