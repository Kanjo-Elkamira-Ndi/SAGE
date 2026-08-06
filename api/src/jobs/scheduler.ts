import cron from 'node-cron';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { recomputeAllSnapshots } from '../modules/performance/performance.service';

// Weekly full recompute: every Sunday at 02:00 server time.
const WEEKLY_CRON = '0 2 * * 0';

export function startScheduler(): { stop: () => void } {
  if (env.NODE_ENV === 'test') {
    logger.info('Scheduler disabled in test environment.');
    return { stop: () => {} };
  }

  const task = cron.schedule(WEEKLY_CRON, async () => {
    logger.info('Running weekly performance snapshot recompute...');
    try {
      const processed = await recomputeAllSnapshots();
      logger.info(`Weekly performance recompute complete. Students processed: ${processed}`);
    } catch (err) {
      logger.error('Weekly performance recompute failed.', err instanceof Error ? err.message : String(err));
    }
  });

  logger.info('Performance scheduler started (weekly snapshot recompute).');
  return { stop: () => task.stop() };
}
