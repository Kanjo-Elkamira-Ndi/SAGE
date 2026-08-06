import { pool } from '../../config/db';
import { AppError } from '../../lib/errors';
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from './announcements.schema';
import type { AuthUser } from '../../middleware/auth';

export interface AnnouncementRow {
  id: string;
  courseId: string | null;
  courseTitle: string | null;
  title: string;
  body: string;
  postedBy: string;
  postedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const SELECT = `SELECT a.id, a.course_id, a.posted_by, a.title, a.body, a.created_at, a.updated_at,
                        u.full_name AS posted_by_name, c.title AS course_title
                   FROM announcements a
                   LEFT JOIN users u ON u.id = a.posted_by
                   LEFT JOIN courses c ON c.id = a.course_id`;

function toAnnouncement(row: Record<string, unknown>): AnnouncementRow {
  return {
    id: row.id as string,
    courseId: (row.course_id as string | null) ?? null,
    courseTitle: (row.course_title as string | null) ?? null,
    title: row.title as string,
    body: row.body as string,
    postedBy: row.posted_by as string,
    postedByName: (row.posted_by_name as string | null) ?? null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function listAnnouncements(opts: { page: number; limit: number }): Promise<{
  items: AnnouncementRow[];
  total: number;
}> {
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM announcements`);
  const rows = await pool.query(`${SELECT} ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`, [
    opts.limit,
    (opts.page - 1) * opts.limit,
  ]);
  return { items: rows.rows.map(toAnnouncement), total: countResult.rows[0].total as number };
}

async function assertPostableCourse(user: AuthUser, courseId: string): Promise<void> {
  const result = await pool.query(`SELECT lecturer_id FROM courses WHERE id = $1`, [courseId]);
  if (!result.rows.length) {
    throw new AppError('COURSE_NOT_FOUND', 'Course not found.', 404);
  }
  if (user.role === 'lecturer' && result.rows[0].lecturer_id !== user.id) {
    throw new AppError('FORBIDDEN_ROLE', 'You can only post announcements to your own courses', 403);
  }
}

export async function createAnnouncement(
  user: AuthUser,
  input: CreateAnnouncementInput,
): Promise<AnnouncementRow> {
  if (input.courseId) {
    await assertPostableCourse(user, input.courseId);
  }
  const result = await pool.query(
    `INSERT INTO announcements (course_id, posted_by, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.courseId ?? null, user.id, input.title, input.body],
  );
  const id = result.rows[0].id as string;
  const row = await pool.query(`${SELECT} WHERE a.id = $1`, [id]);
  return toAnnouncement(row.rows[0] as Record<string, unknown>);
}

export async function updateAnnouncement(
  announcementId: string,
  input: UpdateAnnouncementInput,
): Promise<AnnouncementRow> {
  const fields: string[] = [];
  const params: unknown[] = [announcementId];
  let index = 2;
  if (input.title !== undefined) {
    fields.push(`title = $${index}`);
    params.push(input.title);
    index += 1;
  }
  if (input.body !== undefined) {
    fields.push(`body = $${index}`);
    params.push(input.body);
    index += 1;
  }
  if (input.courseId !== undefined) {
    fields.push(`course_id = $${index}`);
    params.push(input.courseId);
    index += 1;
  }
  if (fields.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'No fields to update', 400);
  }
  const result = await pool.query(
    `UPDATE announcements SET ${fields.join(', ')}, updated_at = now()
      WHERE id = $1
      RETURNING id, course_id, posted_by, title, body, created_at, updated_at`,
    params,
  );
  if (!result.rows.length) {
    throw new AppError('ANNOUNCEMENT_NOT_FOUND', 'Announcement not found.', 404);
  }
  const row = result.rows[0] as Record<string, unknown>;
  return {
    id: row.id as string,
    courseId: (row.course_id as string | null) ?? null,
    courseTitle: null,
    title: row.title as string,
    body: row.body as string,
    postedBy: row.posted_by as string,
    postedByName: null,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const result = await pool.query(`DELETE FROM announcements WHERE id = $1`, [announcementId]);
  if (!result.rowCount) {
    throw new AppError('ANNOUNCEMENT_NOT_FOUND', 'Announcement not found.', 404);
  }
}

/**
 * Notify the announcement's audience. Course-scoped announcements notify the
 * course's active enrolled students; school-wide announcements notify every
 * active user. Returns the number of notifications created.
 */
export async function notifyAnnouncementAudience(
  announcementId: string,
  courseId: string | null,
): Promise<number> {
  const result = courseId
    ? await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
         SELECT DISTINCT e.student_id, 'announcement', $2, 'New announcement for your course.', 'announcement', $1::uuid
           FROM enrollments e
           JOIN users u ON u.id = e.student_id
          WHERE e.course_id = $3 AND u.is_active = true`,
        [announcementId, 'New announcement for your course.', courseId],
      )
    : await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, related_entity_type, related_entity_id)
         SELECT id, 'announcement', $2, 'New announcement from your school.', 'announcement', $1::uuid
           FROM users
          WHERE is_active = true`,
        [announcementId, 'New announcement from your school.'],
      );
  return result.rowCount ?? 0;
}
