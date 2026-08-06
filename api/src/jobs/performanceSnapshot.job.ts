import { logger } from '../lib/logger';
import { recomputeAllSnapshots } from '../modules/performance/performance.service';

/**
 * Weekly full performance snapshot recompute. Wrapper around
 * recomputeAllSnapshots so the scheduler only talks to job modules.
 */
export async function runPerformanceSnapshot(now: Date = new Date()): Promise<number> {
  const processed = await recomputeAllSnapshots(now);
  logger.info('performance_snapshot complete', { processed });
  return processed;
}
