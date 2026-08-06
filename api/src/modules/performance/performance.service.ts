import { pool } from '../../config/db';
import { AppError } from '../../lib/errors';
import { logActivity } from '../../lib/activity';
import { getCourseOrThrow, isCourseOwner } from '../courses/courses.service';
import type { RiskLevel } from './risk';
import {
  RISK_THRESHOLDS,
  type RiskBreakdown,
  type RiskFactors,
  engagementFromDaysSinceLast,
  explainRisk,
  normalizeDecline,
  performanceLevelProxy,
} from './risk';

export type { RiskLevel };

export interface SnapshotRow {
  id: string;
  studentId: string;
  courseId: string | null;
  snapshotDate: Date;
  gpa: number | null;
  avgAssignmentScore: number | null;
  avgQuizScore: number | null;
  riskScore: number | null;
  riskLevel: RiskLevel | null;
  createdAt: Date;
}

export interface RiskDetails extends RiskBreakdown {
  lastSnapshotDate: Date | null;
}

export interface CourseMetrics {
  courseId: string;
  code: string;
  title: string;
  creditUnits: number | null;
  assignmentCount: number;
  submittedCount: number;
  gradedCount: number;
  missedSubmissionRate: number;
  avgAssignmentPct: number | null;
  avgQuizPct: number | null;
  lastAssignmentSubmit: Date | null;
  lastQuizAttempt: Date | null;
  lastActivity: Date | null;
  /** Course percentage derived from this course's own work (for the GPA column). */
  coursePct: number | null;
}

export interface StudentMetrics {
  gpa: number | null;
  avgAssignmentPct: number | null;
  avgQuizPct: number | null;
  missedSubmissionRate: number;
  lastActivity: Date | null;
  byCourse: CourseMetrics[];
}

export interface CoursePerformance {
  course: { id: string; code: string; title: string };
  averages: { avgAssignmentPct: number | null; avgQuizPct: number | null; missedSubmissionRate: number };
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    gpa: number | null;
    avgAssignmentPct: number | null;
    avgQuizPct: number | null;
    riskScore: number;
    riskLevel: string;
  }>;
}

export interface AtRiskStudent {
  studentId: string;
  name: string;
  email: string;
  riskScore: number;
  riskLevel: RiskLevel;
  gpa: number | null;
  avgAssignmentPct: number | null;
  avgQuizPct: number | null;
  lastSnapshotDate: Date | null;
  reasons: string[];
}

const SNAPSHOT_SELECT = `
  SELECT id, student_id, course_id, snapshot_date, gpa,
         avg_assignment_score, avg_quiz_score, risk_score, risk_level, created_at
  FROM performance_snapshots
`;

function toSnapshot(row: Record<string, unknown>): SnapshotRow {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    courseId: (row.course_id as string | null) ?? null,
    snapshotDate: new Date(row.snapshot_date as string),
    gpa: (row.gpa as number | null) ?? null,
    avgAssignmentScore: (row.avg_assignment_score as number | null) ?? null,
    avgQuizScore: (row.avg_quiz_score as number | null) ?? null,
    riskScore: (row.risk_score as number | null) ?? null,
    riskLevel: (row.risk_level as RiskLevel | null) ?? null,
    createdAt: new Date(row.created_at as string),
  };
}

