import { pool } from '../../config/db';
import { logActivity } from '../../lib/activity';
import { AppError } from '../../lib/errors';
import {
  createSignedDownloadUrl,
  createSubmissionUploadUrl as createSubmissionStorageUploadUrl,
  objectExists,
} from '../../lib/storage';
import {
  getCourseOrThrow,
  requireLecturerOwns,
  requireStudentEnrolled,
} from '../courses/courses.service';
import { recomputeStudentSnapshotsForGrade } from '../performance/performance.service';
import type {
  CreateAssignmentInput,
  CreateSubmissionUploadUrlInput,
  FinalizeSubmissionInput,
  GradeSubmissionInput,
  UpdateAssignmentInput,
} from './assignments.schema';

export interface AssignmentRow {
  id: string;
  courseId: string;
  createdBy: string;
  title: string;
  instructions: string | null;
  maxScore: number;
  deadlineAt: Date;
  allowLateSubmission: boolean;
  createdAt: Date;
  updatedAt: Date;
  mySubmission: {
    submissionId: string;
    submittedAt: Date;
    isLate: boolean;
    score: number | null;
    graded: boolean;
  } | null;
}

export interface SubmissionRow {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  storageKey: string;
  submittedAt: Date;
  isLate: boolean;
  score: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: Date | null;
  attempts: number;
}

const ASSIGNMENT_SELECT_COLUMNS = `
  SELECT a.id, a.course_id, a.created_by, a.title, a.instructions, a.max_score,
         a.deadline_at, a.allow_late_submission, a.created_at, a.updated_at
`;
const ASSIGNMENT_FROM = ` FROM assignments a`;

function toAssignment(row: Record<string, unknown>): AssignmentRow {
  return {
    id: row.id as string,
    courseId: row.course_id as string,
    createdBy: row.created_by as string,
    title: row.title as string,
    instructions: (row.instructions as string | null) ?? null,
    maxScore: Number(row.max_score),
    deadlineAt: row.deadline_at as Date,
    allowLateSubmission: row.allow_late_submission as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    mySubmission: (row.my_submission as AssignmentRow['mySubmission']) ?? null,
  };
}

function toSubmission(row: Record<string, unknown>): SubmissionRow {
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    studentEmail: row.student_email as string,
    storageKey: row.storage_key as string,
    submittedAt: row.submitted_at as Date,
    isLate: row.is_late as boolean,
    score: (row.score as number | null) ?? null,
    feedback: (row.feedback as string | null) ?? null,
    gradedBy: (row.graded_by as string | null) ?? null,
    gradedAt: (row.graded_at as Date | null) ?? null,
    attempts: row.attempts as number,
  };
}

export async function getAssignment(assignmentId: string): Promise<AssignmentRow | null> {
  const result = await pool.query(`${ASSIGNMENT_SELECT_COLUMNS}${ASSIGNMENT_FROM} WHERE a.id = $1`, [
    assignmentId,
  ]);
  if (!result.rows.length) return null;
  return toAssignment({ ...result.rows[0], my_submission: null });
}

export async function getAssignmentOrThrow(assignmentId: string): Promise<AssignmentRow> {
  const assignment = await getAssignment(assignmentId);
  if (!assignment) {
    throw new AppError('ASSIGNMENT_NOT_FOUND', 'Assignment not found.', 404);
  }
  return assignment;
}

function assertNotPastDeadline(assignment: AssignmentRow, at: Date): void {
  if (!assignment.allowLateSubmission && at > assignment.deadlineAt) {
    throw new AppError(
      'DEADLINE_PASSED',
      'This assignment is past its deadline and late submissions are not allowed.',
      403,
    );
  }
}

export async function listAssignmentsForCourse(
  courseId: string,
  user: { id: string; role: string },
): Promise<AssignmentRow[]> {
  const course = await getCourseOrThrow(courseId);
  if (user.role === 'student') {
    await requireStudentEnrolled(courseId, user.id);
  } else if (user.role === 'lecturer') {
    await requireLecturerOwns(courseId, user.id);
  }

  const studentSubquery =
    user.role === 'student'
      ? `,
         (SELECT jsonb_build_object(
             'submissionId', s.id,
             'submittedAt', s.submitted_at,
             'isLate', s.is_late,
             'score', s.score,
             'graded', s.graded_at IS NOT NULL
           )
            FROM submissions s
           WHERE s.assignment_id = a.id AND s.student_id = $2) AS my_submission`
      : '';
  const params = user.role === 'student' ? [courseId, user.id] : [courseId];

  const result = await pool.query(
    `${ASSIGNMENT_SELECT_COLUMNS}${studentSubquery}${ASSIGNMENT_FROM}
     WHERE a.course_id = $1
     ORDER BY a.deadline_at`,
    params,
  );
  return result.rows.map(toAssignment);
}

