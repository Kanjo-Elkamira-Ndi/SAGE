import { pool } from '../config/db';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import {
  sendIdempotentNotificationsBatch,
  uuidFromString,
  type IdempotentNotificationInput,
} from '../modules/notifications/notifications.service';

export function humanizeHours(hours: number): string {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? '1 day' : `${days} days`;
  }
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

/** Parsed, deduped, descending reminder windows from env (e.g. 48,24,2). */
export function getReminderWindows(source: string = env.DEADLINE_REMINDER_WINDOWS): number[] {
  return source
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a);
}

interface ReminderCandidate {
  studentId: string;
  assignmentId: string;
  title: string;
  courseTitle: string;
  deadlineAt: Date;
}

/**
 * Sends deadline reminders for assignments due within each configured window
 * (e.g. the next 2 hours, 24 hours, 48 hours) that are not yet submitted and
 * do not allow late submission. Idempotent via notifications_sent — running
 * the job twice never double-notifies.
 */
export async function runDeadlineReminders(now: Date = new Date()): Promise<{
  windows: number[];
  candidates: number;
  sent: number;
}> {
  const windows = getReminderWindows();
  let candidates = 0;
  let sent = 0;

  for (const hours of windows) {
    const result = await pool.query<Record<string, unknown>>(
      `SELECT s.id AS student_id, a.id AS assignment_id, a.title, c.title AS course_title, a.deadline_at
         FROM assignments a
         JOIN courses c ON c.id = a.course_id
         JOIN enrollments e ON e.course_id = a.course_id
         JOIN users s ON s.id = e.student_id
        WHERE a.deadline_at > $1
          AND a.deadline_at <= $1 + make_interval(hours => $2)
          AND a.allow_late_submission = false
          AND s.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM submissions sub
             WHERE sub.assignment_id = a.id AND sub.student_id = s.id
          )`,
      [now, hours],
    );
    candidates += result.rows.length;

    const inputs: IdempotentNotificationInput[] = result.rows.map((row) => {
      const candidate: ReminderCandidate = {
        studentId: row.student_id as string,
        assignmentId: row.assignment_id as string,
        title: row.title as string,
        courseTitle: row.course_title as string,
        deadlineAt: row.deadline_at as Date,
      };
      return {
        userId: candidate.studentId,
        type: 'deadline_reminder',
        title: `Assignment due in ${humanizeHours(hours)}: ${candidate.title}`,
        body: `Course: ${candidate.courseTitle}. Deadline ${candidate.deadlineAt.toISOString()}.`,
        relatedEntityType: 'assignment',
        relatedEntityId: candidate.assignmentId,
        eventType: 'deadline_reminder',
        eventRefId: uuidFromString(`${candidate.studentId}:${candidate.assignmentId}:${hours}h`),
      };
    });
    sent += await sendIdempotentNotificationsBatch(inputs);
  }

  logger.info('deadline_reminders complete', { windows, candidates, sent });
  return { windows, candidates, sent };
}
