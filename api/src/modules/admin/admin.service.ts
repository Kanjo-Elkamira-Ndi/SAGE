import { pool } from '../../config/db';
import { AppError } from '../../lib/errors';
import { toCsv, stringifyValue } from '../../lib/csv';
import { logActivity } from '../../lib/activity';
import {
  recomputeAllSnapshots,
  recomputeCourseSnapshots,
  getAtRiskStudents,
} from '../performance/performance.service';
import type { RiskLevel } from '../performance/risk';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  ListUsersQuery,
  ListActivityLogsQuery,
} from './admin.schema';

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
  activatedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  lecturerCount: number;
  createdAt: Date;
}

export interface ActivityLogRow {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: Date;
}

const USER_SELECT = `
  SELECT u.id, u.email, u.full_name, u.role, u.department_id, u.is_active,
         u.activated_at, u.last_login_at, u.created_at, d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
`;

function toAdminUser(row: Record<string, unknown>): AdminUserRow {
  return {
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    role: row.role as string,
    departmentId: (row.department_id as string | null) ?? null,
    departmentName: (row.department_name as string | null) ?? null,
    isActive: row.is_active as boolean,
    activatedAt: (row.activated_at as Date | null) ?? null,
    lastLoginAt: (row.last_login_at as Date | null) ?? null,
    createdAt: row.created_at as Date,
  };
}

