/**
 * Admin console API functions — typed wrappers over the Express `/admin/*`,
 * `/announcements`, `/auth` endpoints. Envelope unwrapped in apiClient; these
 * return `data` directly or throw `SageApiError` / `SageNetworkError`.
 */
import { apiFetch, downloadBlob } from "@/lib/apiClient";

/* ---------- Shared types (mirror api/src/modules/** shapes) ---------- */

export type AdminRole = "student" | "lecturer" | "admin";
export type RiskLevel = "low" | "medium" | "high";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
  activatedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UsersResponse {
  items: AdminUser[];
  total: number;
  pending: number;
}

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  lecturerCount: number;
  createdAt: string;
}

export interface DepartmentsResponse {
  items: AdminDepartment[];
  total: number;
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
  createdAt: string;
}

export interface ActivityLogsResponse {
  items: ActivityLogRow[];
  total: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  activeCourses: number;
  pendingLecturers: number;
  totalEnrollments: number;
  announcements: number;
  atRisk: { count: number; byLevel: { low: number; medium: number; high: number } };
  retention: { labels: string[]; values: number[] };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    createdAt: string;
    userName: string | null;
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
  lastSnapshotDate: string | null;
  reasons: string[];
}

export interface AtRiskResponse {
  items: AtRiskStudent[];
  csv: string;
}

export interface AdminCourse {
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
  createdAt: string;
  updatedAt: string;
  enrolledCount: number;
}

export interface AdminCoursesResponse {
  items: AdminCourse[];
  total: number;
}

export interface Announcement {
  id: string;
  courseId: string | null;
  courseTitle: string | null;
  title: string;
  body: string;
  postedBy: string;
  postedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  items: Announcement[];
  total: number;
}

/* ---------- Helpers ---------- */

function qs<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

/* ---------- Dashboard ---------- */

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/admin/dashboard/stats");
}

/* ---------- Users ---------- */

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: AdminRole;
  status?: "active" | "pending" | "deactivated";
  q?: string;
}

export function listUsers(params: ListUsersParams = {}): Promise<UsersResponse> {
  return apiFetch<UsersResponse>(
    `/admin/users${qs({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      role: params.role,
      status: params.status,
      q: params.q,
    })}`,
  );
}

export function updateUserStatus(userId: string, isActive: boolean): Promise<{ user: AdminUser }> {
  return apiFetch<{ user: AdminUser }>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export function updateUserRole(userId: string, role: AdminRole): Promise<{ user: AdminUser }> {
  return apiFetch<{ user: AdminUser }>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
}

export function getUserPermissions(userId: string): Promise<{ userId: string; permissions: string[] }> {
  return apiFetch<{ userId: string; permissions: string[] }>(
    `/admin/users/${userId}/permissions`,
  );
}

export function grantPermission(
  userId: string,
  permission: string,
): Promise<{ userId: string; permission: string; granted: boolean }> {
  return apiFetch<{ userId: string; permission: string; granted: boolean }>(
    `/admin/users/${userId}/permissions`,
    { method: "POST", body: { permission } },
  );
}

export function revokePermission(
  userId: string,
  permission: string,
): Promise<{ userId: string; permission: string; revoked: boolean }> {
  return apiFetch<{ userId: string; permission: string; revoked: boolean }>(
    `/admin/users/${userId}/permissions`,
    { method: "DELETE", body: { permission } },
  );
}

/* ---------- Departments ---------- */

export interface ListDepartmentsParams {
  page?: number;
  limit?: number;
}

export function listDepartments(params: ListDepartmentsParams = {}): Promise<DepartmentsResponse> {
  return apiFetch<DepartmentsResponse>(
    `/admin/departments${qs({ page: params.page ?? 1, limit: params.limit ?? 20 })}`,
  );
}

export function createDepartment(input: {
  name: string;
  code: string;
}): Promise<{ department: AdminDepartment }> {
  return apiFetch<{ department: AdminDepartment }>("/admin/departments", {
    method: "POST",
    body: input,
  });
}

export function updateDepartment(
  id: string,
  input: { name?: string; code?: string },
): Promise<{ department: AdminDepartment }> {
  return apiFetch<{ department: AdminDepartment }>(`/admin/departments/${id}`, {
    method: "PATCH",
    body: input,
  });
}

/* ---------- Activity logs ---------- */

export interface ListActivityLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  userId?: string;
}

export function listActivityLogs(params: ListActivityLogsParams = {}): Promise<ActivityLogsResponse> {
  return apiFetch<ActivityLogsResponse>(
    `/admin/activity-logs${qs({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      action: params.action,
      userId: params.userId,
    })}`,
  );
}

/* ---------- Reports / At-risk ---------- */

export interface AtRiskParams {
  level?: RiskLevel;
  minScore?: number;
}

export function getAtRiskReport(params: AtRiskParams = {}): Promise<AtRiskResponse> {
  return apiFetch<AtRiskResponse>(`/admin/reports/at-risk${qs(params)}`);
}

export async function exportAtRiskReport(params: AtRiskParams = {}): Promise<void> {
  await downloadBlob(`/admin/reports/at-risk/export${qs(params)}`, "at-risk-students.csv");
}

export function recomputeSnapshots(courseId?: string): Promise<{ processed: number }> {
  return apiFetch<{ processed: number }>("/admin/performance/recompute-snapshots", {
    method: "POST",
    body: { courseId },
  });
}

/* ---------- Announcements ---------- */

export interface ListAnnouncementsParams {
  page?: number;
  limit?: number;
}

export function listAnnouncements(params: ListAnnouncementsParams = {}): Promise<AnnouncementsResponse> {
  return apiFetch<AnnouncementsResponse>(
    `/announcements${qs({ page: params.page ?? 1, limit: params.limit ?? 20 })}`,
  );
}

export function createAnnouncement(input: {
  title: string;
  body: string;
  courseId?: string | null;
}): Promise<{ announcement: Announcement; notified: number }> {
  return apiFetch<{ announcement: Announcement; notified: number }>("/announcements", {
    method: "POST",
    body: input,
  });
}

export function updateAnnouncement(
  id: string,
  input: { title?: string; body?: string; courseId?: string | null },
): Promise<{ announcement: Announcement }> {
  return apiFetch<{ announcement: Announcement }>(`/announcements/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteAnnouncement(id: string): Promise<void> {
  return apiFetch<void>(`/announcements/${id}`, { method: "DELETE" });
}

/* ---------- Courses oversight ---------- */

export interface ListAdminCoursesParams {
  page?: number;
  limit?: number;
}

export function listAdminCourses(params: ListAdminCoursesParams = {}): Promise<AdminCoursesResponse> {
  return apiFetch<AdminCoursesResponse>(
    `/admin/courses${qs({ page: params.page ?? 1, limit: params.limit ?? 20 })}`,
  );
}

export interface CreateCourseInput {
  title: string;
  code: string;
  description?: string;
  departmentId?: string;
  creditUnits?: number;
  semester?: string;
  outline?: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput> & {
  departmentId?: string | null;
  creditUnits?: number | null;
  outline?: string | null;
};

export function getCourse(courseId: string): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>(`/courses/${courseId}`);
}

export function createCourse(input: CreateCourseInput): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>("/courses", { method: "POST", body: input });
}

export function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>(`/courses/${courseId}`, {
    method: "PATCH",
    body: input,
  });
}