export async function createAssignment(
  input: CreateAssignmentInput,
  lecturerId: string,
): Promise<AssignmentRow> {
  await getCourseOrThrow(input.courseId);
  await requireLecturerOwns(input.courseId, lecturerId);
  if (new Date(input.deadlineAt) <= new Date()) {
    throw new AppError('DEADLINE_PAST', 'Assignment deadline must be in the future.', 400);
  }

  const result = await pool.query(
    `INSERT INTO assignments (course_id, created_by, title, instructions, max_score, deadline_at, allow_late_submission)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      input.courseId,
      lecturerId,
      input.title,
      input.instructions ?? null,
      input.maxScore,
      input.deadlineAt,
      input.allowLateSubmission,
    ],
  );
  await logActivity({
    userId: lecturerId,
    action: 'assignments.create',
    entityType: 'assignment',
    entityId: result.rows[0].id,
    metadata: { courseId: input.courseId, title: input.title, deadlineAt: input.deadlineAt },
  });
  return (await getAssignmentOrThrow(result.rows[0].id));
}

export async function updateAssignment(
  assignmentId: string,
  input: UpdateAssignmentInput,
  lecturerId: string,
): Promise<AssignmentRow> {
  const assignment = await getAssignmentOrThrow(assignmentId);
  await requireLecturerOwns(assignment.courseId, lecturerId);

  const changes = Object.entries({
    title: input.title,
    instructions: input.instructions,
    max_score: input.maxScore,
    deadline_at: input.deadlineAt,
    allow_late_submission: input.allowLateSubmission,
  }).filter(([, value]) => value !== undefined) as [string, unknown][];

  if (changes.length === 0) {
    return assignment;
  }

  const sets = changes.map(([column], index) => `${column} = $${index + 2}`);
  await pool.query(`UPDATE assignments SET ${sets.join(', ')} WHERE id = $1`, [
    assignmentId,
    ...changes.map(([, value]) => value ?? null),
  ]);
  await logActivity({
    userId: lecturerId,
    action: 'assignments.update',
    entityType: 'assignment',
    entityId: assignmentId,
    metadata: { title: input.title ?? assignment.title },
  });
  return (await getAssignmentOrThrow(assignmentId));
}

export async function createSubmissionUploadUrl(
  input: CreateSubmissionUploadUrlInput,
  studentId: string,
): Promise<{ uploadUrl: string; storageKey: string; expiresInSeconds: number; isLate: boolean }> {
  const assignment = await getAssignmentOrThrow(input.assignmentId);
  await requireStudentEnrolled(assignment.courseId, studentId);
  const now = new Date();
  assertNotPastDeadline(assignment, now);

  const result = await createSubmissionStorageUploadUrl({
    assignmentId: input.assignmentId,
    fileName: input.fileName,
    contentType: input.contentType,
    fileSizeBytes: input.fileSizeBytes,
  });
  return { ...result, isLate: now > assignment.deadlineAt };
}

export async function finalizeSubmission(
  input: FinalizeSubmissionInput,
  studentId: string,
): Promise<SubmissionRow> {
  const assignment = await getAssignmentOrThrow(input.assignmentId);
  await requireStudentEnrolled(assignment.courseId, studentId);
  const now = new Date();
  assertNotPastDeadline(assignment, now);
  if (!(await objectExists(input.storageKey))) {
    throw new AppError('SUBMISSION_FILE_MISSING', 'The uploaded file was not found in storage.', 400);
  }
  const isLate = now > assignment.deadlineAt;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO submissions (assignment_id, student_id, storage_key, submitted_at, is_late)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET storage_key = EXCLUDED.storage_key, submitted_at = now(),
                     is_late = EXCLUDED.is_late, score = NULL, feedback = NULL,
                     graded_by = NULL, graded_at = NULL
       RETURNING id`,
      [input.assignmentId, studentId, input.storageKey, now.toISOString(), isLate],
    );
    await client.query(
      `INSERT INTO submission_history (submission_id, storage_key, submitted_at) VALUES ($1, $2, $3)`,
      [result.rows[0].id, input.storageKey, now.toISOString()],
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const submission = await submissionRowForStudent(input.assignmentId, studentId);
  await logActivity({
    userId: studentId,
    action: 'submissions.create',
    entityType: 'submission',
    entityId: submission.id,
    metadata: { assignmentId: input.assignmentId, isLate },
  });
  return submission;
}

async function submissionRowForStudent(
  assignmentId: string,
  studentId: string,
): Promise<SubmissionRow> {
  const result = await pool.query(
    `SELECT s.id, s.assignment_id, s.student_id, u.full_name AS student_name, u.email AS student_email,
            s.storage_key, s.submitted_at, s.is_late, s.score, s.feedback, s.graded_by, s.graded_at,
            (SELECT COUNT(*)::int FROM submission_history sh WHERE sh.submission_id = s.id) AS attempts
       FROM submissions s
       JOIN users u ON u.id = s.student_id
      WHERE s.assignment_id = $1 AND s.student_id = $2`,
    [assignmentId, studentId],
  );
  if (!result.rows.length) {
    throw new AppError('SUBMISSION_NOT_FOUND', 'Submission not found.', 404);
  }
  return toSubmission(result.rows[0]);
}

export async function listSubmissionsForAssignment(
  assignmentId: string,
  lecturerId: string,
): Promise<{ assignment: AssignmentRow; submissions: SubmissionRow[] }> {
  const assignment = await getAssignmentOrThrow(assignmentId);
  await requireLecturerOwns(assignment.courseId, lecturerId);
  const result = await pool.query(
    `SELECT s.id, s.assignment_id, s.student_id, u.full_name AS student_name, u.email AS student_email,
            s.storage_key, s.submitted_at, s.is_late, s.score, s.feedback, s.graded_by, s.graded_at,
            (SELECT COUNT(*)::int FROM submission_history sh WHERE sh.submission_id = s.id) AS attempts
       FROM submissions s
       JOIN users u ON u.id = s.student_id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at`,
    [assignmentId],
  );
  return { assignment, submissions: result.rows.map(toSubmission) };
}

export async function getSubmissionOrThrow(submissionId: string): Promise<SubmissionRow> {
  const result = await pool.query(
    `SELECT s.id, s.assignment_id, s.student_id, u.full_name AS student_name, u.email AS student_email,
            s.storage_key, s.submitted_at, s.is_late, s.score, s.feedback, s.graded_by, s.graded_at,
            (SELECT COUNT(*)::int FROM submission_history sh WHERE sh.submission_id = s.id) AS attempts
       FROM submissions s
       JOIN users u ON u.id = s.student_id
      WHERE s.id = $1`,
    [submissionId],
  );
  if (!result.rows.length) {
    throw new AppError('SUBMISSION_NOT_FOUND', 'Submission not found.', 404);
  }
  return toSubmission(result.rows[0]);
}

async function lecturerName(userId: string): Promise<string> {
  const result = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  return (result.rows[0]?.full_name as string | undefined) ?? 'Your lecturer';
}

export async function gradeSubmission(
  submissionId: string,
  input: GradeSubmissionInput,
  lecturerId: string,
): Promise<SubmissionRow> {
  const submission = await getSubmissionOrThrow(submissionId);
  const assignment = await getAssignmentOrThrow(submission.assignmentId);
  await requireLecturerOwns(assignment.courseId, lecturerId);
  if (input.score > assignment.maxScore) {
    throw new AppError('SCORE_EXCEEDS_MAX', `Score cannot exceed ${assignment.maxScore}.`, 400);
  }

  const result = await pool.query(
    `UPDATE submissions SET score = $1, feedback = $2, graded_by = $3, graded_at = now()
     WHERE id = $4 RETURNING id`,
    [input.score, input.feedback ?? null, lecturerId, submissionId],
  );
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
     VALUES ($1, 'feedback', 'Assignment graded', $2, 'submission', $3)`,
    [
      submission.studentId,
      `${await lecturerName(lecturerId)} graded "${assignment.title}". You scored ${input.score}/${assignment.maxScore}.`,
      submissionId,
    ],
  );
  await logActivity({
    userId: lecturerId,
    action: 'submissions.grade',
    entityType: 'submission',
    entityId: submissionId,
    metadata: { assignmentId: assignment.id, score: input.score },
  });
  void recomputeStudentSnapshotsForGrade(submission.studentId, assignment.courseId);
  return getSubmissionOrThrow(result.rows[0].id);
}

export async function submissionDownloadUrl(
  submissionId: string,
  user: { id: string; role: string },
): Promise<{ downloadUrl: string; expiresInSeconds: number; submission: SubmissionRow }> {
  const submission = await getSubmissionOrThrow(submissionId);
  const assignment = await getAssignmentOrThrow(submission.assignmentId);
  if (user.role === 'admin') {
    // ok
  } else if (user.role === 'lecturer') {
    await requireLecturerOwns(assignment.courseId, user.id);
  } else {
    if (user.id !== submission.studentId) {
      throw new AppError('NOT_YOUR_SUBMISSION', 'You can only view your own submissions.', 403);
    }
  }
  const { downloadUrl, expiresInSeconds } = await createSignedDownloadUrl(submission.storageKey);
  return { downloadUrl, expiresInSeconds, submission };
}
