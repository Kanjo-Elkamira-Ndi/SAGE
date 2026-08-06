import cron from 'node-cron';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { runDeadlineReminders } from './deadlineReminders.job';
import { runMaterialDigest } from './materialDigest.job';
import { runPerformanceSnapshot } from './performanceSnapshot.job';
import { runStudyPlan } from './studyPlan.job';

// Hourly at :05 — deadline reminders for the 48h/24h/2h windows.
const DEADLINE_REMINDERS_CRON = '5 * * * *';
// Daily 21:00 — new-materials digest.
const MATERIAL_DIGEST_CRON = '0 21 * * *';
// Daily 05:00 — AI study plan narration.
const STUDY_PLAN_CRON = '0 5 * * *';
// Weekly Sunday 02:00 — full performance snapshot recompute.
const PERFORMANCE_SNAPSHOT_CRON = '0 2 * * 0';

interface SchedulerTask {
  name: string;
  task: ReturnType<typeof cron.schedule>;
}

function guard(name: string, run: () => Promise<unknown>): () => Promise<void> {
  return async () => {
    try {
      await run();
    } catch (err) {
      logger.error(`${name} job failed.`, err instanceof Error ? err.message : String(err));
    }
  };
}

export function startScheduler(): { stop: () => void } {
  if (env.NODE_ENV === 'test') {
    logger.info('Scheduler disabled in test environment.');
    return { stop: () => {} };
  }

  const tasks: SchedulerTask[] = [
    { name: 'deadline_reminders', task: cron.schedule(DEADLINE_REMINDERS_CRON, guard('deadline_reminders', () => runDeadlineReminders())) },
    { name: 'material_digest', task: cron.schedule(MATERIAL_DIGEST_CRON, guard('material_digest', () => runMaterialDigest())) },
    { name: 'study_plan', task: cron.schedule(STUDY_PLAN_CRON, guard('study_plan', () => runStudyPlan())) },
    { name: 'performance_snapshot', task: cron.schedule(PERFORMANCE_SNAPSHOT_CRON, guard('performance_snapshot', () => runPerformanceSnapshot())) },
  ];

  logger.info('Scheduler started.', {
    deadline_reminders: DEADLINE_REMINDERS_CRON,
    material_digest: MATERIAL_DIGEST_CRON,
    study_plan: STUDY_PLAN_CRON,
    performance_snapshot: PERFORMANCE_SNAPSHOT_CRON,
  });

  return { stop: () => tasks.forEach(({ task }) => task.stop()) };
}
