import { pool } from '../../config/db';
import { AppError } from '../../lib/errors';
import { logActivity } from '../../lib/activity';
import type { CreateCourseInput, UpdateCourseInput } from './courses.schema';

export function isUniqueViolation(err: unknown, constraint?: string): boolean {
  const code = (err as { code?: string })?.code;
  if (code !== '23505') return false;
  if (!constraint) return true;
  return (err as { constraint?: string })?.constraint === constraint;
}

export interface CourseRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
  semester: string | null;
  creditUnits: number | null;
  departmentId: string | null;
  departmentName: string | null;
  lecturerId: string;
  lecturerName: string;
  outline: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrolledCount: number;
}

const COURSE_BASE_SELECT = `
  SELECT c.id, c.code, c.title, c.description, c.semester, c.credit_units,
         c.department_id, d.name AS department_name,
         c.lecturer_id, u.full_name AS lecturer_name,
         c.outline, c.is_active, c.created_at, c.updated_at,
         (SELECT COUNT(*)::int FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') AS enrolled_count
  FROM courses c
  LEFT JOIN departments d ON d.id = c.department_id
  LEFT JOIN users u ON u.id = c.lecturer_id
`;

function toCourse(row: Record<string, unknown>): CourseRow {
  return {
    id: row.id as string,
    code: row.code as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    semester: (row.semester as string | null) ?? null,
    creditUnits: (row.credit_units as number | null) ?? null,
    departmentId: (row.department_id as string | null) ?? null,
    departmentName: (row.department_name as string | null) ?? null,
    lecturerId: row.lecturer_id as string,
    lecturerName: row.lecturer_name as string,
    outline: (row.outline as string | null) ?? null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    enrolledCount: row.enrolled_count as number,
  };
}

export async function listCoursesForStudent(
  studentId: string,
  page: number,
  limit: number,
): Promise<{ items: CourseRow[]; total: number }> {
  const totalResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM courses c
     JOIN enrollments e ON e.course_id = c.id
     WHERE e.student_id = $1 AND e.status = 'active'`,
    [studentId],
  );
  const total = totalResult.rows[0].total as number;
  const result = await pool.query(
    `${COURSE_BASE_SELECT}
     WHERE c.id IN (SELECT e.course_id FROM enrollments e WHERE e.student_id = $1 AND e.status = 'active')
       AND c.is_active = true
     ORDER BY c.title
     LIMIT $2 OFFSET $3`,
    [studentId, limit, page * limit],
  );
  return { items: result.rows.map(toCourse), total };
}

export async function listCoursesForLecturer(
  lecturerId: string,
  page: number,
  limit: number,
): Promise<{ items: CourseRow[]; total: number }> {
  const totalResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM courses WHERE lecturer_id = $1`,
    [lecturerId],
  );
  const total = totalResult.rows[0].total as number;
  const result = await pool.query(
    `${COURSE_BASE_SELECT} WHERE c.lecturer_id = $1 ORDER BY c.title LIMIT $2 OFFSET $3`,
    [lecturerId, limit, page * limit],
  );
  return { items: result.rows.map(toCourse), total };
}

export async function listAllCourses(
  page: number,
  limit: number,
): Promise<{ items: CourseRow[]; total: number }> {
  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM courses`);
  const total = totalResult.rows[0].total as number;
  const result = await pool.query(
    `${COURSE_BASE_SELECT} ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, page * limit],
  );
  return { items: result.rows.map(toCourse), total };
}

export async function getCourse(courseId: string): Promise<CourseRow | null> {
  const result = await pool.query(`${COURSE_BASE_SELECT} WHERE c.id = $1`, [courseId]);
  return result.rows.length ? toCourse(result.rows[0]) : null;
}

export async function getCourseOrThrow(courseId: string): Promise<CourseRow> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new AppError('COURSE_NOT_FOUND', 'Course not found.', 404);
  }
  return course;
}

export async function assertDepartmentExists(departmentId: string): Promise<void> {
  const result = await pool.query(`SELECT id FROM departments WHERE id = $1`, [departmentId]);
  if (result.rows.length === 0) {
    throw new AppError('DEPARTMENT_NOT_FOUND', 'Department not found.', 400);
  }
}

