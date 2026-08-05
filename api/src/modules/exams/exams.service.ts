import { pool } from '../../config/db';
import { logActivity } from '../../lib/activity';
import { AppError } from '../../lib/errors';
import { getCourseOrThrow, requireLecturerOwns, requireStudentEnrolled } from '../courses/courses.service';
import type { CreateExamInput, UpdateExamInput } from './exams.schema';

export interface ExamRow {
  id: string;
  courseId: string;
  createdBy: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number | null;
  venue: string | null;
  instructions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const EXAM_SELECT = `
  SELECT id, course_id, created_by, title, scheduled_at, duration_minutes,
         venue, instructions, created_at, updated_at
  FROM exams
`;

function toExam(row: Record<string, unknown>): ExamRow {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    createdBy: row.created_by as string,
    title: row.title as string,
    scheduledAt: row.scheduled_at as Date,
    durationMinutes: (row.duration_minutes as number | null) ?? null,
    venue: (row.venue as string | null) ?? null,
    instructions: (row.instructions as string | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function listExamsForCourse(
  courseId: string,
  user: { id: string; role: string },
): Promise<ExamRow[]> {
  const course = await getCourseOrThrow(courseId);
  if (user.role === 'student') {
    await requireStudentEnrolled(courseId, user.id);
  } else if (user.role === 'lecturer') {
    await requireLecturerOwns(courseId, user.id);
  }
  const result = await pool.query(
    `${EXAM_SELECT} WHERE course_id = $1 ORDER BY scheduled_at`,
    [courseId],
  );
  return result.rows.map(toExam);
}

export async function getExam(examId: string): Promise<ExamRow | null> {
  const result = await pool.query(`${EXAM_SELECT} WHERE id = $1`, [examId]);
  return result.rows.length ? toExam(result.rows[0]) : null;
}

export async function getExamOrThrow(examId: string): Promise<ExamRow> {
  const exam = await getExam(examId);
  if (!exam) {
    throw new AppError('EXAM_NOT_FOUND', 'Exam not found.', 404);
  }
  return exam;
}

export async function createExam(input: CreateExamInput, lecturerId: string): Promise<ExamRow> {
  await getCourseOrThrow(input.courseId);
  await requireLecturerOwns(input.courseId, lecturerId);
  const result = await pool.query(
    `INSERT INTO exams (course_id, created_by, title, scheduled_at, duration_minutes, venue, instructions)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.courseId,
      lecturerId,
      input.title,
      input.scheduledAt,
      input.durationMinutes ?? null,
      input.venue ?? null,
      input.instructions ?? null,
    ],
  );
  await logActivity({
    userId: lecturerId,
    action: 'exams.create',
    entityType: 'exam',
    entityId: result.rows[0].id,
    metadata: { courseId: input.courseId, title: input.title, scheduledAt: input.scheduledAt },
  });
  return (await getExamOrThrow(result.rows[0].id));
}

export async function updateExam(
  examId: string,
  input: UpdateExamInput,
  lecturerId: string,
): Promise<ExamRow> {
  const exam = await getExamOrThrow(examId);
  await requireLecturerOwns(exam.courseId, lecturerId);

  const changes = Object.entries({
    title: input.title,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes,
    venue: input.venue,
    instructions: input.instructions,
  }).filter(([, value]) => value !== undefined) as [string, unknown][];

  if (changes.length === 0) {
    return exam;
  }

  const sets = changes.map(([column], index) => `${column} = $${index + 2}`);
  await pool.query(`UPDATE exams SET ${sets.join(', ')} WHERE id = $1`, [
    examId,
    ...changes.map(([, value]) => value ?? null),
  ]);
  await logActivity({
    userId: lecturerId,
    action: 'exams.update',
    entityType: 'exam',
    entityId: examId,
    metadata: { title: input.title ?? exam.title },
  });
  return (await getExamOrThrow(examId));
}