function buildUserFilters(query: ListUsersQuery): { where: string[]; params: unknown[] } {
  const where: string[] = [];
  const params: unknown[] = [];
  if (query.role) {
    params.push(query.role);
    where.push(`u.role = $${params.length}`);
  }
  if (query.status === 'active') {
    where.push(`u.is_active = true`);
  } else if (query.status === 'pending') {
    where.push(`u.is_active = false AND u.activated_at IS NULL`);
  } else if (query.status === 'deactivated') {
    where.push(`u.is_active = false AND u.activated_at IS NOT NULL`);
  }
  if (query.q) {
    params.push(`%${query.q}%`);
    where.push(`(u.email ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }
  return { where, params };
}

export async function listUsers(query: ListUsersQuery): Promise<{
  items: AdminUserRow[];
  total: number;
  pending: number;
}> {
  const { where, params } = buildUserFilters(query);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM users u ${whereSql}`, params);
  const result = await pool.query(
    `${USER_SELECT} ${whereSql} ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, query.limit, (query.page - 1) * query.limit],
  );
  const pendingResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM users WHERE is_active = false AND activated_at IS NULL`,
  );
  return {
    items: result.rows.map(toAdminUser),
    total: totalResult.rows[0].total as number,
    pending: pendingResult.rows[0].count as number,
  };
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean,
  actingAdminId: string,
): Promise<AdminUserRow> {
  if (userId === actingAdminId && !isActive) {
    throw new AppError('VALIDATION_ERROR', 'Admins cannot deactivate their own account', 400);
  }
  const result = await pool.query(
    `UPDATE users
        SET is_active = $2,
            activated_at = CASE WHEN $2 AND activated_at IS NULL THEN now() ELSE activated_at END
      WHERE id = $1
      RETURNING id, email, full_name, role, department_id, is_active, activated_at, last_login_at, created_at`,
    [userId, isActive],
  );
  if (!result.rows.length) {
    throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
  }
  const row = result.rows[0] as Record<string, unknown>;
  return {
    ...toAdminUser(row),
    departmentName: null,
  };
}

export async function updateUserRole(
  userId: string,
  role: string,
  actingAdminId: string,
): Promise<AdminUserRow> {
  if (userId === actingAdminId) {
    throw new AppError('VALIDATION_ERROR', 'Admins cannot change their own role', 400);
  }
  const result = await pool.query(
    `UPDATE users SET role = $2 WHERE id = $1
      RETURNING id, email, full_name, role, department_id, is_active, activated_at, last_login_at, created_at`,
    [userId, role],
  );
  if (!result.rows.length) {
    throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
  }
  const row = result.rows[0] as Record<string, unknown>;
  return { ...toAdminUser(row), departmentName: null };
}

export async function listDepartments(query: { page: number; limit: number }): Promise<{
  items: DepartmentRow[];
  total: number;
}> {
  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM departments`);
  const result = await pool.query(
    `SELECT d.id, d.name, d.code, d.created_at,
            (SELECT COUNT(*)::int FROM users u WHERE u.department_id = d.id AND u.role = 'lecturer') AS lecturer_count
       FROM departments d
      ORDER BY d.name
      LIMIT $1 OFFSET $2`,
    [query.limit, (query.page - 1) * query.limit],
  );
  return {
    items: result.rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      code: row.code as string,
      lecturerCount: row.lecturer_count as number,
      createdAt: row.created_at as Date,
    })),
    total: totalResult.rows[0].total as number,
  };
}

export async function createDepartment(input: CreateDepartmentInput): Promise<DepartmentRow> {
  try {
    const result = await pool.query(
      `INSERT INTO departments (name, code) VALUES ($1, $2)
       RETURNING id, name, code, created_at`,
      [input.name, input.code],
    );
    const row = result.rows[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      name: row.name as string,
      code: row.code as string,
      lecturerCount: 0,
      createdAt: row.created_at as Date,
    };
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === '23505') {
      throw new AppError('DEPARTMENT_CODE_TAKEN', 'A department with this code already exists.', 409);
    }
    throw err;
  }
}

export async function updateDepartment(id: string, input: UpdateDepartmentInput): Promise<DepartmentRow> {
  const fields: string[] = [];
  const params: unknown[] = [id];
  let index = 2;
  if (input.name !== undefined) {
    fields.push(`name = $${index}`);
    params.push(input.name);
    index += 1;
  }
  if (input.code !== undefined) {
    fields.push(`code = $${index}`);
    params.push(input.code);
    index += 1;
  }
  try {
    const result = await pool.query(
      `UPDATE departments SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $1
        RETURNING id, name, code, created_at`,
      params,
    );
    if (!result.rows.length) {
      throw new AppError('DEPARTMENT_NOT_FOUND', 'Department not found.', 404);
    }
    const row = result.rows[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      name: row.name as string,
      code: row.code as string,
      lecturerCount: 0,
      createdAt: row.created_at as Date,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === '23505') {
      throw new AppError('DEPARTMENT_CODE_TAKEN', 'A department with this code already exists.', 409);
    }
    throw err;
  }
}

export async function listActivityLogs(query: ListActivityLogsQuery): Promise<{
  items: ActivityLogRow[];
  total: number;
}> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (query.userId) {
    params.push(query.userId);
    where.push(`l.user_id = $${params.length}`);
  }
  if (query.action) {
    params.push(`%${query.action}%`);
    where.push(`l.action ILIKE $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalResult = await pool.query(`SELECT COUNT(*)::int AS total FROM activity_logs l ${whereSql}`, params);
  const result = await pool.query(
    `SELECT l.id, l.user_id, u.full_name AS user_name, l.action, l.entity_type, l.entity_id,
            l.metadata, l.ip_address, l.created_at
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ${whereSql}
      ORDER BY l.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, query.limit, (query.page - 1) * query.limit],
  );
  return {
    items: result.rows.map((row) => ({
      id: row.id as string,
      userId: (row.user_id as string | null) ?? null,
      userName: (row.user_name as string | null) ?? null,
      action: row.action as string,
      entityType: (row.entity_type as string | null) ?? null,
      entityId: (row.entity_id as string | null) ?? null,
      metadata: row.metadata ?? null,
      ipAddress: (row.ip_address as string | null) ?? null,
      createdAt: row.created_at as Date,
    })),
    total: totalResult.rows[0].total as number,
  };
}

export async function getDashboardStats(): Promise<Record<string, unknown>> {
  const counts = await pool.query<{ total_students: number; total_lecturers: number; active_courses: number; pending_lecturers: number; total_enrollments: number; announcements: number }>(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE role = 'student') AS total_students,
       (SELECT COUNT(*)::int FROM users WHERE role = 'lecturer') AS total_lecturers,
       (SELECT COUNT(*)::int FROM courses) AS active_courses,
       (SELECT COUNT(*)::int FROM users WHERE role = 'lecturer' AND is_active = false AND activated_at IS NULL) AS pending_lecturers,
       (SELECT COUNT(*)::int FROM enrollments WHERE status = 'active') AS total_enrollments,
       (SELECT COUNT(*)::int FROM announcements) AS announcements`,
  );
  const atRisk = await getAtRiskStudents();
  const byLevel = atRisk.reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.riskLevel] = (acc[s.riskLevel] ?? 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 },
  );
  const retention = await pool.query<{ day: string; created: number }>(
    `SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS created
       FROM enrollments
      WHERE created_at >= now() - interval '14 days'
      GROUP BY 1 ORDER BY 1`,
  );
  const recentActivity = await pool.query<Record<string, unknown>>(
    `SELECT l.id, l.action, l.entity_type, l.entity_id, l.created_at, u.full_name AS user_name
       FROM activity_logs l
       LEFT JOIN users u ON u.id = l.user_id
      ORDER BY l.created_at DESC
      LIMIT 10`,
  );
  return {
    totalStudents: counts.rows[0].total_students,
    totalLecturers: counts.rows[0].total_lecturers,
    activeCourses: counts.rows[0].active_courses,
    pendingLecturers: counts.rows[0].pending_lecturers,
    totalEnrollments: counts.rows[0].total_enrollments,
    announcements: counts.rows[0].announcements,
    atRisk: { count: atRisk.length, byLevel },
    retention: {
      labels: retention.rows.map((r) => r.day),
      values: retention.rows.map((r) => r.created),
    },
    recentActivity: recentActivity.rows.map((row) => ({
      id: row.id as string,
      action: row.action as string,
      entityType: (row.entity_type as string | null) ?? null,
      entityId: (row.entity_id as string | null) ?? null,
      createdAt: row.created_at as Date,
      userName: (row.user_name as string | null) ?? null,
    })),
  };
}

