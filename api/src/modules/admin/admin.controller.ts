import type { Request, Response } from 'express';
import { paramString } from '../../lib/params';
import { logActivity } from '../../lib/activity';
import { validate, parseBody } from '../../middleware/validate';
import * as adminService from './admin.service';
import {
  listUsersQuerySchema,
  listActivityLogsQuerySchema,
  userStatusSchema,
  userRoleSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  grantPermissionSchema,
  recomputeSnapshotsSchema,
  atRiskQuerySchema,
} from './admin.schema';
import type { AtRiskQuery } from './admin.schema';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const query = parseBody(listUsersQuerySchema, req.query);
  const data = await adminService.listUsers(query);
  res.json({ success: true, data });
}

export const updateUserStatus = [
  validate(userStatusSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = paramString(req.params.userId);
    const { isActive } = req.body as { isActive: boolean };
    const user = await adminService.updateUserStatus(userId, isActive, req.user!.id);
    await logActivity({
      userId: req.user!.id,
      action: isActive ? 'user_activated' : 'user_deactivated',
      entityType: 'user',
      entityId: userId,
      ip: req.ip,
    });
    res.json({ success: true, data: { user } });
  },
];

export const updateUserRole = [
  validate(userRoleSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = paramString(req.params.userId);
    const { role } = req.body as { role: string };
    const user = await adminService.updateUserRole(userId, role, req.user!.id);
    await logActivity({
      userId: req.user!.id,
      action: 'user_role_changed',
      entityType: 'user',
      entityId: userId,
      metadata: { role },
      ip: req.ip,
    });
    res.json({ success: true, data: { user } });
  },
];

export async function getUserPermissions(req: Request, res: Response): Promise<void> {
  const userId = paramString(req.params.userId);
  const permissions = await adminService.listUserPermissions(userId);
  res.json({ success: true, data: { userId, permissions } });
}

export const grantPermission = [
  validate(grantPermissionSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = paramString(req.params.userId);
    const { permission } = req.body as { permission: string };
    const result = await adminService.grantPermission(userId, permission, req.user!.id);
    res.json({ success: true, data: result });
  },
];

export const revokePermission = [
  validate(grantPermissionSchema),
  async (req: Request, res: Response): Promise<void> => {
    const userId = paramString(req.params.userId);
    const { permission } = req.body as { permission: string };
    const result = await adminService.revokePermission(userId, permission, req.user!.id);
    res.json({ success: true, data: result });
  },
];

export async function listDepartments(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const data = await adminService.listDepartments({ page, limit });
  res.json({ success: true, data });
}

export const createDepartment = [
  validate(createDepartmentSchema),
  async (req: Request, res: Response): Promise<void> => {
    const department = await adminService.createDepartment(req.body);
    await logActivity({
      userId: req.user!.id,
      action: 'department_created',
      entityType: 'department',
      entityId: department.id,
      ip: req.ip,
    });
    res.status(201).json({ success: true, data: { department } });
  },
];

export const updateDepartment = [
  validate(updateDepartmentSchema),
  async (req: Request, res: Response): Promise<void> => {
    const id = paramString(req.params.departmentId);
    const department = await adminService.updateDepartment(id, req.body);
    await logActivity({
      userId: req.user!.id,
      action: 'department_updated',
      entityType: 'department',
      entityId: id,
      ip: req.ip,
    });
    res.json({ success: true, data: { department } });
  },
];

export async function listActivityLogs(req: Request, res: Response): Promise<void> {
  const query = parseBody(listActivityLogsQuerySchema, req.query);
  const data = await adminService.listActivityLogs(query);
  res.json({ success: true, data });
}

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const stats = await adminService.getDashboardStats();
  res.json({ success: true, data: stats });
}

export async function getAtRiskReport(req: Request, res: Response): Promise<void> {
  const query = parseBody(atRiskQuerySchema, req.query) as AtRiskQuery;
  const data = await adminService.getAtRiskReport(query);
  res.json({ success: true, data });
}

export async function exportAtRiskReport(req: Request, res: Response): Promise<void> {
  const query = parseBody(atRiskQuerySchema, req.query) as AtRiskQuery;
  const { csv } = await adminService.getAtRiskReport(query);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="at-risk-students.csv"');
  res.status(200).send(csv);
}

export const recomputeSnapshots = [
  validate(recomputeSnapshotsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.body as { courseId?: string };
    const { processed } = await adminService.recomputeSnapshots({ courseId });
    await logActivity({
      userId: req.user!.id,
      action: 'performance.snapshots_recomputed',
      entityType: 'performance_snapshot',
      metadata: { courseId: courseId ?? null, processed },
      ip: req.ip,
    });
    res.json({ success: true, data: { processed } });
  },
];