export function todayDateStr(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function getLatestOverallSnapshot(studentId: string): Promise<SnapshotRow | null> {
  const result = await pool.query(
    `${SNAPSHOT_SELECT} WHERE student_id = $1 AND course_id IS NULL ORDER BY snapshot_date DESC LIMIT 1`,
    [studentId],
  );
  return result.rows.length ? toSnapshot(result.rows[0]) : null;
}

export async function getLatestCourseSnapshot(studentId: string, courseId: string): Promise<SnapshotRow | null> {
  const result = await pool.query(
    `${SNAPSHOT_SELECT} WHERE student_id = $1 AND course_id = $2 ORDER BY snapshot_date DESC LIMIT 1`,
    [studentId, courseId],
  );
  return result.rows.length ? toSnapshot(result.rows[0]) : null;
}

export async function computeStudentMetrics(studentId: string): Promise<StudentMetrics> {
  const coursesResult = await pool.query<{
    id: string;
    code: string;
    title: string;
    credit_units: number | null;
  }>(
    `SELECT c.id, c.code, c.title, c.credit_units
     FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.student_id = $1 AND e.status = 'active'
     ORDER BY c.title`,
    [studentId],
  );
  const courses = coursesResult.rows;

  const byCourse: CourseMetrics[] = [];
  let weightedGpaSum = 0;
  let weightedGpaWeight = 0;
  let assignmentWeightedSum = 0;
  let assignmentWeight = 0;
  let quizWeightedSum = 0;
  let quizWeight = 0;
  let missedTotal = 0;
  let assignedTotal = 0;
  let lastActivity: Date | null = null;

  for (const course of courses) {
    const metrics = await computeCourseMetrics(studentId, course);
    byCourse.push(metrics);

    missedTotal += metrics.missedSubmissionRate * metrics.assignmentCount;
    assignedTotal += metrics.assignmentCount;

    const weight = course.credit_units ?? 1;
    if (metrics.coursePct != null) {
      weightedGpaSum += metrics.coursePct * weight;
      weightedGpaWeight += weight;
    }
    if (metrics.avgAssignmentPct != null) {
      assignmentWeightedSum += Number(metrics.avgAssignmentPct) * weight;
      assignmentWeight += weight;
    }
    if (metrics.avgQuizPct != null) {
      quizWeightedSum += Number(metrics.avgQuizPct) * weight;
      quizWeight += weight;
    }
    if (metrics.lastActivity && (!lastActivity || metrics.lastActivity > lastActivity)) {
      lastActivity = metrics.lastActivity;
    }
  }

  const gpa = weightedGpaWeight > 0 ? weightedGpaSum / weightedGpaWeight : null;
  const avgAssignmentPct = assignmentWeight > 0 ? Number((assignmentWeightedSum / assignmentWeight).toFixed(2)) : null;
  const avgQuizPct = quizWeight > 0 ? Number((quizWeightedSum / quizWeight).toFixed(2)) : null;
  const missedSubmissionRate = assignedTotal > 0 ? missedTotal / assignedTotal : 0;

  return {
    gpa: gpa ? Number(gpa.toFixed(2)) : null,
    avgAssignmentPct,
    avgQuizPct,
    missedSubmissionRate,
    lastActivity,
    byCourse,
  };
}

async function computeCourseMetrics(
  studentId: string,
  course: { id: string; code: string; title: string; credit_units: number | null },
): Promise<CourseMetrics> {
  const assignmentResult = await pool.query<{ id: string; max_score: number }>(
    `SELECT id, max_score FROM assignments WHERE course_id = $1`,
    [course.id],
  );
  const assignments = assignmentResult.rows;

  const submittedResult = await pool.query<{ submission_id: string | null }>(
    `SELECT s.id AS submission_id
       FROM assignments a
       LEFT JOIN submissions s
         ON s.assignment_id = a.id AND s.student_id = $1
      WHERE a.course_id = $2`,
    [studentId, course.id],
  );
  const submittedCount = submittedResult.rows.filter((r) => r.submission_id).length;

  const gradedResult = await pool.query<{ score: number; max_score: number }>(
    `SELECT s.score, a.max_score
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
      WHERE s.student_id = $1 AND a.course_id = $2 AND s.score IS NOT NULL`,
    [studentId, course.id],
  );
  const graded = gradedResult.rows;
  const avgAssignmentPct = graded.length
    ? Number((graded.reduce((acc, g) => acc + (Number(g.score) / Number(g.max_score)) * 100, 0) / graded.length).toFixed(2))
    : null;

  const quizResult = await pool.query<{ score: number; total: number }>(
    `SELECT qa.score,
            (SELECT COALESCE(SUM(q.points), 0) FROM quiz_questions q WHERE q.quiz_id = qa.quiz_id) AS total
       FROM quiz_attempts qa
       JOIN quizzes qz ON qz.id = qa.quiz_id
      WHERE qa.student_id = $1 AND qz.course_id = $2 AND qa.submitted_at IS NOT NULL`,
    [studentId, course.id],
  );
  const attempts = quizResult.rows;
  const avgQuizPct = attempts.length
    ? Number((attempts.reduce((acc, a) => acc + (Number(a.score) / (Number(a.total) || 1)) * 100, 0) / attempts.length).toFixed(2))
    : null;

  const lastAssignmentSubmitRow = await pool.query<{ submission_at: Date | null }>(
    `SELECT MAX(s.submitted_at) AS submission_at
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
      WHERE s.student_id = $1 AND a.course_id = $2`,
    [studentId, course.id],
  );
  const lastAssignmentSubmit = lastAssignmentSubmitRow.rows[0]?.submission_at ?? null;

  const lastQuizRow = await pool.query<{ attempt_at: Date | null }>(
    `SELECT MAX(qa.submitted_at) AS attempt_at
       FROM quiz_attempts qa
       JOIN quizzes qz ON qz.id = qa.quiz_id
      WHERE qa.student_id = $1 AND qz.course_id = $2`,
    [studentId, course.id],
  );
  const lastQuizAttempt = lastQuizRow.rows[0]?.attempt_at ?? null;

  const activityRow = await pool.query<{ last_at: Date | null }>(
    `SELECT MAX(created_at) AS last_at
       FROM activity_logs
      WHERE user_id = $1
        AND (entity_type IN ('quiz','submission','assignment','material')
             OR action LIKE 'submissions%' OR action LIKE 'quizzes%')`,
    [studentId],
  );
  let lastActivity = activityRow.rows[0]?.last_at ?? null;
  if (!lastActivity) {
    const anyActivity = await pool.query<{ last_at: Date | null }>(
      `SELECT MAX(created_at) AS last_at FROM activity_logs WHERE user_id = $1`,
      [studentId],
    );
    lastActivity = anyActivity.rows[0]?.last_at ?? null;
  }

  const missedSubmissionRate = assignments.length ? (assignments.length - submittedCount) / assignments.length : 0;
  const coursePct = computeCoursePct(avgAssignmentPct, avgQuizPct, graded.length, attempts.length);

  return {
    courseId: course.id,
    code: course.code,
    title: course.title,
    creditUnits: course.credit_units ?? null,
    assignmentCount: assignments.length,
    submittedCount,
    gradedCount: graded.length,
    missedSubmissionRate,
    avgAssignmentPct,
    avgQuizPct,
    lastAssignmentSubmit,
    lastQuizAttempt,
    lastActivity,
    coursePct,
  };
}

/** Weighted blend of assignment and quiz averages (each contributes by count). */
export function computeCoursePct(
  avgAssignmentPct: number | null,
  avgQuizPct: number | null,
  gradedCount: number,
  quizCount: number,
): number | null {
  if (!avgAssignmentPct && !avgQuizPct) return null;
  const a = avgAssignmentPct ?? 0;
  const q = avgQuizPct ?? 0;
  const total = gradedCount + quizCount;
  return Number(((a * gradedCount + q * quizCount) / (total || 1)).toFixed(2));
}

export function buildRiskFactors(
  metrics: StudentMetrics,
  prev: SnapshotRow | null,
): RiskFactors {
  const prevGpa = prev?.gpa ?? null;
  const gpaDecline =
    prev != null
      ? normalizeDecline(prevGpa, metrics.gpa)
      : metrics.gpa != null
        ? performanceLevelProxy(Number(metrics.gpa))
        : 0;

  const prevQuiz = prev?.avgQuizScore ?? null;
  const quizDecline =
    prev != null
      ? normalizeDecline(prevQuiz, metrics.avgQuizPct)
      : metrics.avgQuizPct != null
        ? performanceLevelProxy(Number(metrics.avgQuizPct))
        : 0;

  const daysSinceActivity =
    prev && metrics.lastActivity
      ? Math.floor((Date.now() - new Date(prev.snapshotDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  const lowEngagement = engagementFromDaysSinceLast(daysSinceActivity);

  return {
    gpaDecline,
    missedSubmissionRate: metrics.missedSubmissionRate,
    quizDecline,
    lowEngagement,
  };
}

/**
 * Recomputes the overall + course snapshot for a single student/course, within a
 * transaction. Throws on unexpected errors; callers decide whether to swallow.
 */
async function recomputeOne(
  studentId: string,
  courseId: string,
  asOf: Date = new Date(),
): Promise<SnapshotRow | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize concurrent recomputes for the same student+course (the grade
    // and quiz triggers both fire-and-forget this) so the DELETE+INSERT upsert
    // cannot interleave and create duplicate snapshot rows.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
      `${studentId}:${courseId ?? 'overall'}`,
    ]);
    const metrics = await computeStudentMetrics(studentId);
    const prevOverall = await getLatestOverallSnapshotBefore(studentId, asOf, client);
    const factors = buildRiskFactors(metrics, prevOverall);
    const breakdown = explainRisk(factors);

    await upsertSnapshot(client, studentId, null, null, breakdown, asOf);
    await upsertSnapshot(
      client,
      studentId,
      courseId,
      metrics.byCourse.find((c) => c.courseId === courseId) ?? null,
      breakdown,
      asOf,
    );
    await client.query('COMMIT');

    const result = await client.query(`${SNAPSHOT_SELECT} WHERE student_id = $1 AND course_id IS NULL AND snapshot_date = $2`, [
      studentId,
      todayDateStr(asOf),
    ]);
    return result.rows.length ? toSnapshot(result.rows[0] as Record<string, unknown>) : null;
  } finally {
    client.release();
  }
}

/** Called after a grade is finalized; never throws into the grading flow. */
export async function recomputeStudentSnapshotsForGrade(
  studentId: string,
  courseId: string,
  asOf: Date = new Date(),
): Promise<void> {
  try {
    await recomputeOne(studentId, courseId, asOf);
  } catch (err) {
    await logActivity({
      userId: studentId,
      action: 'performance.snapshot.recompute_failed',
      entityType: 'performance_snapshot',
      metadata: { courseId, error: err instanceof Error ? err.message : String(err) },
    });
  }
}

/** Recomputes snapshots for all active student/course pairs (weekly cron path). */
export async function recomputeAllSnapshots(asOf: Date = new Date()): Promise<number> {
  const enrollments = await pool.query<{ student_id: string; course_id: string }>(
    `SELECT student_id, course_id FROM enrollments WHERE status = 'active'`,
  );
  let processed = 0;
  for (const e of enrollments.rows) {
    try {
      await recomputeOne(e.student_id, e.course_id, asOf);
      processed += 1;
    } catch (err) {
      await logActivity({
        userId: e.student_id,
        action: 'performance.snapshot.recompute_failed',
        entityType: 'performance_snapshot',
        metadata: { courseId: e.course_id, error: err instanceof Error ? err.message : String(err) },
      });
    }
  }
  return processed;
}

/** Recomputes course snapshots for every student enrolled in a course. */
export async function recomputeCourseSnapshots(courseId: string, asOf: Date = new Date()): Promise<number> {
  const students = await pool.query<{ student_id: string }>(
    `SELECT student_id FROM enrollments WHERE course_id = $1 AND status = 'active'`,
    [courseId],
  );
  let processed = 0;
  for (const s of students.rows) {
    try {
      await recomputeOne(s.student_id, courseId, asOf);
      processed += 1;
    } catch (err) {
      await logActivity({
        userId: s.student_id,
        action: 'performance.snapshot.recompute_failed',
        entityType: 'performance_snapshot',
        metadata: { courseId, error: err instanceof Error ? err.message : String(err) },
      });
    }
  }
  return processed;
}

async function getLatestOverallSnapshotBefore(
  studentId: string,
  asOf: Date,
  client: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
): Promise<SnapshotRow | null> {
  const result = await client.query(
    `${SNAPSHOT_SELECT} WHERE student_id = $1 AND course_id IS NULL AND snapshot_date < $2 ORDER BY snapshot_date DESC LIMIT 1`,
    [studentId, todayDateStr(asOf)],
  );
  return result.rows.length ? toSnapshot(result.rows[0] as Record<string, unknown>) : null;
}

async function upsertSnapshot(
  client: { query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  studentId: string,
  courseId: string | null,
  courseMetrics: CourseMetrics | null,
  breakdown: RiskBreakdown,
  asOf: Date,
) {
  const dateStr = todayDateStr(asOf);
  await client.query(
    `DELETE FROM performance_snapshots WHERE student_id = $1 AND course_id IS NOT DISTINCT FROM $2 AND snapshot_date = $3`,
    [studentId, courseId, dateStr],
  );
  const gpa = courseMetrics ? courseMetrics.coursePct : null;
  await client.query(
    `INSERT INTO performance_snapshots
       (student_id, course_id, snapshot_date, gpa, avg_assignment_score, avg_quiz_score, risk_score, risk_level, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())`,
    [
      studentId,
      courseId,
      dateStr,
      gpa,
      courseMetrics ? courseMetrics.avgAssignmentPct : null,
      courseMetrics ? courseMetrics.avgQuizPct : null,
      breakdown.score,
      breakdown.level,
    ],
  );
}

export async function getStudentPerformance(studentId: string): Promise<{
  overall: { snapshot: SnapshotRow | null; metrics: StudentMetrics };
}> {
  const metrics = await computeStudentMetrics(studentId);
  const snapshot = await getLatestOverallSnapshot(studentId);
  return { overall: { snapshot, metrics } };
}

export async function getStudentRisk(studentId: string): Promise<RiskDetails> {
  const metrics = await computeStudentMetrics(studentId);
  const prev = await getLatestOverallSnapshot(studentId);
  const factors = buildRiskFactors(metrics, prev);
  const breakdown = explainRisk(factors);
  return { ...breakdown, lastSnapshotDate: prev?.snapshotDate ?? null };
}

export async function getCoursePerformance(courseId: string, lecturerId: string): Promise<CoursePerformance> {
  const course = await getCourseOrThrow(courseId);
  if (!(await isCourseOwner(courseId, lecturerId))) {
    throw new AppError('NOT_COURSE_OWNER', 'Lecturers can only view performance for their own courses.', 403);
  }

  const studentRows = await pool.query<{
    student_id: string;
    full_name: string;
    email: string;
  }>(
    `SELECT u.id AS student_id, u.full_name, u.email
       FROM users u
       JOIN enrollments e ON e.student_id = u.id
      WHERE e.course_id = $1 AND e.status = 'active'
      ORDER BY u.full_name`,
    [courseId],
  );

  const students: CoursePerformance['students'] = [];
  let sumAssignment = 0;
  let nAssignment = 0;
  let sumQuiz = 0;
  let nQuiz = 0;
  let missedSum = 0;
  let missedN = 0;

  for (const row of studentRows.rows) {
    const metrics = await computeStudentMetrics(row.student_id);
    const courseMetrics = metrics.byCourse.find((c) => c.courseId === courseId) ?? null;
    const prevCourse = await getLatestCourseSnapshot(row.student_id, courseId);

    const breakdown = explainRisk(buildCourseRiskFactors(courseMetrics, prevCourse));

    students.push({
      studentId: row.student_id,
      name: row.full_name,
      email: row.email,
      gpa: courseMetrics?.coursePct ?? null,
      avgAssignmentPct: courseMetrics?.avgAssignmentPct ?? null,
      avgQuizPct: courseMetrics?.avgQuizPct ?? null,
      riskScore: breakdown.score,
      riskLevel: breakdown.level,
    });

    if (courseMetrics?.avgAssignmentPct != null) {
      sumAssignment += Number(courseMetrics.avgAssignmentPct);
      nAssignment += 1;
    }
    if (courseMetrics?.avgQuizPct != null) {
      sumQuiz += Number(courseMetrics.avgQuizPct);
      nQuiz += 1;
    }
    if (courseMetrics) {
      missedSum += courseMetrics.missedSubmissionRate;
      missedN += 1;
    }
  }

  return {
    course: { id: course.id, code: course.code, title: course.title },
    averages: {
      avgAssignmentPct: nAssignment ? Number((sumAssignment / nAssignment).toFixed(2)) : null,
      avgQuizPct: nQuiz ? Number((sumQuiz / nQuiz).toFixed(2)) : null,
      missedSubmissionRate: missedN ? Number((missedSum / missedN).toFixed(2)) : 0,
    },
    students,
  };
}

export function buildCourseRiskFactors(
  courseMetrics: CourseMetrics | null,
  prevCourse: SnapshotRow | null,
): RiskFactors {
  if (!courseMetrics || courseMetrics.coursePct == null) {
    return { gpaDecline: 0, missedSubmissionRate: 0, quizDecline: 0, lowEngagement: 0 };
  }
  const gpaDecline = prevCourse
    ? normalizeDecline(prevCourse.gpa, courseMetrics.coursePct)
    : performanceLevelProxy(Number(courseMetrics.coursePct));
  const quizDecline = prevCourse
    ? normalizeDecline(prevCourse.avgQuizScore, courseMetrics.avgQuizPct)
    : courseMetrics.avgQuizPct != null
      ? performanceLevelProxy(Number(courseMetrics.avgQuizPct))
      : 0;
  return {
    gpaDecline,
    missedSubmissionRate: courseMetrics.missedSubmissionRate,
    quizDecline,
    lowEngagement: 0,
  };
}

export async function getAtRiskStudents(opts: { level?: RiskLevel; minScore?: number } = {}): Promise<AtRiskStudent[]> {
  // Default to the medium threshold so the report only surfaces students worth
  // acting on; pass minScore=0 to see every student with a snapshot.
  const minScore = opts.minScore ?? RISK_THRESHOLDS.medium;
  const result = await pool.query<{
    student_id: string;
    full_name: string;
    email: string;
    risk_score: number;
    risk_level: string;
    gpa: number | null;
    avg_assignment_score: number | null;
    avg_quiz_score: number | null;
    snapshot_date: string;
  }>(
    `WITH latest AS (
       SELECT DISTINCT ON (student_id)
              student_id, risk_score, risk_level, gpa, avg_assignment_score, avg_quiz_score, snapshot_date
         FROM performance_snapshots
        WHERE course_id IS NULL AND risk_score IS NOT NULL
        ORDER BY student_id, snapshot_date DESC
     )
     SELECT u.id AS student_id, u.full_name, u.email, s.risk_score, s.risk_level, s.gpa,
            s.avg_assignment_score, s.avg_quiz_score, s.snapshot_date
       FROM latest s
       JOIN users u ON u.id = s.student_id
      WHERE s.risk_score >= $1
      ORDER BY s.risk_score DESC NULLS LAST`,
    [minScore],
  );

  const levelFilter = opts.level ? result.rows.filter((r) => r.risk_level === opts.level) : result.rows;
  return levelFilter.map((r) => ({
    studentId: r.student_id,
    name: r.full_name,
    email: r.email,
    riskScore: Number(r.risk_score),
    riskLevel: r.risk_level as RiskLevel,
    gpa: r.gpa,
    avgAssignmentPct: r.avg_assignment_score,
    avgQuizPct: r.avg_quiz_score,
    lastSnapshotDate: r.snapshot_date ? new Date(r.snapshot_date) : null,
    reasons: atRiskReasons(Number(r.risk_score), r.risk_level),
  }));
}

export function atRiskReasons(score: number, level: string): string[] {
  const reasons: string[] = [];
  if (level === 'high') reasons.push('Risk score is high; immediate outreach recommended.');
  else if (level === 'medium') reasons.push('Risk score is medium; monitor progress and provide support.');
  if (score >= 0.66) reasons.push('Combined risk factors exceed the high-risk threshold.');
  return reasons.length ? reasons : ['Review the student\'s recent activity and grades.'];
}