export interface AtRiskReportRow {
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

export async function getAtRiskReport(opts: { level?: RiskLevel; minScore?: number } = {}): Promise<{
  items: AtRiskReportRow[];
  csv: string;
}> {
  const items = await getAtRiskStudents(opts);
  const csv = toCsv(
    items.map((s) => ({
      studentId: s.studentId,
      name: s.name,
      email: s.email,
      riskLevel: s.riskLevel,
      riskScore: s.riskScore,
      gpa: s.gpa ?? '',
      avgAssignmentPct: s.avgAssignmentPct ?? '',
      avgQuizPct: s.avgQuizPct ?? '',
      lastSnapshotDate: s.lastSnapshotDate ? stringifyValue(s.lastSnapshotDate) : '',
      reasons: s.reasons.join(' | '),
    })),
  );
  return { items, csv };
}

export async function recomputeSnapshots(opts: { courseId?: string }): Promise<{ processed: number }> {
  const processed = opts.courseId
    ? await recomputeCourseSnapshots(opts.courseId)
    : await recomputeAllSnapshots();
  return { processed };
}

export async function listUserPermissions(userId: string): Promise<string[]> {
  const result = await pool.query(`SELECT permission_key FROM permissions WHERE user_id = $1 ORDER BY permission_key`, [userId]);
  return result.rows.map((r) => r.permission_key as string);
}

export async function grantPermission(
  userId: string,
  permission: string,
  actingAdminId: string,
): Promise<{ userId: string; permission: string; granted: boolean }> {
  const userResult = await pool.query(`SELECT id FROM users WHERE id = $1`, [userId]);
  if (!userResult.rows.length) {
    throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
  }
  const result = await pool.query(
    `INSERT INTO permissions (user_id, permission_key) VALUES ($1, $2)
     ON CONFLICT (user_id, permission_key) DO NOTHING RETURNING id`,
    [userId, permission],
  );
  await logActivity({
    userId: actingAdminId,
    action: 'permission_granted',
    entityType: 'permission',
    entityId: userId,
    metadata: { permission },
    ip: null,
  });
  return { userId, permission, granted: result.rows.length > 0 };
}

export async function revokePermission(
  userId: string,
  permission: string,
  actingAdminId: string,
): Promise<{ userId: string; permission: string; revoked: boolean }> {
  const result = await pool.query(`DELETE FROM permissions WHERE user_id = $1 AND permission_key = $2`, [
    userId,
    permission,
  ]);
  await logActivity({
    userId: actingAdminId,
    action: 'permission_revoked',
    entityType: 'permission',
    entityId: userId,
    metadata: { permission },
    ip: null,
  });
  return { userId, permission, revoked: (result.rowCount ?? 0) > 0 };
}
