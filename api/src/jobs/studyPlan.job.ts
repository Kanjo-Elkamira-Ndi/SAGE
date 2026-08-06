import { pool } from '../config/db';
import { AppError } from '../lib/errors';
import { groqChat } from '../lib/groq';
import { logger } from '../lib/logger';
import { sendIdempotentNotification, uuidFromString } from '../modules/notifications/notifications.service';

export interface UpcomingDeadline {
  title: string;
  deadlineAt: Date;
}

export interface StudyPlanContext {
  courses: string[];
  upcomingDeadlines: UpcomingDeadline[];
}

const MAX_PLAN_LENGTH = 4000;

/** Build the Groq prompt from a student's course list and upcoming deadlines. */
export function buildStudyPlanPrompt(ctx: StudyPlanContext): string {
  const courseLine = ctx.courses.length ? ctx.courses.map((c) => `- ${c}`).join('\n') : '- none yet';
  const deadlineLine = ctx.upcomingDeadlines.length
    ? ctx.upcomingDeadlines
        .map((d) => `- ${d.title} (due ${d.deadlineAt.toISOString()})`)
        .join('\n')
    : '- none';
  return [
    'You are a study coach. Given a student\'s courses and upcoming assignment deadlines,',
    'write a concise, personalised study plan for today. Use plain text with short bullet points.',
    'Keep it under 200 words. Do not invent course names or deadlines.',
    '',
    'Courses:',
    courseLine,
    '',
    'Upcoming deadlines:',
    deadlineLine,
  ].join('\n');
}

/** Trim + cap a generated plan so a bad model response never bloats storage. */
export function sanitizePlan(text: string): string {
  return text.trim().slice(0, MAX_PLAN_LENGTH);
}

export const GROQ_STUDY_PLAN_SYSTEM_PROMPT = 'You are a concise, encouraging study coach.';

/**
 * Nightly AI study plan. For each enrolled, active student, generates a short
 * study plan from their courses + upcoming deadlines and sends one idempotent
 * notification per student-day. Skips students whose run fails (Groq down, no
 * courses) instead of failing the whole job.
 */
export async function runStudyPlan(now: Date = new Date()): Promise<{
  students: number;
  generated: number;
  skipped: number;
}> {
  const studentsResult = await pool.query<Record<string, unknown>>(
    `SELECT DISTINCT e.student_id
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
      WHERE u.is_active = true
        AND EXISTS (SELECT 1 FROM courses c WHERE c.id = e.course_id)`,
  );

  const dateKey = now.toISOString().slice(0, 10);
  let generated = 0;
  let skipped = 0;

  for (const row of studentsResult.rows) {
    const studentId = row.student_id as string;
    try {
      const coursesResult = await pool.query<Record<string, unknown>>(
        `SELECT DISTINCT c.title
           FROM courses c
           JOIN enrollments e ON e.course_id = c.id
          WHERE e.student_id = $1`,
        [studentId],
      );
      const deadlinesResult = await pool.query<Record<string, unknown>>(
        `SELECT a.title, a.deadline_at
           FROM assignments a
           JOIN enrollments e ON e.course_id = a.course_id
          WHERE e.student_id = $1 AND a.deadline_at > now()
          ORDER BY a.deadline_at ASC
          LIMIT 5`,
        [studentId],
      );
      const ctx: StudyPlanContext = {
        courses: coursesResult.rows.map((c) => c.title as string),
        upcomingDeadlines: deadlinesResult.rows.map((d) => ({
          title: d.title as string,
          deadlineAt: d.deadline_at as Date,
        })),
      };
      if (ctx.courses.length === 0) {
        skipped += 1;
        continue;
      }
      const response = await groqChat(
        [
          { role: 'system', content: GROQ_STUDY_PLAN_SYSTEM_PROMPT },
          { role: 'user', content: buildStudyPlanPrompt(ctx) },
        ],
        { maxTokens: 1000, temperature: 0.5 },
      );
      const plan = sanitizePlan(response.text);
      if (!plan) {
        skipped += 1;
        continue;
      }
      const didSend = await sendIdempotentNotification({
        userId: studentId,
        type: 'ai_study_plan',
        title: 'Your study plan for today',
        body: plan,
        eventType: 'ai_study_plan',
        eventRefId: uuidFromString(`${studentId}:${dateKey}`),
      });
      if (didSend) generated += 1;
    } catch (err) {
      skipped += 1;
      if (err instanceof AppError && err.code === 'GROQ_UNAVAILABLE') {
        logger.warn('study_plan: Groq unavailable, skipping', { studentId });
      } else {
        logger.error('study_plan: per-student failure', { studentId, error: String(err) });
      }
    }
  }

  logger.info('study_plan complete', {
    students: studentsResult.rows.length,
    generated,
    skipped,
  });
  return { students: studentsResult.rows.length, generated, skipped };
}
