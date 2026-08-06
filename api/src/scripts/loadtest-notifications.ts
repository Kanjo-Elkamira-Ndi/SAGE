/**
 * Phase 9 load check for the deadline-reminder cron.
 *
 * Seeds `STUDENTS` active students enrolled in `COURSES` courses, creates
 * `ASSIGNMENTS_PER_COURSE` assignments due inside the reminder window, runs
 * `runDeadlineReminders` once, reports the timing and candidate/sent counts,
 * then removes all seeded rows.
 *
 * Usage: npx tsx src/scripts/loadtest-notifications.ts [students] [courses] [assignmentsPerCourse]
 */
import { pool } from '../config/db';
import { runDeadlineReminders } from '../jobs/deadlineReminders.job';
import { env } from '../config/env';

const STUDENTS = Number(process.argv[2] ?? 200);
const COURSES = Number(process.argv[3] ?? 1);
const ASSIGNMENTS_PER_COURSE = Number(process.argv[4] ?? 2);

const EMAILS: string[] = [];
const ids = { lecturer: '', courseIds: [] as string[], studentIds: [] as string[], assignmentIds: [] as string[] };

function hrtimeToMs([sec, ns]: [number, number]): number {
  return Math.round(sec * 1000 + ns / 1e6);
}

async function main(): Promise<void> {
  const email = (prefix: string, i: number) => `loadtest.${prefix}.${i}.${Date.now()}@university.edu`;
  EMAILS.push(email('lect', 0));
  for (let i = 0; i < STUDENTS; i += 1) EMAILS.push(email('student', i));

  const lecturer = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, is_active, activated_at)
     VALUES ($1, 'x', 'Load Test Lecturer', 'lecturer', true, now()) RETURNING id`,
    [EMAILS[0]],
  );
  ids.lecturer = lecturer.rows[0].id as string;

  for (let c = 0; c < COURSES; c += 1) {
    const course = await pool.query(
      `INSERT INTO courses (title, code, description, lecturer_id, is_active)
       VALUES ($1, $2, 'load test', $3, true) RETURNING id`,
      [`Load Test Course ${c}`, `LT${Date.now().toString(36)}${c}`, ids.lecturer],
    );
    ids.courseIds.push(course.rows[0].id as string);
  }

  const dueAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  for (const courseId of ids.courseIds) {
    for (let a = 0; a < ASSIGNMENTS_PER_COURSE; a += 1) {
      const assignment = await pool.query(
        `INSERT INTO assignments (course_id, created_by, title, deadline_at, allow_late_submission)
         VALUES ($1, $2, $3, $4, false) RETURNING id`,
        [courseId, ids.lecturer, `Load Assignment ${a}`, dueAt],
      );
      ids.assignmentIds.push(assignment.rows[0].id as string);
    }
  }

  let enrolled = 0;
  for (let s = 0; s < STUDENTS; s += 1) {
    const student = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, activated_at)
       VALUES ($1, 'x', $2, 'student', true, now()) RETURNING id`,
      [EMAILS[s + 1], `Load Test Student ${s}`],
    );
    ids.studentIds.push(student.rows[0].id as string);
    for (const courseId of ids.courseIds) {
      await pool.query(
        `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)`,
        [student.rows[0].id as string, courseId],
      );
      enrolled += 1;
    }
  }

  console.log(
    `Seeded ${STUDENTS} students, ${COURSES} course(s), ${enrolled} enrollments, ` +
      `${ids.assignmentIds.length} assignments (windows: ${env.DEADLINE_REMINDER_WINDOWS}).`,
  );

  const start = process.hrtime();
  const result = await runDeadlineReminders(new Date());
  const elapsed = hrtimeToMs(process.hrtime(start));

  const notified = await pool.query(
    `SELECT count(*)::int AS n FROM notifications
      WHERE type = 'deadline_reminder' AND related_entity_id = ANY($1)`,
    [ids.assignmentIds],
  );

  console.log(
    `runDeadlineReminders: windows=${JSON.stringify(result.windows)} candidates=${result.candidates} ` +
      `sent=${result.sent} notifications_created=${notified.rows[0].n as number} in ${elapsed}ms ` +
      `(${(enrolled / (elapsed / 1000)).toFixed(0)} candidates/sec)`,
  );
}

async function cleanup(): Promise<void> {
  await pool.query(`DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`, [EMAILS]);
  await pool.query(
    `DELETE FROM notifications_sent WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1))`,
    [EMAILS],
  );
  await pool.query(`DELETE FROM enrollments WHERE student_id IN (SELECT id FROM users WHERE email = ANY($1))`, [EMAILS]);
  await pool.query(`DELETE FROM assignments WHERE id = ANY($1)`, [ids.assignmentIds]);
  await pool.query(`DELETE FROM courses WHERE id = ANY($1)`, [ids.courseIds]);
  await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [EMAILS]);
  console.log(`Cleaned up ${EMAILS.length} users and related rows.`);
}

main()
  .catch((err) => {
    console.error('Load test failed:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    await pool.end();
  });