export async function createCourse(
  input: CreateCourseInput,
  actor: { id: string; role: string },
): Promise<CourseRow> {
  if (input.departmentId) {
    await assertDepartmentExists(input.departmentId);
  }
  const lecturerId = actor.id;
  try {
    const result = await pool.query(
      `INSERT INTO courses (code, title, description, department_id, lecturer_id, credit_units, semester, outline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        input.code,
        input.title,
        input.description ?? null,
        input.departmentId ?? null,
        lecturerId,
        input.creditUnits ?? null,
        input.semester ?? null,
        input.outline ?? null,
      ],
    );
    await logActivity({
      userId: actor.id,
      action: 'create',
      entityType: 'course',
      entityId: result.rows[0].id,
      metadata: { code: input.code, title: input.title },
    });
    return await getCourseOrThrow(result.rows[0].id);
  } catch (err) {
    if (isUniqueViolation(err, 'courses_code_key')) {
      throw new AppError('COURSE_CODE_TAKEN', `Code "${input.code}" is already in use.`, 409);
    }
    throw err;
  }
}

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
  actor: { id: string; role: string },
): Promise<CourseRow> {
  const course = await getCourseOrThrow(courseId);
  if (actor.role !== 'admin' && course.lecturerId !== actor.id) {
    throw new AppError('NOT_COURSE_OWNER', 'You can only update your own courses.', 403);
  }
  if (input.departmentId) {
    await assertDepartmentExists(input.departmentId);
  }

  const changes = Object.entries({
    title: input.title,
    code: input.code,
    description: input.description,
    department_id: input.departmentId,
    credit_units: input.creditUnits,
    semester: input.semester,
    outline: input.outline,
  }).filter(([, value]) => value !== undefined) as [string, unknown][];

  if (changes.length === 0) {
    return course;
  }

  const sets = changes.map(([column], index) => `${column} = $${index + 2}`);
  try {
    const result = await pool.query(
      `UPDATE courses SET ${sets.join(', ')} WHERE id = $1 RETURNING id`,
      [courseId, ...changes.map(([, value]) => value ?? null)],
    );
    await logActivity({
      userId: actor.id,
      action: 'update',
      entityType: 'course',
      entityId: courseId,
      metadata: { code: input.code ?? course.code, title: input.title ?? course.title },
    });
    return await getCourseOrThrow(result.rows[0].id);
  } catch (err) {
    if (isUniqueViolation(err, 'courses_code_key')) {
      throw new AppError('COURSE_CODE_TAKEN', `Code "${input.code}" is already in use.`, 409);
    }
    throw err;
  }
}

export async function enrollStudent(courseId: string, studentId: string): Promise<CourseRow> {
  const course = await getCourseOrThrow(courseId);
  if (!course.isActive) {
    throw new AppError('COURSE_CLOSED', 'This course is not currently open.', 409);
  }
  const existing = await pool.query(
    `SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2`,
    [courseId, studentId],
  );
  if (existing.rows.length > 0) {
    throw new AppError('ALREADY_ENROLLED', 'You are already enrolled in this course.', 409);
  }
  try {
    await pool.query(`INSERT INTO enrollments (course_id, student_id) VALUES ($1, $2)`, [
      courseId,
      studentId,
    ]);
  } catch (err) {
    if (isUniqueViolation(err, 'enrollments_course_id_student_id_key')) {
      throw new AppError('ALREADY_ENROLLED', 'You are already enrolled in this course.', 409);
    }
    throw err;
  }
  await logActivity({
    userId: studentId,
    action: 'enroll',
    entityType: 'course',
    entityId: courseId,
    metadata: { code: course.code, title: course.title },
  });
  return { ...course, enrolledCount: course.enrolledCount + 1 };
}

export async function isCourseOwner(courseId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM courses WHERE id = $1 AND lecturer_id = $2`,
    [courseId, userId],
  );
  return result.rows.length > 0;
}

export async function isEnrolled(courseId: string, studentId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2 AND status = 'active'`,
    [courseId, studentId],
  );
  return result.rows.length > 0;
}

export async function canAccessCourse(
  user: { id: string; role: string },
  course: CourseRow,
): Promise<boolean> {
  if (user.role === 'admin') return true;
  if (user.role === 'lecturer') return course.lecturerId === user.id;
  return isEnrolled(course.id, user.id);
}

export async function requireStudentEnrolled(courseId: string, studentId: string): Promise<void> {
  if (!(await isEnrolled(courseId, studentId))) {
    throw new AppError('NOT_ENROLLED', 'Enroll in this course to access it.', 403);
  }
}

export async function requireLecturerOwns(courseId: string, lecturerId: string): Promise<void> {
  if (!(await isCourseOwner(courseId, lecturerId))) {
    throw new AppError('NOT_COURSE_OWNER', 'You can only manage your own courses.', 403);
  }
}

export async function requireCourseReadAccess(
  user: { id: string; role: string },
  course: CourseRow,
): Promise<void> {
  if (await canAccessCourse(user, course)) return;
  throw user.role === 'student'
    ? new AppError('NOT_ENROLLED', 'You are not enrolled in this course.', 403)
    : new AppError('NOT_COURSE_OWNER', 'You do not have access to this course.', 403);
}
