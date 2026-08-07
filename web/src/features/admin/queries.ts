/**
 * TanStack Query hooks for the admin console. One hook per endpoint, with a
 * stable queryKey per resource so mutations can invalidate precisely.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as api from "./api";
import type {
  AdminRole,
  Announcement,
  AtRiskParams,
  ListActivityLogsParams,
  ListAdminCoursesParams,
  ListAnnouncementsParams,
  ListDepartmentsParams,
  ListUsersParams,
} from "./api";

const DASHBOARD_KEY = ["admin", "dashboard"] as const;

/* ---------- Dashboard ---------- */

export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: api.getDashboardStats,
  });
}

/* ---------- Users ---------- */

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => api.listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.updateUserStatus(userId, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminRole }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

/* ---------- Permissions ---------- */

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["admin", "permissions", userId],
    queryFn: () => api.getUserPermissions(userId),
    enabled: Boolean(userId),
  });
}

export function useGrantPermission(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permission: string) => api.grantPermission(userId, permission),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "permissions", userId] });
    },
  });
}

export function useRevokePermission(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permission: string) => api.revokePermission(userId, permission),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "permissions", userId] });
    },
  });
}

/* ---------- Departments ---------- */

export function useDepartments(params: ListDepartmentsParams) {
  return useQuery({
    queryKey: ["admin", "departments", params],
    queryFn: () => api.listDepartments(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; code?: string } }) =>
      api.updateDepartment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

/* ---------- Activity logs ---------- */

export function useActivityLogs(params: ListActivityLogsParams) {
  return useQuery({
    queryKey: ["admin", "activity", params],
    queryFn: () => api.listActivityLogs(params),
    placeholderData: keepPreviousData,
  });
}

/* ---------- Reports / At-risk ---------- */

export function useAtRiskReport(params: AtRiskParams) {
  return useQuery({
    queryKey: ["admin", "at-risk", params],
    queryFn: () => api.getAtRiskReport(params),
    placeholderData: keepPreviousData,
  });
}

export function useExportAtRisk() {
  return useMutation({
    mutationFn: (params: AtRiskParams) => api.exportAtRiskReport(params),
  });
}

export function useRecomputeSnapshots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId?: string) => api.recomputeSnapshots(courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "at-risk"] });
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/* ---------- Announcements ---------- */

export function useAnnouncements(params: ListAnnouncementsParams) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: () => api.listAnnouncements(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<Pick<Announcement, "title" | "body" | "courseId">>;
    }) => api.updateAnnouncement(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

/* ---------- Courses oversight ---------- */

export function useAdminCourses(params: ListAdminCoursesParams) {
  return useQuery({
    queryKey: ["admin", "courses", params],
    queryFn: () => api.listAdminCourses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "courses", "detail", courseId],
    queryFn: () => api.getCourse(courseId as string),
    enabled: Boolean(courseId),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: api.CreateCourseInput) => api.createCourse(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: api.UpdateCourseInput) => api.updateCourse(courseId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "courses"] });
      qc.invalidateQueries({ queryKey: ["admin", "courses", "detail", courseId] });
    },
  });
}
